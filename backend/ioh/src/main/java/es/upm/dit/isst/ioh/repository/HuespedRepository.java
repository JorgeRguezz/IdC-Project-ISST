package es.upm.dit.isst.ioh.repository;

import es.upm.dit.isst.ioh.model.Huesped;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface HuespedRepository extends CrudRepository<Huesped, Long> {

    Optional<Huesped> findByEmail(String email);
}
