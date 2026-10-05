package com.mehfil.artist;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

/** Posts (text / photo / video), feed, favourite artists and saved posts. Plain SQL via JdbcClient to keep it small. */
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class SocialController {
    private final JdbcClient db;

    private static final String POSTS = """
        select p.id, p.type, p.text, p.media_url as "mediaUrl", p.created_at as "createdAt",
               a.id as "artistId", a.slug as "artistSlug", a.stage_name as "artistName", a.avatar_url as "avatarUrl"
        from posts p join artist_profiles a on a.id = p.artist_id """;

    public record PostReq(@Pattern(regexp = "TEXT|PHOTO|VIDEO", message = "Invalid post type") String type,
                          @Size(max = 2000) String text, @Size(max = 600) String mediaUrl) {}

    @GetMapping("/feed")
    public List<Map<String, Object>> feed() {
        return db.sql(POSTS + "where a.verification_status = 'APPROVED' order by p.created_at desc limit 30").query().listOfRows();
    }

    @GetMapping("/artists/{slug}/posts")
    public List<Map<String, Object>> byArtist(@PathVariable String slug) {
        return db.sql(POSTS + "where a.slug = :s and a.verification_status = 'APPROVED' order by p.created_at desc limit 100")
            .param("s", slug).query().listOfRows();
    }

    @PostMapping("/me/posts") @PreAuthorize("hasRole('ARTIST')")
    public Map<String, Object> create(@AuthenticationPrincipal Long uid, @Valid @RequestBody PostReq r) {
        Long artistId = db.sql("select id from artist_profiles where user_id = :u").param("u", uid).query(Long.class).optional()
            .orElseThrow(() -> bad("Create your artist profile first."));
        boolean text = r.text() != null && !r.text().isBlank();
        if (r.type().equals("TEXT") && !text) throw bad("Write something to post.");
        if (!r.type().equals("TEXT")) {
            if (r.mediaUrl() == null || !r.mediaUrl().startsWith("https://")) throw bad("Add a photo or video first.");
        }
        db.sql("insert into posts (artist_id, type, text, media_url) values (:a, :t, :x, :m)")
            .param("a", artistId).param("t", r.type()).param("x", text ? r.text().trim() : null)
            .param("m", r.type().equals("TEXT") ? null : r.mediaUrl()).update();
        return Map.of("ok", true);
    }

    @DeleteMapping("/me/posts/{id}") @PreAuthorize("hasRole('ARTIST')")
    public Map<String, Object> delete(@AuthenticationPrincipal Long uid, @PathVariable long id) {
        int n = db.sql("delete from posts where id = :id and artist_id = (select id from artist_profiles where user_id = :u)")
            .param("id", id).param("u", uid).update();
        if (n == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        return Map.of("ok", true);
    }

    @PutMapping("/me/favorites/{artistId}")
    public Map<String, Object> fav(@AuthenticationPrincipal Long uid, @PathVariable long artistId) {
        db.sql("insert into favorite_artists values (:u, :a) on conflict do nothing").param("u", uid).param("a", artistId).update();
        return Map.of("ok", true);
    }

    @DeleteMapping("/me/favorites/{artistId}")
    public Map<String, Object> unfav(@AuthenticationPrincipal Long uid, @PathVariable long artistId) {
        db.sql("delete from favorite_artists where user_id = :u and artist_id = :a").param("u", uid).param("a", artistId).update();
        return Map.of("ok", true);
    }

    @PutMapping("/me/saved/{postId}")
    public Map<String, Object> save(@AuthenticationPrincipal Long uid, @PathVariable long postId) {
        db.sql("insert into saved_posts select :u, id from posts where id = :p on conflict do nothing").param("u", uid).param("p", postId).update();
        return Map.of("ok", true);
    }

    @DeleteMapping("/me/saved/{postId}")
    public Map<String, Object> unsave(@AuthenticationPrincipal Long uid, @PathVariable long postId) {
        db.sql("delete from saved_posts where user_id = :u and post_id = :p").param("u", uid).param("p", postId).update();
        return Map.of("ok", true);
    }

    /** Everything the signed-in person has saved: artists and posts. */
    @GetMapping("/me/library")
    public Map<String, Object> library(@AuthenticationPrincipal Long uid) {
        var artists = db.sql("""
            select a.id, a.slug, a.stage_name as "stageName", a.city, a.avatar_url as "avatarUrl", a.starting_price as "startingPrice",
                   a.avg_rating as rating, c.name as category, true as verified
            from favorite_artists f join artist_profiles a on a.id = f.artist_id join categories c on c.id = a.category_id
            where f.user_id = :u""").param("u", uid).query().listOfRows();
        var posts = db.sql(POSTS + "join saved_posts s on s.post_id = p.id where s.user_id = :u order by p.created_at desc")
            .param("u", uid).query().listOfRows();
        return Map.of("artists", artists, "posts", posts);
    }

    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
}
