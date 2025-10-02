package com.hard_lab_pag.Hard_Lab.components;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hard_lab_pag.Hard_Lab.components.dto.CreateComponentRequest;

@Service
public class ComponentService {

    private final ComponentRepository componentRepository;

    public ComponentService(ComponentRepository componentRepository) {
        this.componentRepository = componentRepository;
    }

    @Transactional
    public Component createComponent(CreateComponentRequest request) {
        // Verificar se o Part Number já existe
        if (componentRepository.existsByPartNumber(request.getPartNumber())) {
            throw new IllegalArgumentException("Part Number já existe: " + request.getPartNumber());
        }

        // Criar novo componente
        Component component = new Component();
        component.setPartNumber(request.getPartNumber());
        component.setName(request.getName());
        component.setDescription(request.getDescription());
        component.setCategory(request.getCategory());
        component.setSubcategory(request.getSubcategory());
        component.setManufacturer(request.getManufacturer());
        component.setSeries(request.getSeries());
        component.setPackageType(request.getPackageType());
        component.setTechnicalParams(request.getTechnicalParams());
        component.setCurrentStock(request.getCurrentStock());
        component.setMinimumStock(request.getMinimumStock());
        component.setEconomicOrderQuantity(request.getEconomicOrderQuantity());
        component.setStorageLocation(request.getStorageLocation());
        component.setStandardCost(request.getStandardCost());
        component.setCurrency(request.getCurrency());
        component.setRohs(request.getRohs());
        component.setReach(request.getReach());
        component.setMsl(request.getMsl());
        component.setEsdLevel(request.getEsdLevel());
        component.setTempMin(request.getTempMin());
        component.setTempMax(request.getTempMax());
        component.setDatasheet(request.getDatasheet());
        component.setStatus(request.getStatus());

        return componentRepository.save(component);
    }

    @Transactional(readOnly = true)
    public List<Component> getAllComponents() {
        return componentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Component getComponentById(Long id) {
        return componentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Componente não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public Component getComponentByPartNumber(String partNumber) {
        return componentRepository.findByPartNumber(partNumber)
            .orElseThrow(() -> new IllegalArgumentException("Componente não encontrado: " + partNumber));
    }

    @Transactional(readOnly = true)
    public List<Component> searchComponents(String search) {
        return componentRepository.findBySearchTerm(search);
    }

    @Transactional(readOnly = true)
    public List<Component> getComponentsByCategory(String category) {
        return componentRepository.findByCategory(category);
    }
}
