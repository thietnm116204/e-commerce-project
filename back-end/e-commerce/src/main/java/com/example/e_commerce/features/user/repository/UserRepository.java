package com.example.e_commerce.features.user.repository;

import com.example.e_commerce.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByUserEmail(String email);

    Optional<User> findByUserEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.userEmail = :email")
    Optional<User> findByUserEmailWithRoles(@Param("email") String email);
}
