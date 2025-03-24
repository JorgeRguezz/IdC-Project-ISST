package com.cerraduras.repository;

import com.cerraduras.model.Acceso;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AccesoRepository extends CrudRepository<Acceso, Long> {

    List<Acceso> findByHuespedId(Long huespedId);

    List<Acceso> findByCerraduraId(Long cerraduraId);

    List<Acceso> findByHuespedIdAndHorario_InicioBeforeAndHorario_FinAfter(
        Long huespedId,
        LocalDateTime ahora1,
        LocalDateTime ahora2
    );
}
