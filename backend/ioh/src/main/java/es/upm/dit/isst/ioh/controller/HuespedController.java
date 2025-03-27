package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Huesped;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Acceso;
import es.upm.dit.isst.ioh.repository.HuespedRepository;
import es.upm.dit.isst.ioh.repository.AccesoRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/huespedes")
@CrossOrigin(origins = "*")
public class HuespedController {

    private final HuespedRepository huespedRepository;
    private final AccesoRepository accesoRepository;

    public HuespedController(HuespedRepository huespedRepository, AccesoRepository accesoRepository) {
        this.huespedRepository = huespedRepository;
        this.accesoRepository = accesoRepository;
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

    /**
     * Obtiene todas las cerraduras a las que un huésped tiene acceso actualmente
     * @param id ID del huésped
     * @return Lista de cerraduras a las que tiene acceso
     */
    @GetMapping("/{id}/cerraduras")
    public ResponseEntity<?> getCerradurasAccesibles(@PathVariable Long id) {
        // Verificar si el huésped existe
        Optional<Huesped> huespedOpt = huespedRepository.findById(id);
        if (huespedOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Obtener hora actual para verificar accesos activos
        LocalDateTime ahora = LocalDateTime.now();
        
        try {
            // Obtener los accesos activos del huésped
            List<Acceso> accesosActivos = accesoRepository
                .findByHuespedIdAndHorario_InicioBeforeAndHorario_FinAfter(id, ahora, ahora);
            
            // Extraer las cerraduras de los accesos y convertirlas a un formato simplificado
            List<Map<String, Object>> cerraduras = accesosActivos.stream()
                .map(acceso -> {
                    Cerradura cerradura = acceso.getCerradura();
                    Map<String, Object> cerraduraMap = new HashMap<>();
                    cerraduraMap.put("id", cerradura.getId());
                    cerraduraMap.put("nombre", cerradura.getPropiedad().getNombre());
                    return cerraduraMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(cerraduras);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener las cerraduras: " + e.getMessage()));
        }
    }
}
