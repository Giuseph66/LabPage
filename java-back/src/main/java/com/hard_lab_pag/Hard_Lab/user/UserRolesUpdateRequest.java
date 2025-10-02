package com.hard_lab_pag.Hard_Lab.user;

import java.util.Set;

import jakarta.validation.constraints.NotNull;

public class UserRolesUpdateRequest {
	@NotNull
	private Set<Role> roles;

	public Set<Role> getRoles() { return roles; }
	public void setRoles(Set<Role> roles) { this.roles = roles; }
}


