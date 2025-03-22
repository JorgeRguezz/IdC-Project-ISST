package com.cerraduras.model;

import jakarta.persistence.*;

@Entity
public class Acceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Huesped huesped;

    @ManyToOne
    private Cerradura cerradura;

    @Embedded
    private Horario horario;

    public Acceso() {}

    public Acceso(Huesped huesped, Cerradura cerradura, Horario horario) {
        this.huesped = huesped;
        this.cerradura = cerradura;
        this.horario = horario;
    }

    // Getters y setters

    public Long getId() {
        return id;
    }

    public Huesped getHuesped() {
        return huesped;
    }

    public void setHuesped(Huesped huesped) {
        this.huesped = huesped;
    }

    public Cerradura getCerradura() {
        return cerradura;
    }

    public void setCerradura(Cerradura cerradura) {
        this.cerradura = cerradura;
    }

    public Horario getHorario() {
        return horario;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }
}
