package es.upm.dit.isst.ioh.controller;

import es.upm.dit.isst.ioh.model.Acceso;
import es.upm.dit.isst.ioh.model.Horario;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GoogleCalendarController {

    private final Map<Long, Acceso> accessLogs = new HashMap<>();

    // Endpoint para registrar un acceso y crear un evento en Google Calendar
    @PostMapping("/register-access")
    public ResponseEntity<String> registerAccess(@RequestBody Acceso request) {
        if (request.getHuesped() == null || request.getCerradura() == null || request.getHorario() == null) {
            return ResponseEntity.badRequest().body("Datos faltantes en el acceso");
        }

        // Guardar el acceso en memoria (puedes usar una base de datos en producción)
        accessLogs.put(request.getId(), request);

        // Crear un evento en Google Calendar
        String eventId = createGoogleCalendarEvent(request);
        if (eventId == null) {
            return ResponseEntity.status(500).body("Error al crear el evento en Google Calendar");
        }

        System.out.println("Acceso registrado y evento creado en Google Calendar para el huésped: " +
                request.getHuesped().getNombre());
        return ResponseEntity.ok("Acceso registrado y evento creado correctamente");
    }

    // Método para crear un evento en Google Calendar
    private String createGoogleCalendarEvent(Acceso acceso) {
        try {
            // Datos del evento
            String summary = "Acceso a cerradura: " + acceso.getCerradura().getId();
            String description = "Huésped: " + acceso.getHuesped().getNombre();
            Horario horario = acceso.getHorario();

            // Aquí deberías integrar con la API de Google Calendar
            // Por ejemplo, usando una biblioteca como `google-api-java-client`
            System.out.println("Creando evento en Google Calendar...");
            System.out.println("Resumen: " + summary);
            System.out.println("Descripción: " + description);
            System.out.println("Inicio: " + horario.getInicio());
            System.out.println("Fin: " + horario.getFin());

            // Simulación de creación de evento
            return "eventId123"; // Devuelve el ID del evento creado
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}