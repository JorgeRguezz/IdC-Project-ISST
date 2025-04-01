package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Acceso;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;
import es.upm.dit.isst.ioh.service.PropietarioService;
import es.upm.dit.isst.ioh.service.TokenService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/propietarios")
public class PropietarioController {

    private final PropietarioRepository propietarioRepository;
    private final PropietarioService propietarioService;
    private final TokenService tokenService;

    public PropietarioController(PropietarioRepository propietarioRepository, PropietarioService propietarioService,
            TokenService tokenService) {
        this.propietarioRepository = propietarioRepository;
        this.propietarioService = propietarioService;
        this.tokenService = tokenService;
    }

    @PostMapping
    public ResponseEntity<Propietario> crearPropietario(@RequestBody Propietario propietario) {
        Optional<Propietario> existente = propietarioRepository.findByEmail(propietario.getEmail());
        if (existente.isPresent()) {
            return ResponseEntity.status(409).build(); // 409 Conflict
        }

        Propietario guardado = propietarioRepository.save(propietario);
        return ResponseEntity.created(URI.create("/api/propietarios/" + guardado.getId())).body(guardado);
    }

    @GetMapping
    public Iterable<Propietario> getAll() {
        return propietarioRepository.findAll();
    }

    /**
     * Obtiene todos los accesos asociados a las cerraduras de las propiedades de un
     * propietario
     * 
     * @param propietarioId ID del propietario
     * @return Lista de accesos asociados a las cerraduras de las propiedades del
     *         propietario
     */
    @GetMapping("/{propietarioId}/accesos")
    public ResponseEntity<List<Acceso>> obtenerAccesosPorPropietario(@PathVariable Long propietarioId) {
        List<Acceso> accesos = propietarioService.obtenerAccesosPorPropietario(propietarioId);
        return ResponseEntity.ok(accesos);
    }

    /**
     * Obtiene todos los tokens asociados a las cerraduras de las propiedades de un
     * propietario
     * 
     * @param propietarioId ID del propietario
     * @return Lista de tokens asociados a las cerraduras de las propiedades del
     *         propietario
     */
    @GetMapping("/{propietarioId}/tokens")
    public ResponseEntity<List<Token>> obtenerTokensPorPropietario(@PathVariable Long propietarioId) {
        List<Token> tokens = tokenService.obtenerTokensPorPropietario(propietarioId);
        return ResponseEntity.ok(tokens);
    }
}
