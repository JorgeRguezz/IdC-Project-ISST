package com.cerraduras.repository;

import com.cerraduras.model.Propiedad;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface PropiedadRepository extends CrudRepository<Propiedad, Long> {

    List<Propiedad> findByPropietarioId(Long propietarioId);
}
