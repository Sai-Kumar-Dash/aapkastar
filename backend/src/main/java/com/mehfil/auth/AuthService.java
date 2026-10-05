package com.mehfil.auth;

import com.mehfil.common.Dto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.client.RestClient;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private static final int MAX_ATTEMPTS = 5, MAX_SENDS_PER_10_MIN = 5;
    private final OtpRepository otps;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final SecureRandom rnd = new SecureRandom();
    @Value("${app.dev-mode}") private boolean devMode;
    @Value("${app.google-client-id}") private String googleClientId;

    /** Returns the plain code only in dev mode. In production, send it via an SMS provider (MSG91, Twilio, etc.). */
    public String sendOtp(String phone) {
        long recent = otps.countByPhoneAndCreatedAtAfter(phone, Instant.now().minus(10, ChronoUnit.MINUTES));
        if (recent >= MAX_SENDS_PER_10_MIN)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many codes requested. Try again in a few minutes.");
        String code = String.format("%06d", rnd.nextInt(1_000_000));
        OtpCode o = new OtpCode();
        o.setPhone(phone);
        o.setCodeHash(encoder.encode(code));
        o.setExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES));
        otps.save(o);
        if (devMode) { log.info("DEV OTP for {}: {}", phone, code); return code; }
        // TODO: smsProvider.send(phone, "Your AapkaStar code is " + code);
        return null;
    }

    // Deliberately NOT @Transactional: failed-attempt counters must persist even when we throw.
    public Dto.AuthResponse verify(Dto.OtpVerify r) {
        OtpCode otp = otps.findFirstByPhoneAndConsumedFalseOrderByCreatedAtDesc(r.phone())
            .orElseThrow(() -> bad("No code requested for this number. Request a new code."));
        if (otp.getExpiresAt().isBefore(Instant.now()) || otp.getAttempts() >= MAX_ATTEMPTS)
            throw bad("This code has expired. Request a new one.");
        otp.setAttempts(otp.getAttempts() + 1);
        if (!encoder.matches(r.code(), otp.getCodeHash())) { otps.save(otp); throw bad("That code is incorrect."); }

        Optional<User> existing = users.findByPhone(r.phone());
        if (existing.isEmpty() && (r.name() == null || r.name().isBlank() || r.role() == null)) {
            otps.save(otp); // code stays valid so the person can sign up with it
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found for this number. Please sign up first.");
        }
        if (existing.isEmpty() && r.role() == Role.ADMIN) throw bad("Invalid role.");

        otp.setConsumed(true);
        otps.save(otp);
        boolean isNew = existing.isEmpty();
        User u = existing.orElseGet(() -> {
            User n = new User();
            n.setPhone(r.phone()); n.setName(r.name().trim()); n.setRole(r.role());
            return users.save(n);
        });
        return new Dto.AuthResponse(jwt.issue(u), toDto(u), isNew);
    }

    public Dto.AuthResponse register(Dto.Register r) {
        if (r.role() == null || r.role() == Role.ADMIN) throw bad("Choose whether you are an artist or a customer.");
        String email = r.email().trim().toLowerCase();
        if (users.findByEmail(email).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists. Log in instead.");
        User n = new User();
        n.setEmail(email); n.setName(r.name().trim()); n.setRole(r.role()); n.setPasswordHash(encoder.encode(r.password()));
        User u = users.save(n);
        return new Dto.AuthResponse(jwt.issue(u), toDto(u), true);
    }

    public Dto.AuthResponse login(Dto.Login r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
            .filter(x -> x.getPasswordHash() != null && encoder.matches(r.password(), x.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password."));
        return new Dto.AuthResponse(jwt.issue(u), toDto(u), false);
    }

    /** Verifies a Google ID token via Google's tokeninfo endpoint (checks signature, expiry and audience). */
    @SuppressWarnings("unchecked")
    public Dto.AuthResponse google(Dto.GoogleLogin r) {
        Map<String, Object> g;
        try {
            g = RestClient.create().get().uri("https://oauth2.googleapis.com/tokeninfo?id_token={t}", r.idToken()).retrieve().body(Map.class);
        } catch (Exception e) { throw bad("Google sign-in failed. Try again."); }
        if (g == null || googleClientId.isBlank() || !googleClientId.equals(g.get("aud")) || !"true".equals(String.valueOf(g.get("email_verified"))))
            throw bad("Google sign-in failed. Try again.");
        String email = String.valueOf(g.get("email")).toLowerCase();
        String name = g.get("name") == null ? email : String.valueOf(g.get("name"));
        Optional<User> existing = users.findByEmail(email);
        if (existing.isEmpty() && r.role() == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found for this Google account. Please sign up first.");
        if (existing.isEmpty() && r.role() == Role.ADMIN) throw bad("Invalid role.");
        User u = existing.orElseGet(() -> {
            User n = new User(); n.setEmail(email); n.setName(name); n.setRole(r.role());
            return users.save(n);
        });
        return new Dto.AuthResponse(jwt.issue(u), toDto(u), existing.isEmpty());
    }

    public static Dto.UserDto toDto(User u) { return new Dto.UserDto(u.getId(), u.getName(), u.getRole().name(), u.getPhone()); }
    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
}
