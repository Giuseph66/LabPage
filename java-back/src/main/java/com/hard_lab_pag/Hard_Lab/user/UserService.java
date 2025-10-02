package com.hard_lab_pag.Hard_Lab.user;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hard_lab_pag.Hard_Lab.auth.dto.LoginRequest;
import com.hard_lab_pag.Hard_Lab.auth.dto.RegisterRequest;
import com.hard_lab_pag.Hard_Lab.security.JwtService;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional
	public String register(RegisterRequest request) {
		if (userRepository.existsByGmail(request.getGmail())) {
			throw new IllegalArgumentException("Gmail já cadastrado");
		}

		User user = new User();
		user.setGmail(request.getGmail());
		user.setNome(request.getNome());
		user.setSenhaHash(passwordEncoder.encode(request.getSenha()));
		user.setMatricula(request.getMatricula());
		user.setCurso(request.getCurso());
		user.setTelefone(request.getTelefone());

		Set<Role> roles = request.getRoles();
		if (roles == null || roles.isEmpty()) {
			roles = new HashSet<>();
			roles.add(Role.ACADEMICO);
		}
		user.setRoles(roles);

		userRepository.save(user);

		Map<String, Object> claims = new HashMap<>();
		claims.put("roles", roles);
		return jwtService.generateToken(user.getGmail(), claims);
	}

	@Transactional(readOnly = true)
	public String login(LoginRequest request) {
		User user = userRepository.findByGmail(request.getGmail())
				.orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));
		if (!passwordEncoder.matches(request.getSenha(), user.getSenhaHash())) {
			throw new IllegalArgumentException("Credenciais inválidas");
		}
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles", user.getRoles());
		return jwtService.generateToken(user.getGmail(), claims);
	}

	@Transactional
	public void initiatePasswordReset(String gmail) {
		userRepository.findByGmail(gmail).ifPresent(user -> {
			user.setResetToken(UUID.randomUUID().toString());
			user.setResetTokenExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
			userRepository.save(user);
			// TODO: enviar e-mail com token (fora de escopo agora)
		});
	}

	@Transactional
	public void resetPassword(String token, String novaSenha) {
		User user = userRepository.findByResetToken(token)
			.orElseThrow(() -> new IllegalArgumentException("Token inválido"));
		if (user.getResetTokenExpiresAt() == null || user.getResetTokenExpiresAt().isBefore(Instant.now())) {
			throw new IllegalArgumentException("Token expirado");
		}
		user.setSenhaHash(passwordEncoder.encode(novaSenha));
		user.setResetToken(null);
		user.setResetTokenExpiresAt(null);
		userRepository.save(user);
	}
}


