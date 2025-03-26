package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.repository.TokenRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/tokens")
public class TokenController {

    private final TokenRepository tokenRepository;
    private final CerraduraRepository cerraduraRepository;

    public TokenController(TokenRepository tokenRepository, CerraduraRepository cerraduraRepository) {
        this.tokenRepository = tokenRepository;
        this.cerraduraRepository = cerraduraRepository;
    }

    // Crear nuevo token (propietario lo genera)
    @PostMapping
    public ResponseEntity<Token> create(@RequestBody Token token) {
        token.setUsosActuales(0);
        Token creado = tokenRepository.save(token);
        return ResponseEntity.ok(creado);
    }

    // Validar token e intentar abrir cerradura
    @PostMapping("/validar")
    public ResponseEntity<?> validarToken(@RequestParam String codigo, @RequestParam Long cerraduraId) {
        Optional<Token> optToken = tokenRepository.findByCodigo(codigo);

        if (optToken.isEmpty()) {
            return ResponseEntity.status(404).body("Token no encontrado");
        }

        Token token = optToken.get();

        if (!token.getCerradura().getId().equals(cerraduraId)) {
            return ResponseEntity.status(403).body("Token no válido para esta cerradura");
        }

        LocalDateTime ahora = LocalDateTime.now();

        if (!token.esValido(ahora)) {
            return ResponseEntity.status(403).body("Token expirado o sin usos disponibles");
        }

        // Actualizar uso del token
        token.registrarUso();
        tokenRepository.save(token);

        // Obtener la cerradura y cambiar su estado
        Cerradura cerradura = token.getCerradura();
        cerradura.setBloqueada(false);
        cerraduraRepository.save(cerradura);

        return ResponseEntity.ok("Puerta abierta correctamente");
    }

    // Listar todos los tokens (debug o administración)
    @GetMapping
    public Iterable<Token> getAll() {
        return tokenRepository.findAll();
    }
}
