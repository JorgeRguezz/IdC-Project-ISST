package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.AccesoRepository;
import es.upm.dit.isst.ioh.service.CerraduraService;
import es.upm.dit.isst.ioh.service.CerraduraService.AperturaResult;
import es.upm.dit.isst.ioh.dto.CerraduraInfoDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cerraduras")
@CrossOrigin(origins = "*")
public class CerraduraController {

    private final CerraduraRepository cerraduraRepository;
    private final AccesoRepository accesoRepository;
    private final CerraduraService cerraduraService;

    public CerraduraController(
            CerraduraRepository cerraduraRepository,
            AccesoRepository accesoRepository,
            CerraduraService cerraduraService) {
        this.cerraduraRepository = cerraduraRepository;
        this.accesoRepository = accesoRepository;
        this.cerraduraService = cerraduraService;
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

    // Obtener cerraduras por ID de propiedad
    @GetMapping("/propiedad/{propiedadId}")
    public List<Cerradura> getByPropiedadId(@PathVariable Long propiedadId) {
        return cerraduraRepository.findByPropiedadId(propiedadId);
    }

    /**
     * Endpoint para abrir una puerta verificando que el usuario tenga acceso
     * 
     * @param id    ID de la cerradura
     * @param datos Datos con el ID del usuario que intenta abrir la puerta
     * @return Respuesta con el resultado de la operación
     */
    @PostMapping("/{id}/abrir")
    public ResponseEntity<?> abrirPuerta(@PathVariable Long id, @RequestBody Map<String, Long> datos) {
        // Verificar que se proporcionó un usuario
        if (!datos.containsKey("usuarioId")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Se requiere el ID del usuario"));
        }

        Long usuarioId = datos.get("usuarioId");

        // Utilizar el servicio para intentar abrir la puerta
        AperturaResult resultado = cerraduraService.abrirPuerta(usuarioId, id);

        if (resultado.isExito()) {
            return ResponseEntity.ok().body(Map.of("mensaje", resultado.getMensaje()));
        } else {
            return ResponseEntity.status(403).body(Map.of("error", resultado.getMensaje()));
        }
    }

    /**
     * Endpoint para verificar si un usuario tiene acceso a una cerradura
     * 
     * @param cerraduraId ID de la cerradura
     * @param usuarioId   ID del usuario
     * @return true si tiene acceso, false de lo contrario
     */
    @GetMapping("/{id}/verificar-acceso")
    public ResponseEntity<Boolean> verificarAcceso(
            @PathVariable("id") Long cerraduraId,
            @RequestParam Long usuarioId) {
        boolean tieneAcceso = cerraduraService.verificarAccesoUsuario(usuarioId, cerraduraId);
        return ResponseEntity.ok(tieneAcceso);
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
        cerradura.setBloqueada(true);
        cerraduraRepository.save(cerradura);

        return ResponseEntity.ok().body(Map.of("mensaje", "Puerta cerrada correctamente"));
    }

    /**
     * Obtiene el nombre de la propiedad asociada a una cerradura
     * 
     * @param id ID de la cerradura
     * @return Nombre de la propiedad
     */
    @GetMapping("/{id}/propiedad/nombre")
    public ResponseEntity<String> getNombrePropiedad(@PathVariable Long id) {
        String nombrePropiedad = cerraduraService.obtenerNombrePropiedadPorCerradura(id);
        return ResponseEntity.ok(nombrePropiedad);
    }

    /**
     * Obtiene la dirección de la propiedad asociada a una cerradura
     * 
     * @param id ID de la cerradura
     * @return Dirección de la propiedad
     */
    @GetMapping("/{id}/propiedad/direccion")
    public ResponseEntity<String> getDireccionPropiedad(@PathVariable Long id) {
        String direccionPropiedad = cerraduraService.obtenerDireccionPropiedadPorCerradura(id);
        return ResponseEntity.ok(direccionPropiedad);
    }

    /**
     * Obtiene el nombre del propietario asociado a una cerradura
     * 
     * @param id ID de la cerradura
     * @return Nombre del propietario
     */
    @GetMapping("/{id}/propietario/nombre")
    public ResponseEntity<String> getNombrePropietario(@PathVariable Long id) {
        String nombrePropietario = cerraduraService.obtenerNombrePropietarioPorCerradura(id);
        return ResponseEntity.ok(nombrePropietario);
    }

    /**
     * Obtiene el nombre o modelo de la cerradura
     * 
     * @param id ID de la cerradura
     * @return Nombre o modelo de la cerradura
     */
    @GetMapping("/{id}/nombre")
    public ResponseEntity<String> getNombreCerradura(@PathVariable Long id) {
        String nombreCerradura = cerraduraService.obtenerNombreCerradura(id);
        return ResponseEntity.ok(nombreCerradura);
    }

    /**
     * Obtiene toda la información de una cerradura en un solo objeto
     * 
     * @param id        ID de la cerradura
     * @param usuarioId ID del usuario que solicita la información (opcional)
     * @return DTO con toda la información de la cerradura, propiedad y propietario
     */
    @GetMapping("/{id}/info")
    public ResponseEntity<?> getInformacionCerradura(
            @PathVariable Long id,
            @RequestParam(required = false) Long usuarioId) {

        CerraduraInfoDTO info = cerraduraService.obtenerInformacionCerradura(id, usuarioId);
        return ResponseEntity.ok(info);
    }
}
