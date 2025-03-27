package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Propiedad;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.dto.PropiedadDTO;
import es.upm.dit.isst.ioh.dto.CerraduraDTO;
import es.upm.dit.isst.ioh.repository.PropiedadRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;

import org.springframework.http.HttpStatus;
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
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.nio.file.*;
import java.util.UUID;
import java.util.Optional;
import java.io.IOException;

@RestController
@RequestMapping("/api/propiedades")
@CrossOrigin(origins = "*")
public class PropiedadController {

    private final PropiedadRepository propiedadRepository;
    private final CerraduraRepository cerraduraRepository;
    private final PropietarioRepository propietarioRepository;

    public PropiedadController(
            PropiedadRepository propiedadRepository, 
            CerraduraRepository cerraduraRepository,
            PropietarioRepository propietarioRepository) {
        this.propiedadRepository = propiedadRepository;
        this.cerraduraRepository = cerraduraRepository;
        this.propietarioRepository = propietarioRepository;
    }

    // Obtener propiedades por ID de propietario - VERSIÓN ULTRA SIMPLIFICADA
    @GetMapping("/propietario/{id}")
    public String getByPropietario(@PathVariable Long id) {
        try {
            // Verificar si el propietario existe
            if (!propietarioRepository.existsById(id)) {
                return "[]"; // Devolver array vacío en formato JSON
            }
            
            // Obtener propiedades directamente
            List<Propiedad> propiedades = propiedadRepository.findByPropietarioId(id);
            
            // Construir JSON manualmente
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("[");
            
            boolean first = true;
            for (Propiedad p : propiedades) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;
                
                // Contar cerraduras
                int numeroCerraduras = 0;
                List<Cerradura> cerraduras = cerraduraRepository.findByPropiedadId(p.getId());
                if (cerraduras != null) {
                    numeroCerraduras = cerraduras.size();
                }
                
                // Construir objeto JSON para esta propiedad
                jsonBuilder.append("{");
                jsonBuilder.append("\"id\":").append(p.getId()).append(",");
                jsonBuilder.append("\"nombre\":\"").append(escaparComillas(p.getNombre())).append("\",");
                jsonBuilder.append("\"direccion\":\"").append(escaparComillas(p.getDireccion())).append("\",");
                jsonBuilder.append("\"propietarioId\":").append(id).append(",");
                jsonBuilder.append("\"numeroCerraduras\":").append(numeroCerraduras);
                jsonBuilder.append("}");
            }
            
            jsonBuilder.append("]");
            return jsonBuilder.toString();
            
        } catch (Exception e) {
            e.printStackTrace();
            return "[]"; // En caso de error, devolver array vacío
        }
    }
    
    // Método auxiliar para escapar comillas en strings
    private String escaparComillas(String texto) {
        if (texto == null) return "";
        return texto.replace("\"", "\\\"");
    }

    // Obtener cerraduras por ID de propiedad - REESCRITO DE FORMA SIMPLE
    @GetMapping("/{id}/cerraduras")
    public ResponseEntity<?> getCerradurasByPropiedad(@PathVariable Long id) {
        try {
            // Verificar si la propiedad existe
            if (!propiedadRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<Propiedad> propiedadOpt = propiedadRepository.findById(id);
            if (propiedadOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Propiedad propiedad = propiedadOpt.get();
            List<Cerradura> cerraduras = cerraduraRepository.findByPropiedadId(id);
            
            // Crear lista de objetos simples Map que contendrán los datos esenciales
            List<Map<String, Object>> resultado = new ArrayList<>();
            
            for (Cerradura c : cerraduras) {
                // Crear un mapa con solo los datos esenciales
                Map<String, Object> cerraduraMap = new HashMap<>();
                cerraduraMap.put("id", c.getId());
                cerraduraMap.put("modelo", c.getModelo());
                cerraduraMap.put("bloqueada", c.isBloqueada());
                cerraduraMap.put("propiedadId", id);
                cerraduraMap.put("propiedadNombre", propiedad.getNombre());
                
                resultado.add(cerraduraMap);
            }
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(Map.of("error", "Error al obtener cerraduras: " + e.getMessage()));
        }
    }

    // Obtener todas las propiedades
    @GetMapping
    public ResponseEntity<List<PropiedadDTO>> getAll() {
        List<Propiedad> propiedades = (List<Propiedad>) propiedadRepository.findAll();
        
        // Convertir a DTOs
        List<PropiedadDTO> dtos = propiedades.stream()
            .map(this::convertirAPropiedadDTO)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(dtos);
    }

    // Obtener propiedad por ID
    @GetMapping("/{id}")
    public ResponseEntity<PropiedadDTO> getById(@PathVariable Long id) {
        Optional<Propiedad> propiedad = propiedadRepository.findById(id);
        
        return propiedad
            .map(this::convertirAPropiedadDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Crear una nueva propiedad
    @PostMapping
    public ResponseEntity<PropiedadDTO> create(@RequestBody Propiedad nuevaPropiedad) {
        Propiedad creada = propiedadRepository.save(nuevaPropiedad);
        PropiedadDTO dto = convertirAPropiedadDTO(creada);
        
        return ResponseEntity.created(URI.create("/api/propiedades/" + creada.getId())).body(dto);
    }
    
    // Método auxiliar para convertir Propiedad a PropiedadDTO
    private PropiedadDTO convertirAPropiedadDTO(Propiedad propiedad) {
        int numeroCerraduras = 0;
        
        if (propiedad.getCerraduras() != null) {
            numeroCerraduras = propiedad.getCerraduras().size();
        }
        
        return new PropiedadDTO(
            propiedad.getId(),
            propiedad.getNombre(),
            propiedad.getDireccion(),
            propiedad.getPropietario() != null ? propiedad.getPropietario().getId() : null,
            numeroCerraduras
        );
    }
    
    // Método auxiliar para convertir Cerradura a CerraduraDTO
    private CerraduraDTO convertirACerraduraDTO(Cerradura cerradura, Propiedad propiedad) {
        return new CerraduraDTO(
            cerradura.getId(),
            cerradura.getModelo(),
            cerradura.isBloqueada(),
            propiedad.getId(),
            propiedad.getNombre()
        );
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
