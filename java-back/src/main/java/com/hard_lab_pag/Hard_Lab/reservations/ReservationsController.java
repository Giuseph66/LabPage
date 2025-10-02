package com.hard_lab_pag.Hard_Lab.reservations;

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
@RequestMapping("/api/reservations")
public class ReservationsController {

    private final ReservationRepository reservationRepository;

    public ReservationsController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();
        return ResponseEntity.ok(reservations);
    }

    @PostMapping
    public ResponseEntity<Reservation> create(
        @AuthenticationPrincipal UserDetails user,
        @Validated @RequestBody Map<String, Object> payload
    ) {
        Reservation reservation = new Reservation();
        reservation.setData(payload);
        reservation.setCreatedBy(user.getUsername());
        return ResponseEntity.ok(reservationRepository.save(reservation));
    }
}


