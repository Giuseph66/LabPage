package com.hard_lab_pag.Hard_Lab.notifications;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hard_lab_pag.Hard_Lab.user.UserRepository;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

	private final UserRepository userRepository;

	public NotificationsController(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@GetMapping
	public ResponseEntity<?> list(@AuthenticationPrincipal UserDetails user) {
		// Retorna vazio por enquanto
		return ResponseEntity.ok(java.util.Collections.emptyList());
	}

	@PostMapping("/device-token")
	public ResponseEntity<?> registerDeviceToken(
		@AuthenticationPrincipal UserDetails user,
		@Validated @RequestBody RegisterDeviceTokenRequest request
	) {
		var domainUser = userRepository.findByGmail(user.getUsername()).orElseThrow();
		domainUser.setDeviceToken(request.getDeviceToken());
		userRepository.save(domainUser);
		return ResponseEntity.ok().build();
	}
}


