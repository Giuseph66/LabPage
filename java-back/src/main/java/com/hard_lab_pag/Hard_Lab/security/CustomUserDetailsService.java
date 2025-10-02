package com.hard_lab_pag.Hard_Lab.security;

import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.hard_lab_pag.Hard_Lab.user.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		var domainUser = userRepository.findByGmail(username)
				.orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
		var authorities = domainUser.getRoles().stream()
				.map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
				.collect(Collectors.toList());
		return new User(domainUser.getGmail(), domainUser.getSenhaHash(), domainUser.getAtivo(), true, true, true, authorities);
	}
}


