package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.dto.TokenDTO;
import es.upm.dit.isst.ioh.repository.TokenRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tokens")
@CrossOrigin(origins = "*")
public class TokenController {

    private final TokenRepository tokenRepository;
    private final CerraduraRepository cerraduraRepository;

    public TokenController(
            TokenRepository tokenRepository,
            CerraduraRepository cerraduraRepository) {  // Corregido el nombre del parámetro
        this.tokenRepository = tokenRepository;
        this.cerraduraRepository = cerraduraRepository;  // Corregida la asignación
    }

    private String generarCodigoAlfanumerico() {  // Corregido el nombre del método
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder codigo = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            int index = (int) (Math.random() * caracteres.length());
            codigo.append(caracteres.charAt(index));
        }
        return codigo.toString();
    }

    @PostMapping("/generar")
    public ResponseEntity<?> generarToken(@RequestBody TokenDTO tokenDTO) {
        try {
            // 1. Validar cerradura
            Optional<Cerradura> cerraduraOpt = cerraduraRepository.findById(tokenDTO.getCerraduraId());
            if (cerraduraOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No se encontró la cerradura con ID: " + tokenDTO.getCerraduraId()));
            }

            // 2. Validar fechas
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime fechaInicio, fechaFin;
            
            try {
                fechaInicio = LocalDateTime.parse(tokenDTO.getFechaInicio(), formatter);
                fechaFin = LocalDateTime.parse(tokenDTO.getFechaFin(), formatter);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "Formato de fecha inválido",
                        "formatoEsperado", "yyyy-MM-dd'T'HH:mm:ss"
                    ));
            }

            if (fechaFin.isBefore(fechaInicio)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "La fecha de fin debe ser posterior a la de inicio"));
            }

            // 3. Generar código único
            String codigo = generarCodigoAlfanumerico();
            while (tokenRepository.findByCodigo(codigo).isPresent()) {
                codigo = generarCodigoAlfanumerico();
            }

            // 4. Crear y guardar token
            Token token = new Token();
            token.setCodigo(codigo);
            token.setCerradura(cerraduraOpt.get());
            token.setFechaInicio(fechaInicio);
            token.setFechaFin(fechaFin);
            token.setUsosMaximos(tokenDTO.isUnaVez() ? 1 : 9999);
            token.setUsosActuales(0);
            token.setValidoUnaVez(tokenDTO.isUnaVez());

            Token tokenGuardado = tokenRepository.save(token);
            return ResponseEntity.ok(tokenGuardado);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error interno del servidor", "detalle", e.getMessage()));
        }
    }
}