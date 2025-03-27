package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Usuario;
import es.upm.dit.isst.ioh.repository.TokenRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.UsuarioRepository;
import es.upm.dit.isst.ioh.service.CerraduraService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tokens")
@CrossOrigin(origins = "*")
public class TokenController {

    private final TokenRepository tokenRepository;
    private final CerraduraRepository cerraduraRepository;
    private final UsuarioRepository usuarioRepository;
    private final CerraduraService cerraduraService;

    public TokenController(
            TokenRepository tokenRepository, 
            CerraduraRepository cerraduraRepository,
            UsuarioRepository usuarioRepository,
            CerraduraService cerraduraService) {
        this.tokenRepository = tokenRepository;
        this.cerraduraRepository = cerraduraRepository;
        this.usuarioRepository = usuarioRepository;
        this.cerraduraService = cerraduraService;
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
    public ResponseEntity<?> validarToken(
            @RequestParam String codigo, 
            @RequestParam Long cerraduraId,
            @RequestParam Long usuarioId) {
        
        // Verificar si el usuario existe
        Optional<Usuario> optUsuario = usuarioRepository.findById(usuarioId);
        if (optUsuario.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
        }
        
        // Verificar si el usuario tiene acceso a la cerradura
        boolean tieneAcceso = cerraduraService.verificarAccesoUsuario(usuarioId, cerraduraId);
        if (!tieneAcceso) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes acceso a esta cerradura"));
        }
        
        // Verificar si el token existe
        Optional<Token> optToken = tokenRepository.findByCodigo(codigo);
        if (optToken.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Token no encontrado"));
        }

        Token token = optToken.get();

        // Verificar si el token es para esta cerradura
        if (!token.getCerradura().getId().equals(cerraduraId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Token no válido para esta cerradura"));
        }

        // Verificar si el token es válido (fecha y usos)
        LocalDateTime ahora = LocalDateTime.now();
        if (!token.esValido(ahora)) {
            return ResponseEntity.status(403).body(Map.of("error", "Token expirado o sin usos disponibles"));
        }

        // Actualizar uso del token
        token.registrarUso();
        tokenRepository.save(token);

        // Obtener la cerradura y cambiar su estado
        Cerradura cerradura = token.getCerradura();
        cerradura.setBloqueada(false);
        cerraduraRepository.save(cerradura);

        return ResponseEntity.ok(Map.of("mensaje", "Puerta abierta correctamente"));
    }

    // Listar todos los tokens (debug o administración)
    @GetMapping
    public Iterable<Token> getAll() {
        return tokenRepository.findAll();
    }
}
