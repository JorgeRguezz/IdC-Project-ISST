package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Propiedad;
import es.upm.dit.isst.ioh.repository.PropiedadRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/propiedades")
public class PropiedadController {

    private final PropiedadRepository propiedadRepository;

    public PropiedadController(PropiedadRepository propiedadRepository) {
        this.propiedadRepository = propiedadRepository;
    }

    // Obtener todas las propiedades
    @GetMapping
    public List<Propiedad> getAll() {
        return (List<Propiedad>) propiedadRepository.findAll();
    }

    // Obtener propiedades por ID de propietario
    @GetMapping("/propietario/{id}")
    public List<Propiedad> getByPropietario(@PathVariable Long id) {
        return propiedadRepository.findByPropietarioId(id);
    }

    // Obtener propiedad por ID
    @GetMapping("/{id}")
    public ResponseEntity<Propiedad> getById(@PathVariable Long id) {
        Optional<Propiedad> propiedad = propiedadRepository.findById(id);
        return propiedad.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear una nueva propiedad
    @PostMapping
    public ResponseEntity<Propiedad> create(@RequestBody Propiedad nuevaPropiedad) {
        Propiedad creada = propiedadRepository.save(nuevaPropiedad);
        return ResponseEntity.created(URI.create("/api/propiedades/" + creada.getId())).body(creada);
    }
}
