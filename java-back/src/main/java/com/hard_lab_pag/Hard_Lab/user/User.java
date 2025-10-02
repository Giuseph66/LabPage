package com.hard_lab_pag.Hard_Lab.user;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 254)
	private String gmail;

	@Column(nullable = false, length = 120)
	private String nome;

	@Column(nullable = false)
	private String senhaHash;

	@Column(nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	@Column(nullable = false)
	private Instant atualizadoEm = Instant.now();

	@Column
	private String matricula; // identificador acadêmico opcional

	@Column
	private String curso; // ex: curso do acadêmico/professor

	@Column
	private String telefone;

	@Column
	private Boolean ativo = true;

	// Reset de senha
	@Column(name = "reset_token", length = 100)
	private String resetToken;

	@Column(name = "reset_token_expires_at")
	private Instant resetTokenExpiresAt;

	// Push notifications device token
	@Column(name = "device_token", length = 512)
	private String deviceToken;

	@ElementCollection(fetch = FetchType.EAGER)
	@Enumerated(EnumType.STRING)
	@CollectionTable(name = "user_roles")
	@Column(name = "role")
	private Set<Role> roles = new HashSet<>();

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getGmail() { return gmail; }
	public void setGmail(String gmail) { this.gmail = gmail; }

	public String getNome() { return nome; }
	public void setNome(String nome) { this.nome = nome; }

	public String getSenhaHash() { return senhaHash; }
	public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }

	public Instant getCriadoEm() { return criadoEm; }
	public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }

	public Instant getAtualizadoEm() { return atualizadoEm; }
	public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }

	public String getMatricula() { return matricula; }
	public void setMatricula(String matricula) { this.matricula = matricula; }

	public String getCurso() { return curso; }
	public void setCurso(String curso) { this.curso = curso; }

	public String getTelefone() { return telefone; }
	public void setTelefone(String telefone) { this.telefone = telefone; }

	public Boolean getAtivo() { return ativo; }
	public void setAtivo(Boolean ativo) { this.ativo = ativo; }

	public Set<Role> getRoles() { return roles; }
	public void setRoles(Set<Role> roles) { this.roles = roles; }

	public String getResetToken() { return resetToken; }
	public void setResetToken(String resetToken) { this.resetToken = resetToken; }

	public Instant getResetTokenExpiresAt() { return resetTokenExpiresAt; }
	public void setResetTokenExpiresAt(Instant resetTokenExpiresAt) { this.resetTokenExpiresAt = resetTokenExpiresAt; }

	public String getDeviceToken() { return deviceToken; }
	public void setDeviceToken(String deviceToken) { this.deviceToken = deviceToken; }
}


