package com.mehfil.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class MembershipService {
    public boolean active(User u) {
        return u.getMembershipExpiresAt() != null && u.getMembershipExpiresAt().isAfter(Instant.now()) && !"FREE".equals(u.getMembershipPlan());
    }
    public boolean canComment(User u) { return active(u); }
    public int discount(User u) {
        if (!active(u)) return 0;
        return "PRO".equalsIgnoreCase(u.getMembershipPlan()) ? 20 : 10;
    }
}
