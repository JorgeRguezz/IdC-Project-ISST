package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.RegistroApertura;
import es.upm.dit.isst.ioh.repository.RegistroAperturaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/registros-apertura")
@CrossOrigin(origins = "http://localhost:5173")
public class RegistroAperturaController {

    private final RegistroAperturaRepository registroAperturaRepository;

    public RegistroAperturaController(RegistroAperturaRepository registroAperturaRepository) {
        this.registroAperturaRepository = registroAperturaRepository;
    }

    @PostMapping
    public ResponseEntity<RegistroApertura> registrarIntento(@RequestBody RegistroApertura registro) {
        registro.setTimestamp(LocalDateTime.now());
        RegistroApertura guardado = registroAperturaRepository.save(registro);
        return ResponseEntity.ok(guardado);
    }

    @GetMapping
    public List<RegistroApertura> obtenerTodos() {
        return registroAperturaRepository.findAll();
    }

    @GetMapping("/cerradura/{id}")
    public List<RegistroApertura> porCerradura(@PathVariable Long id) {
        return registroAperturaRepository.findByCerraduraId(id);
    }

    @GetMapping("/usuario/{id}")
    public List<RegistroApertura> porUsuario(@PathVariable Long id) {
        return registroAperturaRepository.findByUsuarioId(id);
    }

    @GetMapping("/resultado")
    public List<RegistroApertura> porResultado(@RequestParam boolean exitoso) {
        return registroAperturaRepository.findByExitoso(exitoso);
    }
}
