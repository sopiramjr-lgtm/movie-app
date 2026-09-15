package com.movie_app.movie_app_api.auth.service;

import com.movie_app.movie_app_api.auth.dto.request.*;
import com.movie_app.movie_app_api.auth.dto.response.LoginResponse;
import com.movie_app.movie_app_api.auth.dto.response.SignUpResponse;

public interface AuthService {
    SignUpResponse signup(SignUpRequest request);
    LoginResponse login(LoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void changePassword(String keycloakId, ChangePasswordRequest request);
    void verifyEmail(VerifyEmailRequest request);
    void logout(String refreshToken);
}