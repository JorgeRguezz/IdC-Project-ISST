package es.upm.dit.isst.ioh.repository;

import es.upm.dit.isst.ioh.model.Cerradura;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface CerraduraRepository extends CrudRepository<Cerradura, Long> {
    List<Cerradura> findByPropiedadId(Long propiedadId);
}
