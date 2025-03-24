package com.cerraduras.controller;

import com.cerraduras.model.Cerradura;
import com.cerraduras.repository.CerraduraRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cerraduras")
public class CerraduraController {

    private final CerraduraRepository cerraduraRepository;

    public CerraduraController(CerraduraRepository cerraduraRepository) {
        this.cerraduraRepository = cerraduraRepository;
    }

    @GetMapping
    public List<Cerradura> getAll() {
        return (List<Cerradura>) cerraduraRepository.findAll();
    }

    @PostMapping
    public Cerradura create(@RequestBody Cerradura cerradura) {
        return cerraduraRepository.save(cerradura);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cerradura> getById(@PathVariable Long id) {
        return cerraduraRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
