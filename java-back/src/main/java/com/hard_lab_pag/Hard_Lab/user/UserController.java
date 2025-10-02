package com.hard_lab_pag.Hard_Lab.user;

import com.hard_lab_pag.Hard_Lab.user.dto.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserRepository userRepository;
	private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

	public UserController(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@GetMapping("/me")
	public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
		String gmail = userDetails.getUsername();
		return userRepository.findByGmail(gmail)
			.map(user -> ResponseEntity.ok(new UserResponse(user)))
			.orElse(ResponseEntity.notFound().build());
	}

	// Admin: listar usuários
	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> list() {
		return ResponseEntity.ok(userRepository.findAll());
	}

	// Admin: criar usuário simples
	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> create(@RequestBody User payload) {
		if (payload.getSenhaHash() != null) {
			payload.setSenhaHash(passwordEncoder.encode(payload.getSenhaHash()));
		}
		return ResponseEntity.ok(userRepository.save(payload));
	}

	// Admin: atualizar
	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> update(@PathVariable Long id, @RequestBody User payload) {
		return userRepository.findById(id)
			.map(u -> {
				u.setNome(payload.getNome());
				u.setCurso(payload.getCurso());
				u.setTelefone(payload.getTelefone());
				u.setAtivo(payload.getAtivo());
				u.setRoles(payload.getRoles());
				if (payload.getSenhaHash() != null && !payload.getSenhaHash().isBlank()) {
					u.setSenhaHash(passwordEncoder.encode(payload.getSenhaHash()));
				}
				return ResponseEntity.ok(userRepository.save(u));
			})
			.orElse(ResponseEntity.notFound().build());
	}

	// Admin: deletar
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> delete(@PathVariable Long id) {
		if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
		userRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	// Admin: atualizar roles
	@PutMapping("/{id}/roles")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> updateRoles(@PathVariable Long id, @RequestBody UserRolesUpdateRequest request) {
		return userRepository.findById(id)
			.map(u -> {
				u.setRoles(request.getRoles());
				return ResponseEntity.ok(userRepository.save(u));
			})
			.orElse(ResponseEntity.notFound().build());
	}
}


