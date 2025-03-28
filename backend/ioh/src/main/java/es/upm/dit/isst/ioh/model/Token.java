package es.upm.dit.isst.ioh.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDateTime;

@Entity
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty
    private String codigo;

    private LocalDateTime fechaExpiracion;

    private int usosMaximos;

    private int usosActuales;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    private boolean validoUnaVez;

    @ManyToOne
    private Cerradura cerradura;

    // --- Getters y Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public int getUsosMaximos() {
        return usosMaximos;
    }

    public void setUsosMaximos(int usosMaximos) {
        this.usosMaximos = usosMaximos;
    }

    public int getUsosActuales() {
        return usosActuales;
    }

    public void setUsosActuales(int usosActuales) {
        this.usosActuales = usosActuales;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public boolean isValidoUnaVez() {
        return validoUnaVez;
    }

    public void setValidoUnaVez(boolean validoUnaVez) {
        this.validoUnaVez = validoUnaVez;
    }

    public Cerradura getCerradura() {
        return cerradura;
    }

    public void setCerradura(Cerradura cerradura) {
        this.cerradura = cerradura;
    }

    // --- Lógica de validación ---

    public boolean esValido(LocalDateTime ahora) {
        boolean dentroDelRango = fechaInicio != null && fechaFin != null && !ahora.isBefore(fechaInicio) && !ahora.isAfter(fechaFin);
        boolean tieneUsos = !validoUnaVez || usosActuales < 1;
        return dentroDelRango && tieneUsos;
    }

    public void registrarUso() {
        this.usosActuales++;
    }
}
