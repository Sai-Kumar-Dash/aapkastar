package com.mehfil.artist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

public interface ArtistProfileRepository extends JpaRepository<ArtistProfile, Long>, JpaSpecificationExecutor<ArtistProfile> {
    Optional<ArtistProfile> findByUserId(Long userId);
    Optional<ArtistProfile> findBySlugAndVerificationStatus(String slug, VerificationStatus status);
    boolean existsBySlug(String slug);
    List<ArtistProfile> findByVerificationStatus(VerificationStatus status);
}
