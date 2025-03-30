package es.upm.dit.isst.ioh.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
public class RegistroApertura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    private boolean exitoso;

    private String motivo; // Ej: "Acceso permitido", "Sin permiso", "Fuera de horario", etc.

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private Cerradura cerradura;

    // Constructor vacío
    public RegistroApertura() {}

    // Constructor completo
    public RegistroApertura(LocalDateTime timestamp, boolean exitoso, String motivo, Usuario usuario, Cerradura cerradura) {
        this.timestamp = timestamp;
        this.exitoso = exitoso;
        this.motivo = motivo;
        this.usuario = usuario;
        this.cerradura = cerradura;
    }
    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isExitoso() {
        return exitoso;
    }

    public void setExitoso(boolean exitoso) {
        this.exitoso = exitoso;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Cerradura getCerradura() {
        return cerradura;
    }

    public void setCerradura(Cerradura cerradura) {
        this.cerradura = cerradura;
    }
    
}
