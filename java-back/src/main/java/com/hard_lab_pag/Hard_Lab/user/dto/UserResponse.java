package com.hard_lab_pag.Hard_Lab.user.dto;

import com.hard_lab_pag.Hard_Lab.user.Role;
import com.hard_lab_pag.Hard_Lab.user.User;
import java.time.Instant;
import java.util.Set;

public class UserResponse {
	private Long id;
	private String gmail;
	private String nome;
	private String matricula;
	private String curso;
	private String telefone;
	private Boolean ativo;
	private Set<Role> roles;
	private Instant criadoEm;
	private Instant atualizadoEm;

	public UserResponse() {}

	public UserResponse(User user) {
		this.id = user.getId();
		this.gmail = user.getGmail();
		this.nome = user.getNome();
		this.matricula = user.getMatricula();
		this.curso = user.getCurso();
		this.telefone = user.getTelefone();
		this.ativo = user.getAtivo();
		this.roles = user.getRoles();
		this.criadoEm = user.getCriadoEm();
		this.atualizadoEm = user.getAtualizadoEm();
	}

	// Getters e Setters
	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getGmail() { return gmail; }
	public void setGmail(String gmail) { this.gmail = gmail; }

	public String getNome() { return nome; }
	public void setNome(String nome) { this.nome = nome; }

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

	public Instant getCriadoEm() { return criadoEm; }
	public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }

	public Instant getAtualizadoEm() { return atualizadoEm; }
	public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}

