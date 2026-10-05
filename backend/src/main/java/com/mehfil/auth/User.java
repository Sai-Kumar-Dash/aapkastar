package com.mehfil.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "users") @Getter @Setter @NoArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true) private String phone;
    private String passwordHash;
    private String email;
    @Column(nullable = false) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    private Instant createdAt = Instant.now();
}
