package com.movie_app.movie_app_api.auth.controller;

import jakarta.validation.Valid;
import com.movie_app.movie_app_api.auth.dto.request.*;
import com.movie_app.movie_app_api.auth.dto.response.LoginResponse;
import com.movie_app.movie_app_api.auth.dto.response.SignUpResponse;
import com.movie_app.movie_app_api.auth.service.AuthService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "[Auth] Authentication", description = "Endpoints for user registration, login, password recovery, and token revocation")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new account", description = "Creates a new user in Keycloak and the local database.")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignUpResponse>> signup(@RequestBody @Valid SignUpRequest request) {
        SignUpResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account registered successfully. Please verify your email.", response));
    }

    @Operation(summary = "Login to account", description = "Authenticates user and returns JWT access and refresh tokens.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "Forgot password", description = "Triggers a password reset email via Keycloak.")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset instructions sent to your email", null));
    }

    @Operation(summary = "Change password", description = "Changes the password for the currently authenticated user.")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid ChangePasswordRequest request
    ) {
        String keycloakId = jwt.getSubject();
        authService.changePassword(keycloakId, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @Operation(summary = "Request email verification", description = "Dispatches a verification email to the user.")
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Verification email dispatched", null));
    }

    @Operation(summary = "Logout user", description = "Invalidates the provided refresh token in Keycloak.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}