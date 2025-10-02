package com.hard_lab_pag.Hard_Lab.components;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hard_lab_pag.Hard_Lab.components.dto.CreateComponentRequest;

@RestController
@RequestMapping("/api/components")
public class ComponentsController {

	private final ComponentService componentService;

	public ComponentsController(ComponentService componentService) {
		this.componentService = componentService;
	}

	// Criar componente
	@PostMapping
	@PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
	public ResponseEntity<Component> createComponent(@Validated @RequestBody CreateComponentRequest request) {
		Component component = componentService.createComponent(request);
		return ResponseEntity.ok(component);
	}

	// Listar todos os componentes
	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<Component>> getAllComponents() {
		List<Component> components = componentService.getAllComponents();
		return ResponseEntity.ok(components);
	}

	// Buscar componente por ID
	@GetMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<Component> getComponentById(@PathVariable Long id) {
		Component component = componentService.getComponentById(id);
		return ResponseEntity.ok(component);
	}

	// Buscar componentes por texto
	@GetMapping("/search")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<Component>> searchComponents(@RequestParam("q") String query) {
		List<Component> components = componentService.searchComponents(query);
		return ResponseEntity.ok(components);
	}

	// Stub: busca por barcode/QR. Integração real com repositório quando existir
	@GetMapping("/by-barcode")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> getByBarcode(@RequestParam("code") String code) {
		// Retorna 204 se não achar, apenas como placeholder
		return ResponseEntity.noContent().build();
	}
}


