package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Huesped;
import es.upm.dit.isst.ioh.repository.HuespedRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/huespedes")
public class HuespedController {

    private final HuespedRepository huespedRepository;

    public HuespedController(HuespedRepository huespedRepository) {
        this.huespedRepository = huespedRepository;
    }

    @PostMapping
    public ResponseEntity<Huesped> crearHuesped(@RequestBody Huesped huesped) {
        Optional<Huesped> existente = huespedRepository.findByEmail(huesped.getEmail());
        if (existente.isPresent()) {
            return ResponseEntity.status(409).build(); // 409 Conflict
        }

        Huesped guardado = huespedRepository.save(huesped);
        return ResponseEntity.created(URI.create("/api/huespedes/" + guardado.getId())).body(guardado);
    }

    @GetMapping
    public Iterable<Huesped> getAll() {
        return huespedRepository.findAll();
    }
}
