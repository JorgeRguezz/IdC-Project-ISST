package es.upm.dit.isst.ioh.model;

import jakarta.persistence.Embeddable;
import java.time.LocalDateTime;

@Embeddable
public class Horario {

    private LocalDateTime inicio;
    private LocalDateTime fin;

    public Horario() {
    }

    public Horario(LocalDateTime inicio, LocalDateTime fin) {
        this.inicio = inicio;
        this.fin = fin;
    }

    // Getters y setters

    public LocalDateTime getInicio() {
        return inicio;
    }

    public void setInicio(LocalDateTime inicio) {
        this.inicio = inicio;
    }

    public LocalDateTime getFin() {
        return fin;
    }

    public void setFin(LocalDateTime fin) {
        this.fin = fin;
    }

    // Método de utilidad
    public boolean estaDentroDelHorario(LocalDateTime momento) {
        return (inicio != null && fin != null) && (!momento.isBefore(inicio) && !momento.isAfter(fin));
    }
}
