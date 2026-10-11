package com.mehfil.auth;

import com.mehfil.common.Dto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController @RequestMapping("/api/me") @RequiredArgsConstructor
public class ProfileController {
    private final UserRepository users;
    private final org.springframework.security.crypto.password.PasswordEncoder encoder;

    @GetMapping("/profile")
    public Dto.UserDto profile(@AuthenticationPrincipal Long uid) {
        return users.findById(uid).map(AuthService::toDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
    }

    @PutMapping("/profile")
    public Dto.UserDto update(@AuthenticationPrincipal Long uid, @Valid @RequestBody Dto.ProfileUpdate r) {
        User u = users.findById(uid).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        u.setName(r.name().trim());
        u.setAvatarUrl(r.avatarUrl());
        return AuthService.toDto(users.save(u));
    }
    /** Lets a Google-created account add a mobile number + password so it can also log in with those. */
    @PutMapping("/credentials")
    public Dto.UserDto credentials(@AuthenticationPrincipal Long uid, @Valid @RequestBody Dto.Credentials r) {
        User u = users.findById(uid).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        String phone = r.phone().trim();
        if (users.findByPhone(phone).filter(x -> !x.getId().equals(u.getId())).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That mobile number is already linked to another account.");
        u.setPhone(phone); u.setPasswordHash(encoder.encode(r.password()));
        return AuthService.toDto(users.save(u));
    }
}
