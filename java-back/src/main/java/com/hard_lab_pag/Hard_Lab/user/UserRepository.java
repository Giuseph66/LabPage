package com.hard_lab_pag.Hard_Lab.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByGmail(String gmail);
	Optional<User> findByGmail(String gmail);
	Optional<User> findByResetToken(String resetToken);
}


