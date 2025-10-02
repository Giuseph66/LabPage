package com.hard_lab_pag.Hard_Lab.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
	@NotBlank @Email
	private String gmail;
	@NotBlank
	private String senha;

	public String getGmail() { return gmail; }
	public void setGmail(String gmail) { this.gmail = gmail; }
	public String getSenha() { return senha; }
	public void setSenha(String senha) { this.senha = senha; }
}


