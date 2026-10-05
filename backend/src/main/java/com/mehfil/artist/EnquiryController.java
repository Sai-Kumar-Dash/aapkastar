package com.mehfil.artist;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Booking requests: customer asks an artist for a quote, the artist accepts or declines. */
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class EnquiryController {
    private final JdbcClient db;

    public record Req(@NotBlank @Size(max = 40) String eventType,
                      @NotNull(message = "Pick an event date") @FutureOrPresent(message = "Pick a date in the future") LocalDate eventDate,
                      @NotBlank @Size(max = 80) String city,
                      @Min(0) Integer guests, @Min(0) Integer budget, @Size(max = 1000) String message) {}

    @PostMapping("/artists/{artistId}/enquiries") @PreAuthorize("hasRole('CUSTOMER')")
    public Map<String, Object> create(@AuthenticationPrincipal Long uid, @PathVariable long artistId, @Valid @RequestBody Req r) {
        long ok = db.sql("select count(*) from artist_profiles where id = :a and verification_status = 'APPROVED'")
            .param("a", artistId).query(Long.class).single();
        if (ok == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found");
        db.sql("insert into enquiries (artist_id, customer_id, event_type, event_date, city, guests, budget, message) values (:a,:c,:t,:d,:y,:g,:b,:m)")
            .param("a", artistId).param("c", uid).param("t", r.eventType()).param("d", r.eventDate()).param("y", r.city().trim())
            .param("g", r.guests()).param("b", r.budget())
            .param("m", r.message() == null || r.message().isBlank() ? null : r.message().trim()).update();
        return Map.of("ok", true);
    }

    @GetMapping("/me/enquiries")
    public List<Map<String, Object>> mine(@AuthenticationPrincipal Long uid, Authentication auth) {
        boolean artist = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ARTIST"));
        return db.sql("""
            select e.id, e.event_type as "eventType", e.event_date as "eventDate", e.city, e.guests, e.budget, e.message, e.status,
                   e.created_at as "createdAt", a.stage_name as "artistName", a.slug as "artistSlug", u.name as "customerName"
            from enquiries e join artist_profiles a on a.id = e.artist_id join users u on u.id = e.customer_id
            where """ + (artist ? " a.user_id = :u" : " e.customer_id = :u") + " order by e.created_at desc limit 200")
            .param("u", uid).query().listOfRows();
    }

    @PostMapping("/me/enquiries/{id}/{status}") @PreAuthorize("hasRole('ARTIST')")
    public Map<String, Object> decide(@AuthenticationPrincipal Long uid, @PathVariable long id, @PathVariable String status) {
        if (!status.equals("ACCEPTED") && !status.equals("DECLINED")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        int n = db.sql("update enquiries set status = :s where id = :id and artist_id = (select id from artist_profiles where user_id = :u)")
            .param("s", status).param("id", id).param("u", uid).update();
        if (n == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        return Map.of("ok", true);
    }
}
