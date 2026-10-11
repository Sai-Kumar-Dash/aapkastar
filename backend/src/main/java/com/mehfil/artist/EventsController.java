package com.mehfil.artist;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import com.mehfil.auth.MembershipService;
import com.mehfil.auth.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Creator events, follows, event comments, notifications, and the home feed (events + bot news). */
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class EventsController {
    private final JdbcClient db;
    private final UserRepository users;
    private final MembershipService memberships;

    private static final String EV = """
        select e.id, e.title, e.description, e.venue, e.city, e.starts_at as "startsAt", e.ticket_price as "ticketPrice",
               a.id as "artistId", a.slug as "artistSlug", a.stage_name as "artistName", a.avatar_url as "avatarUrl", a.cover_url as "coverUrl",
               (select count(*) from event_comments c where c.event_id = e.id) as comments,
               e.created_at as "createdAt",
               (select count(*) from votes v where v.kind = 'EVENT' and v.item_id = e.id) as votes
        from events e join artist_profiles a on a.id = e.artist_id where a.verification_status = 'APPROVED' """;

    public record EventReq(@NotBlank @Size(max = 140) String title, @Size(max = 2000) String description,
                           @Size(max = 160) String venue, @NotBlank @Size(max = 80) String city,
                           @NotNull(message = "Pick a date and time") @Future(message = "Pick a future date and time") LocalDateTime startsAt,
                           @Min(0) Integer ticketPrice) {}
    public record CommentReq(@NotBlank @Size(max = 500) String body) {}

    @GetMapping("/home")
    public Map<String, Object> home() {
        var events = db.sql(EV + "and e.starts_at > now() order by e.starts_at limit 12").query().listOfRows();
        var news = db.sql("""
            select n.id, n.headline, n.body, n.created_at as "createdAt", n.event_id as "eventId"
            from news n order by n.created_at desc limit 8""").query().listOfRows();
        return Map.of("events", events, "news", news);
    }

    @GetMapping("/artists/{slug}/events")
    public List<Map<String, Object>> byArtist(@PathVariable String slug) {
        return db.sql(EV + "and a.slug = :s order by e.starts_at desc limit 50").param("s", slug).query().listOfRows();
    }

    @GetMapping("/events/{id}")
    public Map<String, Object> one(@PathVariable long id) {
        var e = db.sql(EV + "and e.id = :id").param("id", id).query().listOfRows();
        if (e.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        var c = db.sql("""
            select c.id, c.body, c.created_at as "createdAt", u.name from event_comments c
            join users u on u.id = c.user_id where c.event_id = :id order by c.created_at desc limit 100""")
            .param("id", id).query().listOfRows();
        return Map.of("event", e.get(0), "comments", c);
    }

    @PostMapping("/me/events") @PreAuthorize("hasRole('ARTIST')")
    public Map<String, Object> create(@AuthenticationPrincipal Long uid, @Valid @RequestBody EventReq r) {
        var rows = db.sql("select id, stage_name as name from artist_profiles where user_id = :u and verification_status = 'APPROVED'")
            .param("u", uid).query().listOfRows();
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete and publish your artist profile first.");
        long aid = ((Number) rows.get(0).get("id")).longValue();
        String name = (String) rows.get(0).get("name");
        var when = r.startsAt().atZone(ZoneId.of("Asia/Kolkata")).toOffsetDateTime();
        long id = db.sql("insert into events (artist_id, title, description, venue, city, starts_at, ticket_price) values (:a,:t,:d,:v,:c,:s,:p) returning id")
            .param("a", aid).param("t", r.title().trim()).param("d", r.description()).param("v", r.venue())
            .param("c", r.city().trim()).param("s", when).param("p", r.ticketPrice()).query(Long.class).single();
        // The bot posts the news item and alerts followers.
        String pretty = r.startsAt().format(DateTimeFormatter.ofPattern("d MMM, h:mm a", Locale.ENGLISH));
        db.sql("insert into news (artist_id, event_id, headline, body) values (:a,:e,:h,:b)")
            .param("a", aid).param("e", id).param("h", "📣 " + name + " just announced " + r.title().trim())
            .param("b", r.city().trim() + " · " + pretty).update();
        db.sql("insert into notifications (user_id, text, link) select user_id, :t, :l from follows where artist_id = :a")
            .param("t", name + " announced " + r.title().trim() + " in " + r.city().trim()).param("l", "#/event/" + id).param("a", aid).update();
        return Map.of("id", id);
    }

    @DeleteMapping("/me/events/{id}") @PreAuthorize("hasRole('ARTIST')")
    public Map<String, Object> delete(@AuthenticationPrincipal Long uid, @PathVariable long id) {
        int n = db.sql("delete from events where id = :id and artist_id = (select id from artist_profiles where user_id = :u)")
            .param("id", id).param("u", uid).update();
        if (n == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        return Map.of("ok", true);
    }

    @PostMapping("/events/{id}/comments")
    public Map<String, Object> comment(@AuthenticationPrincipal Long uid, @PathVariable long id, @Valid @RequestBody CommentReq r) {
        var u = users.findById(uid).orElseThrow();
        if (!memberships.canComment(u)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Plus or Pro membership is required to comment.");
        int n = db.sql("insert into event_comments (event_id, user_id, body) select id, :u, :b from events where id = :id")
            .param("u", uid).param("b", r.body().trim()).param("id", id).update();
        if (n == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        return Map.of("ok", true);
    }

    @GetMapping("/me/following-feed")
    public Map<String,Object> followingFeed(@AuthenticationPrincipal Long uid) {
        var events = db.sql(EV + "and e.starts_at > now() and exists (select 1 from follows f where f.artist_id=e.artist_id and f.user_id=:u) order by e.starts_at limit 30")
            .param("u", uid).query().listOfRows();
        var posts = db.sql("""
            select p.id,p.type,p.text,p.media_url as "mediaUrl",p.created_at as "createdAt",
                   a.id as "artistId",a.slug as "artistSlug",a.stage_name as "artistName",a.avatar_url as "avatarUrl",
                   (select count(*) from votes v where v.kind='POST' and v.item_id=p.id) as votes,
                   (select count(*) from post_comments c where c.post_id=p.id) as comments
            from posts p join artist_profiles a on a.id=p.artist_id
            where a.verification_status='APPROVED' and exists (select 1 from follows f where f.artist_id=a.id and f.user_id=:u)
            order by p.created_at desc limit 30""").param("u", uid).query().listOfRows();
        return Map.of("events",events,"posts",posts);
    }

    @GetMapping("/me/follows")
    public List<Long> follows(@AuthenticationPrincipal Long uid) {
        return db.sql("select artist_id from follows where user_id = :u").param("u", uid).query(Long.class).list();
    }
    @PutMapping("/me/follows/{artistId}")
    public Map<String, Object> follow(@AuthenticationPrincipal Long uid, @PathVariable long artistId) {
        db.sql("insert into follows select :u, id from artist_profiles where id = :a on conflict do nothing").param("u", uid).param("a", artistId).update();
        return Map.of("ok", true);
    }
    @DeleteMapping("/me/follows/{artistId}")
    public Map<String, Object> unfollow(@AuthenticationPrincipal Long uid, @PathVariable long artistId) {
        db.sql("delete from follows where user_id = :u and artist_id = :a").param("u", uid).param("a", artistId).update();
        return Map.of("ok", true);
    }

    @GetMapping("/me/notifications")
    public Map<String, Object> notifications(@AuthenticationPrincipal Long uid) {
        var items = db.sql("""
            select id, text, link, is_read as "isRead", created_at as "createdAt" from notifications
            where user_id = :u order by created_at desc limit 50""").param("u", uid).query().listOfRows();
        return Map.of("items", items);
    }
    @PostMapping("/me/notifications/read")
    public Map<String, Object> markRead(@AuthenticationPrincipal Long uid) {
        db.sql("update notifications set is_read = true where user_id = :u").param("u", uid).update();
        return Map.of("ok", true);
    }

    @GetMapping("/me/votes")
    public List<String> myVotes(@AuthenticationPrincipal Long uid) {
        return db.sql("select concat(kind, '-', item_id) from votes where user_id = :u").param("u", uid).query(String.class).list();
    }
    @PutMapping("/me/votes/{kind}/{id}")
    public Map<String, Object> vote(@AuthenticationPrincipal Long uid, @PathVariable String kind, @PathVariable long id) {
        if (!kind.equals("EVENT") && !kind.equals("POST")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid vote");
        db.sql("insert into votes (user_id, kind, item_id) values (:u, :k, :i) on conflict do nothing").param("u", uid).param("k", kind).param("i", id).update();
        return Map.of("ok", true);
    }
    @DeleteMapping("/me/votes/{kind}/{id}")
    public Map<String, Object> unvote(@AuthenticationPrincipal Long uid, @PathVariable String kind, @PathVariable long id) {
        db.sql("delete from votes where user_id = :u and kind = :k and item_id = :i").param("u", uid).param("k", kind).param("i", id).update();
        return Map.of("ok", true);
    }
}
