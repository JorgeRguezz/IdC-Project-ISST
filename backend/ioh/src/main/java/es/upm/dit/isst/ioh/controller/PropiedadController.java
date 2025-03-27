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
import java.io.File;
import java.io.FileOutputStream;

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
    
    // Crear una propiedad con foto
    @PostMapping(value = "/con-imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropiedadDTO> crearConImagen(
        @RequestPart("propiedad") String propiedadJson,
        @RequestPart(value = "imagen", required = false) MultipartFile imagenFile
    ) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Propiedad propiedad = mapper.readValue(propiedadJson, Propiedad.class);

            if (imagenFile != null && !imagenFile.isEmpty()) {
                // Crear el directorio de uploads como ruta absoluta
                File directorioUploads = new File("uploads");
                String rutaAbsoluta = directorioUploads.getAbsolutePath();
                System.out.println("Directorio de uploads (absoluto): " + rutaAbsoluta);
                
                // Verificar o crear el directorio
                if (!directorioUploads.exists()) {
                    boolean creado = directorioUploads.mkdirs();
                    System.out.println("¿Se creó el directorio? " + creado);
                    if (!creado) {
                        System.err.println("ADVERTENCIA: No se pudo crear el directorio de uploads");
                    }
                }
                
                // Proceder con el guardado de la imagen
                String nombreArchivo = UUID.randomUUID() + "-" + imagenFile.getOriginalFilename();
                File archivoDestino = new File(directorioUploads, nombreArchivo);
                System.out.println("Guardando imagen en: " + archivoDestino.getAbsolutePath());
                
                // Guardar el archivo usando FileOutputStream
                try (FileOutputStream fos = new FileOutputStream(archivoDestino)) {
                    fos.write(imagenFile.getBytes());
                }
                
                // Guardar la ruta relativa en la entidad
                propiedad.setImagen("/uploads/" + nombreArchivo);
                System.out.println("Imagen guardada y asignada a la propiedad");
            }

            Propiedad guardada = propiedadRepository.save(propiedad);
            PropiedadDTO dto = convertirAPropiedadDTO(guardada);
            
            return ResponseEntity.created(URI.create("/api/propiedades/" + guardada.getId())).body(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

@RestController
@RequestMapping("/api/propiedades-con-imagen")
@CrossOrigin(origins = "*")
class PropiedadConImagenController {

    private final PropiedadRepository propiedadRepository;
    private final PropietarioRepository propietarioRepository;

    public PropiedadConImagenController(
        PropiedadRepository propiedadRepository,
        PropietarioRepository propietarioRepository) {
        this.propiedadRepository = propiedadRepository;
        this.propietarioRepository = propietarioRepository;
    }
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearConImagen(
        @RequestPart("propiedad") String propiedadJson,
        @RequestPart(value = "imagen", required = false) MultipartFile imagenFile
    ) {
        try {
            System.out.println("Recibido JSON de propiedad: " + propiedadJson);
            
            // Probar guardando la propiedad primero, sin procesar la imagen
            ObjectMapper mapper = new ObjectMapper();
            // Configuración adicional para ObjectMapper
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            
            // Obtener los datos básicos como Map primero
            Map<String, Object> propiedadMap = mapper.readValue(propiedadJson, Map.class);
            
            // Crear una nueva propiedad con esos datos
            Propiedad propiedad = new Propiedad();
            propiedad.setNombre((String) propiedadMap.get("nombre"));
            propiedad.setDireccion((String) propiedadMap.get("direccion"));
            
            // Manejar el propietario
            if (propiedadMap.containsKey("propietario")) {
                Map<String, Object> propietarioMap = (Map<String, Object>) propiedadMap.get("propietario");
                if (propietarioMap.containsKey("id")) {
                    // Convertir a Long si es necesario (puede venir como Integer o String)
                    Object idObj = propietarioMap.get("id");
                    Long propietarioId;
                    if (idObj instanceof Integer) {
                        propietarioId = ((Integer) idObj).longValue();
                    } else if (idObj instanceof String) {
                        propietarioId = Long.parseLong((String) idObj);
                    } else {
                        propietarioId = (Long) idObj;
                    }
                    
                    System.out.println("Buscando propietario con ID: " + propietarioId);
                    // Buscar el propietario
                    Optional<Propietario> propietarioOpt = propietarioRepository.findById(propietarioId);
                    if (propietarioOpt.isPresent()) {
                        propiedad.setPropietario(propietarioOpt.get());
                        System.out.println("Propietario encontrado: " + propietarioOpt.get().getNombre());
                    } else {
                        System.out.println("Propietario NO encontrado con ID: " + propietarioId);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "No se encontró el propietario con ID: " + propietarioId));
                    }
                }
            }

            // Primero guardar la propiedad sin imagen
            System.out.println("Guardando propiedad básica: " + propiedad.getNombre());
            Propiedad guardada = propiedadRepository.save(propiedad);
            System.out.println("Propiedad guardada con ID: " + guardada.getId());
            
            // Ahora, si hay una imagen, la procesamos y actualizamos la propiedad
            if (imagenFile != null && !imagenFile.isEmpty()) {
                try {
                    System.out.println("Procesando imagen: " + imagenFile.getOriginalFilename() + ", Tamaño: " + imagenFile.getSize() + " bytes");
                    // Por ahora, no guardaremos la imagen físicamente
                    // Solo actualizaremos la entidad para simular que se ha guardado
                    
                    // Generar un nombre único simulado para la imagen
                    String nombreArchivoSimulado = UUID.randomUUID() + "-" + imagenFile.getOriginalFilename();
                    guardada.setImagen("/uploads-simulado/" + nombreArchivoSimulado);
                    
                    // Actualizar la propiedad
                    guardada = propiedadRepository.save(guardada);
                    System.out.println("Propiedad actualizada con referencia a imagen simulada");
                } catch (Exception e) {
                    System.err.println("Error al procesar la imagen (continuando sin ella): " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("No se recibió imagen o estaba vacía");
            }
            
            // Devolver resultado
            return ResponseEntity.ok(Map.of(
                "id", guardada.getId(),
                "nombre", guardada.getNombre(),
                "direccion", guardada.getDireccion(),
                "propietarioId", guardada.getPropietario() != null ? guardada.getPropietario().getId() : null,
                "mensaje", "Propiedad creada correctamente"
            ));

        } catch (Exception e) {
            System.err.println("Error al crear propiedad con imagen: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al crear la propiedad: " + e.getMessage()));
        }
    }
}
