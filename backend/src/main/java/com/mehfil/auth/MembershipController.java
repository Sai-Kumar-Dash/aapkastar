package com.mehfil.auth;

import com.mehfil.common.Dto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class MembershipController {
    private final UserRepository users;
    private final MembershipService memberships;

    @GetMapping("/membership/plans")
    public Object plans() {
        return new Object[]{
            Map.of("id","PLUS","name","Plus","price",49,"discount",10,"commenting",true),
            Map.of("id","PRO","name","Pro","price",149,"discount",20,"commenting",true)
        };
    }

    @GetMapping("/me/membership")
    public Map<String,Object> me(@AuthenticationPrincipal Long uid) {
        User u=users.findById(uid).orElseThrow();
        boolean active=memberships.active(u);
        return Map.of("plan",active?u.getMembershipPlan():"FREE","active",active,
            "expiresAt",u.getMembershipExpiresAt()==null?"":u.getMembershipExpiresAt().toString(),
            "discountPercent",memberships.discount(u));
    }
}
