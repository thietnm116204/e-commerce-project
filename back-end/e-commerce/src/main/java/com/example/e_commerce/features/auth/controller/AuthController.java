package com.example.e_commerce.features.auth.controller;

import com.example.e_commerce.features.auth.dto.request.LoginRequest;
import com.example.e_commerce.features.auth.dto.response.AuthResponse;
import com.example.e_commerce.features.auth.service.AuthService;
import com.example.e_commerce.features.user.dto.request.RegisterRequest;
import com.example.e_commerce.features.user.entity.User;
import com.example.e_commerce.features.user.service.UserService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String REFRESH_TOKEN_COOKIE_PATH = "/api/v1/auth";

    private final AuthService authService;
    private final UserService userService;

    @Value("${app.auth.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<User>builder()
                        .code(HttpStatus.CREATED.value())
                        .message(MessageConstants.REGISTER_SUCCESS)
                        .data(userService.register(request))
                        .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshTokenCookie(authResponse.getRefreshToken(), authResponse.getRefreshExpiresIn()).toString())
                .body(ApiResponse.<AuthResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.LOGIN_SUCCESS)
                        .data(withoutRefreshToken(authResponse))
                        .build());
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(HttpServletRequest request) {
        String refreshToken = getRefreshTokenFromCookie(request);
        if (refreshToken == null || refreshToken.isBlank()) {
            return unauthorizedResponse();
        }

        AuthResponse authResponse = authService.refreshToken(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshTokenCookie(authResponse.getRefreshToken(), authResponse.getRefreshExpiresIn()).toString())
                .body(ApiResponse.<AuthResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.REFRESH_TOKEN_SUCCESS)
                        .data(withoutRefreshToken(authResponse))
                        .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String refreshToken = getRefreshTokenFromCookie(request);
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshTokenCookie().toString())
                .body(ApiResponse.<Void>builder()
                        .code(HttpStatus.OK.value())
                        .message("Đăng xuất thành công")
                        .data(null)
                        .build());
    }

    private ResponseCookie buildRefreshTokenCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path(REFRESH_TOKEN_COOKIE_PATH)
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }

    private ResponseCookie buildRefreshTokenCookie(String value, boolean cleared) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, cleared ? "" : value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path(REFRESH_TOKEN_COOKIE_PATH);

        if (cleared) {
            return builder.maxAge(Duration.ZERO).build();
        }

        return builder.build();
    }

    private ResponseCookie clearRefreshTokenCookie() {
        return buildRefreshTokenCookie("", true);
    }

    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        var cookie = WebUtils.getCookie(request, REFRESH_TOKEN_COOKIE_NAME);
        return cookie != null ? cookie.getValue() : null;
    }

    private ResponseEntity<ApiResponse<AuthResponse>> unauthorizedResponse() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse.<AuthResponse>builder()
                        .code(HttpStatus.UNAUTHORIZED.value())
                        .message("Chưa có refresh token")
                        .data(null)
                        .build()
        );
    }

    private AuthResponse withoutRefreshToken(AuthResponse authResponse) {
        return new AuthResponse(
                authResponse.getAccessToken(),
                null,
                authResponse.getTokenType(),
                authResponse.getExpiresIn(),
                authResponse.getRefreshExpiresIn()
        );
    }
}
