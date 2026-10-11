package com.mehfil.artist;

import com.mehfil.auth.User;
import com.mehfil.auth.UserRepository;
import com.mehfil.common.Dto;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;

@Service @RequiredArgsConstructor
public class ArtistService {
    private final ArtistProfileRepository profiles;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final JdbcClient db;
    @Value("${app.auto-approve-artists}") private boolean autoApprove;

    public Page<Dto.ArtistCard> search(String category, String city, Integer maxPrice, String q, int page, int size, String sort) {
        Specification<ArtistProfile> spec = (root, cq, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.equal(root.get("verificationStatus"), VerificationStatus.APPROVED));
            if (StringUtils.hasText(category)) p.add(cb.equal(root.get("category").get("slug"), category.toLowerCase()));
            if (StringUtils.hasText(city)) p.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            if (maxPrice != null) p.add(cb.lessThanOrEqualTo(root.get("startingPrice"), maxPrice));
            if (StringUtils.hasText(q)) {
                String like = "%" + q.trim().toLowerCase() + "%";
                p.add(cb.or(cb.like(cb.lower(root.get("stageName")), like),
                            cb.like(cb.lower(root.get("bio")), like),
                            cb.like(cb.lower(root.get("languages")), like)));
            }
            return cb.and(p.toArray(new Predicate[0]));
        };
        Sort s = switch (sort == null ? "" : sort) {
            case "price" -> Sort.by("startingPrice").ascending();
            case "exp" -> Sort.by("experienceYears").descending();
            default -> Sort.by("avgRating").descending().and(Sort.by("bookingsCount").descending());
        };
        return profiles.findAll(spec, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), s)).map(this::toCard);
    }

    public Dto.ArtistDetail bySlug(String slug) {
        return profiles.findBySlugAndVerificationStatus(slug, VerificationStatus.APPROVED).map(this::toDetail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
    }

    public Dto.ArtistDetail mine(Long userId) {
        return profiles.findByUserId(userId).map(this::toDetail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Create your artist profile first"));
    }

    public Dto.ArtistDetail upsert(Long userId, Dto.ArtistUpsert r) {
        User u = users.findById(userId).orElseThrow();
        Category cat = categories.findBySlug(r.categorySlug().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category"));
        ArtistProfile p = profiles.findByUserId(userId).orElseGet(() -> {
            ArtistProfile n = new ArtistProfile();
            n.setUser(u);
            n.setSlug(uniqueSlug(r.stageName() + " " + r.city()));
            return n;
        });
        p.setStageName(r.stageName().trim()); p.setCategory(cat); p.setCity(r.city().trim());
        p.setAvatarUrl(r.avatarUrl()); p.setCoverUrl(r.coverUrl()); p.setBio(r.bio()); p.setExperienceYears(r.experienceYears()); p.setStartingPrice(r.startingPrice());
        p.setLanguages(r.languages() == null ? "" : String.join(",", r.languages()));
        if (p.getVerificationStatus() == VerificationStatus.DRAFT || p.getVerificationStatus() == VerificationStatus.REJECTED)
            p.setVerificationStatus(autoApprove ? VerificationStatus.APPROVED : VerificationStatus.PENDING);
        p.setUpdatedAt(Instant.now());
        return toDetail(profiles.save(p));
    }

    public Dto.ArtistDetail setStatus(Long profileId, VerificationStatus status) {
        ArtistProfile p = profiles.findById(profileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
        p.setVerificationStatus(status);
        return toDetail(profiles.save(p));
    }

    private String uniqueSlug(String base) {
        String s = base.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        String slug = s; int i = 2;
        while (profiles.existsBySlug(slug)) slug = s + "-" + i++;
        return slug;
    }

    private static List<String> langs(String s) { return StringUtils.hasText(s) ? Arrays.asList(s.split(",")) : List.of(); }

    public Dto.ArtistCard toCard(ArtistProfile p) {
        long followers = db.sql("select count(*) from follows where artist_id = :a").param("a", p.getId()).query(Long.class).single();
        return new Dto.ArtistCard(p.getId(), p.getSlug(), p.getStageName(), p.getCategory().getName(), p.getCity(),
            p.getAvgRating(), p.getBookingsCount(), (int) followers, p.getStartingPrice(), p.getVerificationStatus() == VerificationStatus.APPROVED, p.getAvatarUrl());
    }

    public Dto.ArtistDetail toDetail(ArtistProfile p) {
        return new Dto.ArtistDetail(p.getId(), p.getSlug(), p.getStageName(), p.getCategory().getName(), p.getCity(), p.getBio(),
            langs(p.getLanguages()), p.getExperienceYears(), p.getAvgRating(), p.getBookingsCount(), p.getStartingPrice(),
            p.getVerificationStatus() == VerificationStatus.APPROVED, p.getVerificationStatus().name(), p.getAvatarUrl(), p.getCoverUrl());
    }
}
