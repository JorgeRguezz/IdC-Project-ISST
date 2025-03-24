package com.cerraduras.repository;

import com.cerraduras.model.Propietario;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface PropietarioRepository extends CrudRepository<Propietario, Long> {

    Optional<Propietario> findByEmail(String email);
}
