package com.mehfil.artist;

import com.mehfil.common.Dto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** Secured by SecurityConfig: /api/admin/** requires ROLE_ADMIN. */
@RestController @RequestMapping("/api/admin/artists") @RequiredArgsConstructor
public class AdminController {
    private final ArtistProfileRepository profiles;
    private final ArtistService artists;

    @GetMapping("/pending")
    public List<Dto.ArtistDetail> pending() {
        return profiles.findByVerificationStatus(VerificationStatus.PENDING).stream().map(artists::toDetail).toList();
    }
    @PostMapping("/{id}/approve")
    public Dto.ArtistDetail approve(@PathVariable Long id) { return artists.setStatus(id, VerificationStatus.APPROVED); }
    @PostMapping("/{id}/reject")
    public Dto.ArtistDetail reject(@PathVariable Long id) { return artists.setStatus(id, VerificationStatus.REJECTED); }
}
