package com.mehfil.artist;

import com.mehfil.common.Dto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class ArtistController {
    private final ArtistService artists;
    private final CategoryRepository categories;

    @GetMapping("/categories")
    public List<Dto.CategoryDto> categories() {
        return categories.findAll().stream().map(c -> new Dto.CategoryDto(c.getId(), c.getName(), c.getSlug())).toList();
    }

    @GetMapping("/artists")
    public Page<Dto.ArtistCard> search(@RequestParam(required = false) String category,
                                       @RequestParam(required = false) String city,
                                       @RequestParam(required = false) Integer maxPrice,
                                       @RequestParam(required = false) String q,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "12") int size,
                                       @RequestParam(defaultValue = "rating") String sort) {
        return artists.search(category, city, maxPrice, q, page, size, sort);
    }

    @GetMapping("/artists/{slug}")
    public Dto.ArtistDetail detail(@PathVariable String slug) { return artists.bySlug(slug); }

    @GetMapping("/me/artist-profile") @PreAuthorize("hasRole('ARTIST')")
    public Dto.ArtistDetail mine(@AuthenticationPrincipal Long userId) { return artists.mine(userId); }

    @PutMapping("/me/artist-profile") @PreAuthorize("hasRole('ARTIST')")
    public Dto.ArtistDetail save(@AuthenticationPrincipal Long userId, @Valid @RequestBody Dto.ArtistUpsert body) {
        return artists.upsert(userId, body);
    }
}
