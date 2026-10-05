package com.mehfil.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long ttlMs;

    public JwtService(@Value("${app.jwt-secret}") String secret, @Value("${app.jwt-ttl-hours}") long hours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlMs = hours * 3_600_000L;
    }

    public String issue(User u) {
        Date now = new Date();
        return Jwts.builder().subject(String.valueOf(u.getId())).claim("role", u.getRole().name())
            .issuedAt(now).expiration(new Date(now.getTime() + ttlMs)).signWith(key).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
