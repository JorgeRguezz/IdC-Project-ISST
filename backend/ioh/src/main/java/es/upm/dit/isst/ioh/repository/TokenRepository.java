package es.upm.dit.isst.ioh.repository;

import es.upm.dit.isst.ioh.model.Token;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends CrudRepository<Token, Long> {

    Optional<Token> findByCodigo(String codigo);

    List<Token> findByCerraduraId(Long cerraduraId);

    List<Token> findByFechaFinAfter(LocalDateTime ahora);

    @Modifying
    @Transactional
    @Query("DELETE FROM Token t WHERE t.fechaFin < CURRENT_TIMESTAMP")
    void eliminarTokensExpirados();
}
