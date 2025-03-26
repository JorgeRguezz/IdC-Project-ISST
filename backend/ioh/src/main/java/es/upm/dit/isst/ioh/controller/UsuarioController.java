package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Huesped;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.model.Usuario;
import es.upm.dit.isst.ioh.repository.HuespedRepository;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;
import es.upm.dit.isst.ioh.repository.UsuarioRepository;
import es.upm.dit.isst.ioh.service.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioRepository usuarioRepository,
            UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    // Obtener todos los usuarios
    @GetMapping
    public List<Usuario> getAll() {
        return (List<Usuario>) usuarioRepository.findAll();
    }

    // Registrar un nuevo huésped
    @PostMapping("/huesped")
    public ResponseEntity<?> registrarHuesped(@RequestBody Map<String, String> datos) {
        try {
            Huesped guardado = usuarioService.registrarHuesped(datos);
            return ResponseEntity.ok(Map.of(
                    "id", guardado.getId(),
                    "nombre", guardado.getNombre(),
                    "email", guardado.getEmail(),
                    "tipo", "huesped"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage())); // 409 Conflict
        }
    }

    // Registrar un nuevo propietario
    @PostMapping("/propietario")
    public ResponseEntity<?> registrarPropietario(@RequestBody Map<String, String> datos) {
        try {
            Propietario guardado = usuarioService.registrarPropietario(datos);
            return ResponseEntity.ok(Map.of(
                    "id", guardado.getId(),
                    "nombre", guardado.getNombre(),
                    "email", guardado.getEmail(),
                    "tipo", "propietario"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage())); // 409 Conflict
        }
    }

    // Buscar usuario por email (para login u otros usos)
    @GetMapping("/email")
    public ResponseEntity<Usuario> getByEmail(@RequestParam String email) {
        return usuarioRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Endpoint para login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String contrasena = credenciales.get("password");
        
        if (email == null || contrasena == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email y contraseña son requeridos"));
        }
        
        return usuarioService.autenticarUsuario(email, contrasena)
                .map(usuario -> {
                    String tipo = usuario instanceof Propietario ? "propietario" : "huesped";
                    return ResponseEntity.ok(Map.of(
                            "id", usuario.getId(),
                            "nombre", usuario.getNombre(),
                            "email", usuario.getEmail(),
                            "tipo", tipo));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas")));
    }
}
