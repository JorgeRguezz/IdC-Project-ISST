package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Acceso;
import es.upm.dit.isst.ioh.repository.AccesoRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/accesos")
public class AccesoController {

    private final AccesoRepository accesoRepository;

    public AccesoController(AccesoRepository accesoRepository) {
        this.accesoRepository = accesoRepository;
    }

    // Obtener todos los accesos
    @GetMapping
    public List<Acceso> getAll() {
        return (List<Acceso>) accesoRepository.findAll();
    }

    // Obtener accesos por huésped
    @GetMapping("/huesped/{id}")
    public List<Acceso> getByHuesped(@PathVariable Long id) {
        return accesoRepository.findByHuespedId(id);
    }

    // Obtener accesos por cerradura
    @GetMapping("/cerradura/{id}")
    public List<Acceso> getByCerradura(@PathVariable Long id) {
        return accesoRepository.findByCerraduraId(id);
    }

    // Registrar un nuevo acceso
    @PostMapping
    public ResponseEntity<Acceso> create(@RequestBody Acceso nuevoAcceso) {
        Acceso result = accesoRepository.save(nuevoAcceso);
        return ResponseEntity.ok(result);
    }

    // Validar acceso de un huésped en este momento (para abrir puerta)
    @GetMapping("/validar")
    public ResponseEntity<?> validarAcceso(
            @RequestParam Long huespedId,
            @RequestParam Long cerraduraId) {
        LocalDateTime ahora = LocalDateTime.now();
        List<Acceso> accesosValidos = accesoRepository
                .findByHuespedIdAndHorario_InicioBeforeAndHorario_FinAfter(
                        huespedId, ahora, ahora);

        boolean tieneAcceso = accesosValidos.stream()
                .anyMatch(a -> a.getCerradura().getId().equals(cerraduraId));

        return ResponseEntity.ok(tieneAcceso);
    }
}
