package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/propietarios")
public class PropietarioController {

    private final PropietarioRepository propietarioRepository;

    public PropietarioController(PropietarioRepository propietarioRepository) {
        this.propietarioRepository = propietarioRepository;
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
}
