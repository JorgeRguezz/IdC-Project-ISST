package es.upm.dit.isst.ioh.repository;

import es.upm.dit.isst.ioh.model.RegistroApertura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistroAperturaRepository extends JpaRepository<RegistroApertura, Long> {

    List<RegistroApertura> findByCerraduraId(Long cerraduraId);

    List<RegistroApertura> findByUsuarioId(Long usuarioId);

    List<RegistroApertura> findByExitoso(boolean exitoso);
}