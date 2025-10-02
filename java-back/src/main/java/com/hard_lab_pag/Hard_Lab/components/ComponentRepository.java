package com.hard_lab_pag.Hard_Lab.components;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {

    Optional<Component> findByPartNumber(String partNumber);
    
    List<Component> findByCategory(String category);
    
    List<Component> findByManufacturer(String manufacturer);
    
    List<Component> findByStatus(String status);
    
    @Query("SELECT c FROM Component c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.partNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Component> findBySearchTerm(@Param("search") String search);
    
    boolean existsByPartNumber(String partNumber);
}
