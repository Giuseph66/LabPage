package com.hard_lab_pag.Hard_Lab.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {
	@NotBlank @Email
	private String gmail;

	public String getGmail() { return gmail; }
	public void setGmail(String gmail) { this.gmail = gmail; }
}


