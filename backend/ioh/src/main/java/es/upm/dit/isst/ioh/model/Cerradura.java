package es.upm.dit.isst.ioh.model;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cerradura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty
    private String modelo;

    private boolean bloqueada = true;

    @ManyToOne
    @JsonBackReference
    @JsonIgnoreProperties("cerraduras")
    private Propiedad propiedad;

    // Constructor vacío (obligatorio para JPA)
    public Cerradura() {
    }

    // Constructor con parámetros
    public Cerradura(String modelo, boolean bloqueada, Propiedad propiedad) {
        this.modelo = modelo;
        this.bloqueada = bloqueada;
        this.propiedad = propiedad;
    }

    // Getters y setters

    public Long getId() {
        return id;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public boolean isBloqueada() {
        return bloqueada;
    }

    public void setBloqueada(boolean bloqueada) {
        this.bloqueada = bloqueada;
    }

    public Propiedad getPropiedad() {
        return propiedad;
    }

    public void setPropiedad(Propiedad propiedad) {
        this.propiedad = propiedad;
    }

    // equals y hashCode usando solo el ID

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Cerradura))
            return false;
        Cerradura that = (Cerradura) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
