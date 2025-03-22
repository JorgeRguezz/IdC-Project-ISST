package com.cerraduras.controller;

import com.cerraduras.model.Usuario;
import com.cerraduras.repository.UsuarioRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Obtener todos los usuarios
    @GetMapping
    public List<Usuario> getAll() {
        return (List<Usuario>) usuarioRepository.findAll();
    }

    // Registrar un nuevo usuario (propietario o huésped)
    @PostMapping
    public ResponseEntity<Usuario> create(@RequestBody Usuario nuevoUsuario) {
        Optional<Usuario> existente = usuarioRepository.findByEmail(nuevoUsuario.getEmail());

        if (existente.isPresent()) {
            return ResponseEntity.status(409).build(); // 409 Conflict
        }

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        return ResponseEntity.ok(guardado);
    }

    // Buscar usuario por email (para login u otros usos)
    @GetMapping("/email")
    public ResponseEntity<Usuario> getByEmail(@RequestParam String email) {
        return usuarioRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
