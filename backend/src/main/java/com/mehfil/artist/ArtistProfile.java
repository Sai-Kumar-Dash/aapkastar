package com.mehfil.artist;

import com.mehfil.auth.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "artist_profiles") @Getter @Setter @NoArgsConstructor
public class ArtistProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    private String stageName;
    @Column(unique = true) private String slug;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "category_id") private Category category;
    private String city;
    @Column(columnDefinition = "text") private String bio;
    private String languages; // comma separated for now
    private int experienceYears;
    private int startingPrice;
    @Enumerated(EnumType.STRING) private VerificationStatus verificationStatus = VerificationStatus.DRAFT;
    private double avgRating;
    private int bookingsCount;
    private String avatarUrl;
    private String coverUrl;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
