package com.hard_lab_pag.Hard_Lab.components.dto;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateComponentRequest {

    @NotBlank(message = "Part Number é obrigatório")
    private String partNumber;

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    private String description;

    @NotBlank(message = "Categoria é obrigatória")
    private String category;

    private String subcategory;

    @NotBlank(message = "Fabricante é obrigatório")
    private String manufacturer;

    private String series;

    @NotBlank(message = "Tipo de pacote é obrigatório")
    private String packageType;

    private Map<String, Object> technicalParams;

    private Integer currentStock = 0;
    private Integer minimumStock = 0;
    private Integer economicOrderQuantity = 0;
    private String storageLocation;

    private Double standardCost = 0.0;
    private String currency = "BRL";

    private Boolean rohs = false;
    private Boolean reach = false;
    private String msl;
    private String esdLevel;

    private Integer tempMin = -40;
    private Integer tempMax = 85;

    private String datasheet;

    @NotBlank(message = "Status é obrigatório")
    private String status = "active";

    // Getters and Setters
    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getSeries() {
        return series;
    }

    public void setSeries(String series) {
        this.series = series;
    }

    public String getPackageType() {
        return packageType;
    }

    public void setPackageType(String packageType) {
        this.packageType = packageType;
    }

    public Map<String, Object> getTechnicalParams() {
        return technicalParams;
    }

    public void setTechnicalParams(Map<String, Object> technicalParams) {
        this.technicalParams = technicalParams;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public void setMinimumStock(Integer minimumStock) {
        this.minimumStock = minimumStock;
    }

    public Integer getEconomicOrderQuantity() {
        return economicOrderQuantity;
    }

    public void setEconomicOrderQuantity(Integer economicOrderQuantity) {
        this.economicOrderQuantity = economicOrderQuantity;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public Double getStandardCost() {
        return standardCost;
    }

    public void setStandardCost(Double standardCost) {
        this.standardCost = standardCost;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Boolean getRohs() {
        return rohs;
    }

    public void setRohs(Boolean rohs) {
        this.rohs = rohs;
    }

    public Boolean getReach() {
        return reach;
    }

    public void setReach(Boolean reach) {
        this.reach = reach;
    }

    public String getMsl() {
        return msl;
    }

    public void setMsl(String msl) {
        this.msl = msl;
    }

    public String getEsdLevel() {
        return esdLevel;
    }

    public void setEsdLevel(String esdLevel) {
        this.esdLevel = esdLevel;
    }

    public Integer getTempMin() {
        return tempMin;
    }

    public void setTempMin(Integer tempMin) {
        this.tempMin = tempMin;
    }

    public Integer getTempMax() {
        return tempMax;
    }

    public void setTempMax(Integer tempMax) {
        this.tempMax = tempMax;
    }

    public String getDatasheet() {
        return datasheet;
    }

    public void setDatasheet(String datasheet) {
        this.datasheet = datasheet;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
