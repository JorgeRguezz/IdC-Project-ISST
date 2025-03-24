package com.cerraduras.repository;

import com.cerraduras.model.Cerradura;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface CerraduraRepository extends CrudRepository<Cerradura, Long> {
    List<Cerradura> findByPropiedadId(Long propiedadId);
}
