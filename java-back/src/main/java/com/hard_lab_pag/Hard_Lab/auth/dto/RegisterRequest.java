package com.hard_lab_pag.Hard_Lab.auth.dto;

import java.util.Set;
import com.hard_lab_pag.Hard_Lab.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
	@NotBlank @Email
	private String gmail;

	@NotBlank
	@Size(min = 2, max = 120)
	private String nome;

	@NotBlank
	@Size(min = 6, max = 100)
	private String senha;

	private String matricula;
	private String curso;
	private String telefone;
	private Set<Role> roles; // opcional: se não vier, default ACADEMICO

	public String getGmail() { return gmail; }
	public void setGmail(String gmail) { this.gmail = gmail; }

	public String getNome() { return nome; }
	public void setNome(String nome) { this.nome = nome; }

	public String getSenha() { return senha; }
	public void setSenha(String senha) { this.senha = senha; }

	public String getMatricula() { return matricula; }
	public void setMatricula(String matricula) { this.matricula = matricula; }

	public String getCurso() { return curso; }
	public void setCurso(String curso) { this.curso = curso; }

	public String getTelefone() { return telefone; }
	public void setTelefone(String telefone) { this.telefone = telefone; }

	public Set<Role> getRoles() { return roles; }
	public void setRoles(Set<Role> roles) { this.roles = roles; }
}


