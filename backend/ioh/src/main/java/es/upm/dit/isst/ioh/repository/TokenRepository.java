package es.upm.dit.isst.ioh.repository;

import es.upm.dit.isst.ioh.model.Token;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends CrudRepository<Token, Long> {

    Optional<Token> findByCodigo(String codigo);

    List<Token> findByCerraduraId(Long cerraduraId);

    List<Token> findByFechaExpiracionAfter(LocalDateTime ahora);
}
