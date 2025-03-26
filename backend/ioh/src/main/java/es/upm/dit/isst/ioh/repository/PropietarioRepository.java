package es.upm.dit.isst.ioh.repository;

import es.upm.dit.isst.ioh.model.Propietario;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface PropietarioRepository extends CrudRepository<Propietario, Long> {

    Optional<Propietario> findByEmail(String email);
}
