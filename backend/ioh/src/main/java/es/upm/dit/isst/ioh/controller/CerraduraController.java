package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.AccesoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cerraduras")
public class CerraduraController {

    private final CerraduraRepository cerraduraRepository;
    private final AccesoRepository accesoRepository;

    public CerraduraController(CerraduraRepository cerraduraRepository, AccesoRepository accesoRepository) {
        this.cerraduraRepository = cerraduraRepository;
        this.accesoRepository = accesoRepository;
    }

    @GetMapping
    public List<Cerradura> getAll() {
        return (List<Cerradura>) cerraduraRepository.findAll();
    }

    @PostMapping("/create")
    public Cerradura create(@RequestBody Cerradura cerradura) {
        return cerraduraRepository.save(cerradura);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cerradura> getById(@PathVariable Long id) {
        return cerraduraRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Endpoint para abrir una puerta (cambiar estado de bloqueada a desbloqueada)
     * 
     * @param id ID de la cerradura
     * @return Respuesta con el resultado de la operación
     */
    @PostMapping("/{id}/abrir")
    public ResponseEntity<?> abrirPuerta(@PathVariable Long id) {
        Optional<Cerradura> optCerradura = cerraduraRepository.findById(id);

        if (optCerradura.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Cerradura cerradura = optCerradura.get();

        // Cambiar estado de la cerradura
        cerradura.setBloqueada(false);
        cerraduraRepository.save(cerradura);

        return ResponseEntity.ok().body("Puerta abierta correctamente");
    }

    /**
     * Endpoint para cerrar una puerta (cambiar estado de desbloqueada a bloqueada)
     * 
     * @param id ID de la cerradura
     * @return Respuesta con el resultado de la operación
     */
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<?> cerrarPuerta(@PathVariable Long id) {
        Optional<Cerradura> optCerradura = cerraduraRepository.findById(id);

        if (optCerradura.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Cerradura cerradura = optCerradura.get();

        // Cambiar estado de la cerradura
        cerradura.setBloqueada(true);
        cerraduraRepository.save(cerradura);

        return ResponseEntity.ok().body("Puerta cerrada correctamente");
    }
}
