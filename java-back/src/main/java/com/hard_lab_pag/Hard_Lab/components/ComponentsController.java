package com.hard_lab_pag.Hard_Lab.components;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/components")
public class ComponentsController {

	// Stub: busca por barcode/QR. Integração real com repositório quando existir
	@GetMapping("/by-barcode")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> getByBarcode(@RequestParam("code") String code) {
		// Retorna 204 se não achar, apenas como placeholder
		return ResponseEntity.noContent().build();
	}
}


