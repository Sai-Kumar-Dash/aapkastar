package com.mehfil.auth;

import com.mehfil.common.Dto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;
    private final UserRepository users;

    @PostMapping("/auth/otp/send")
    public Dto.SendResponse send(@Valid @RequestBody Dto.OtpSend r) {
        return new Dto.SendResponse("Code sent", auth.sendOtp(r.phone()));
    }

    @PostMapping("/auth/otp/verify")
    public Dto.AuthResponse verify(@Valid @RequestBody Dto.OtpVerify r) { return auth.verify(r); }

    @PostMapping("/auth/register")
    public Dto.AuthResponse register(@Valid @RequestBody Dto.Register r) { return auth.register(r); }

    @PostMapping("/auth/phone/register")
    public Dto.AuthResponse phoneRegister(@Valid @RequestBody Dto.PhoneRegister r) { return auth.phoneRegister(r); }

    @PostMapping("/auth/phone/login")
    public Dto.AuthResponse phoneLogin(@Valid @RequestBody Dto.PhoneLogin r) { return auth.phoneLogin(r); }

    @PostMapping("/auth/login")
    public Dto.AuthResponse login(@Valid @RequestBody Dto.Login r) { return auth.login(r); }

    @PostMapping("/auth/google")
    public Dto.AuthResponse google(@Valid @RequestBody Dto.GoogleLogin r) { return auth.google(r); }

    @PostMapping("/auth/google/complete")
    public Dto.AuthResponse googleComplete(@Valid @RequestBody Dto.GoogleComplete r) { return auth.googleComplete(r); }

    @GetMapping("/me")
    public Dto.UserDto me(@AuthenticationPrincipal Long userId) {
        return users.findById(userId).map(AuthService::toDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
    }
}
