package com.mehfil.common;

import com.mehfil.auth.Role;
import jakarta.validation.constraints.*;
import java.util.List;

/** All request/response shapes in one place. Split per module when this grows. */
public final class Dto {
    private Dto() {}
    private static final String PHONE = "[6-9]\\d{9}";

    public record OtpSend(@Pattern(regexp = PHONE, message = "Enter a valid 10-digit mobile number") String phone) {}
    public record OtpVerify(
        @Pattern(regexp = PHONE, message = "Enter a valid 10-digit mobile number") String phone,
        @Pattern(regexp = "\\d{6}", message = "Enter the 6-digit code") String code,
        @Size(max = 120) String name,
        Role role) {}
    public record Register(@NotBlank @Email String email,
        @Size(min = 8, max = 72, message = "Password must be at least 8 characters") String password,
        @NotBlank @Size(max = 120) String name, Role role) {}
    public record PhoneRegister(@NotBlank @Pattern(regexp = PHONE, message = "Enter a valid 10-digit mobile number") String phone,
        @Size(min = 8, max = 72, message = "Password must be at least 8 characters") String password,
        @NotBlank @Size(max = 120) String name, Role role) {}
    public record Login(@NotBlank String email, @NotBlank String password) {}
    public record PhoneLogin(@NotBlank @Pattern(regexp = PHONE, message = "Enter a valid 10-digit mobile number") String phone,
        @NotBlank String password) {}
    public record GoogleLogin(@NotBlank String idToken, Role role) {}
    public record GoogleComplete(@NotBlank String idToken, @NotBlank @Pattern(regexp = PHONE, message = "Enter a valid 10-digit mobile number") String phone,
        @Size(min = 8, max = 72, message = "Password must be at least 8 characters") String password, Role role) {}
    public record SendResponse(String message, String devOtp) {}
    public record UserDto(Long id, String name, String role, String phone, String avatarUrl, String membershipPlan, boolean membershipActive, boolean hasLogin) {}
    public record AuthResponse(String token, UserDto user, boolean newUser) {}
    public record Credentials(@NotBlank @Pattern(regexp = PHONE, message = "Enter a valid 10-digit mobile number") String phone, @NotBlank @Size(min = 8, max = 72, message = "Password must be 8-72 characters") String password) {}
    public record ProfileUpdate(@NotBlank @Size(max = 120) String name, @Size(max = 500) String avatarUrl) {}
    public record CategoryDto(Long id, String name, String slug) {}

    public record ArtistCard(Long id, String slug, String stageName, String category, String city,
                             double rating, int bookings, int followers, int startingPrice, boolean verified, String avatarUrl) {}
    public record ArtistDetail(Long id, String slug, String stageName, String category, String city, String bio,
                               List<String> languages, int experienceYears, double rating, int bookings,
                               int startingPrice, boolean verified, String status, String avatarUrl, String coverUrl) {}
    public record ArtistUpsert(
        @NotBlank @Size(max = 120) String stageName,
        @NotBlank String categorySlug,
        @NotBlank @Size(max = 80) String city,
        @Size(max = 2000) String bio,
        List<String> languages,
        @Min(0) @Max(60) int experienceYears,
        @Min(value = 500, message = "Starting price must be at least ₹500") int startingPrice,
        @Size(max = 500) String avatarUrl, @Size(max = 500) String coverUrl) {}
}
