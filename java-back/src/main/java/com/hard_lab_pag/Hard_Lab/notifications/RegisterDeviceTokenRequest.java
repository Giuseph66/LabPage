package com.hard_lab_pag.Hard_Lab.notifications;

import jakarta.validation.constraints.NotBlank;

public class RegisterDeviceTokenRequest {
	@NotBlank
	private String deviceToken;

	public String getDeviceToken() { return deviceToken; }
	public void setDeviceToken(String deviceToken) { this.deviceToken = deviceToken; }
}


