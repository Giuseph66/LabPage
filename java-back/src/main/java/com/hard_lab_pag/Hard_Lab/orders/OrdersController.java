package com.hard_lab_pag.Hard_Lab.orders;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrdersController {

    private final OrderRepository orderRepository;

    public OrdersController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public ResponseEntity<List<LabOrder>> getAllOrders() {
        List<LabOrder> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<LabOrder> create(
        @AuthenticationPrincipal UserDetails user,
        @Validated @RequestBody Map<String, Object> payload
    ) {
        LabOrder order = new LabOrder();
        order.setData(payload);
        order.setCreatedBy(user.getUsername());
        return ResponseEntity.ok(orderRepository.save(order));
    }
}


