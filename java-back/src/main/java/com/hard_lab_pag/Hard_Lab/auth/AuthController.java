package com.hard_lab_pag.Hard_Lab.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hard_lab_pag.Hard_Lab.auth.dto.AuthResponse;
import com.hard_lab_pag.Hard_Lab.auth.dto.LoginRequest;
import com.hard_lab_pag.Hard_Lab.auth.dto.RegisterRequest;
import com.hard_lab_pag.Hard_Lab.user.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserService userService;

	public AuthController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Validated @RequestBody RegisterRequest request) {
		String token = userService.register(request);
		return ResponseEntity.ok(new AuthResponse(token));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Validated @RequestBody LoginRequest request) {
		String token = userService.login(request);
		return ResponseEntity.ok(new AuthResponse(token));
	}

	// Recuperação de senha: solicitar reset
	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@Validated @RequestBody com.hard_lab_pag.Hard_Lab.auth.dto.ForgotPasswordRequest request) {
		userService.initiatePasswordReset(request.getGmail());
		return ResponseEntity.ok().build();
	}

	// Recuperação de senha: efetivar reset
	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@Validated @RequestBody com.hard_lab_pag.Hard_Lab.auth.dto.ResetPasswordRequest request) {
		userService.resetPassword(request.getToken(), request.getNovaSenha());
		return ResponseEntity.ok().build();
	}
}


