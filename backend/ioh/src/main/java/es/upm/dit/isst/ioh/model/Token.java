package com.cerraduras.model;

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

    @ManyToOne
    private Cerradura cerradura;

    public Token() {}

    public Token(String codigo, LocalDateTime fechaExpiracion, int usosMaximos, Cerradura cerradura) {
        this.codigo = codigo;
        this.fechaExpiracion = fechaExpiracion;
        this.usosMaximos = usosMaximos;
        this.usosActuales = 0;
        this.cerradura = cerradura;
    }

    // Getters y setters

    public Long getId() {
        return id;
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

    public Cerradura getCerradura() {
        return cerradura;
    }

    public void setCerradura(Cerradura cerradura) {
        this.cerradura = cerradura;
    }

    // Método de utilidad para validar el token
    public boolean esValido(LocalDateTime ahora) {
        return (fechaExpiracion == null || ahora.isBefore(fechaExpiracion))
            && (usosMaximos == 0 || usosActuales < usosMaximos);
    }

    public void registrarUso() {
        this.usosActuales++;
    }
}
