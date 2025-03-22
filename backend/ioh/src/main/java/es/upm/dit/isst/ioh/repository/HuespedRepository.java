package com.cerraduras.repository;

import com.cerraduras.model.Huesped;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface HuespedRepository extends CrudRepository<Huesped, Long> {

    Optional<Huesped> findByEmail(String email);
}
