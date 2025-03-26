package es.upm.dit.isst.ioh.repository;

import es.upm.dit.isst.ioh.model.Propiedad;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface PropiedadRepository extends CrudRepository<Propiedad, Long> {

    List<Propiedad> findByPropietarioId(Long propietarioId);
}
