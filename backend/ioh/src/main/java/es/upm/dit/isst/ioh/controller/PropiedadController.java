package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Propiedad;
import es.upm.dit.isst.ioh.repository.PropiedadRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.nio.file.*;
import java.util.UUID;
import java.util.Optional;
import java.io.IOException;

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
    //Crear una propiedad con foto
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Propiedad> crearConImagen(
    @RequestPart("propiedad") String propiedadJson,
    @RequestPart(value = "imagen", required = false) MultipartFile imagenFile
    ) {
    try {
        ObjectMapper mapper = new ObjectMapper();
        Propiedad propiedad = mapper.readValue(propiedadJson, Propiedad.class);

        if (imagenFile != null && !imagenFile.isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "-" + imagenFile.getOriginalFilename();
            Path rutaDestino = Paths.get("uploads").resolve(nombreArchivo);
            Files.createDirectories(rutaDestino.getParent());
            Files.copy(imagenFile.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);
            propiedad.setImagen("/uploads/" + nombreArchivo);
        }

        Propiedad guardada = propiedadRepository.save(propiedad);
        return ResponseEntity.ok(guardada);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}


}
