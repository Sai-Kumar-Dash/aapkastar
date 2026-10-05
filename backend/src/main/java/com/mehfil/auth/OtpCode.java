package com.mehfil.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "otp_codes") @Getter @Setter @NoArgsConstructor
public class OtpCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String phone;
    private String codeHash;
    private Instant expiresAt;
    private int attempts;
    private boolean consumed;
    private Instant createdAt = Instant.now();
}
