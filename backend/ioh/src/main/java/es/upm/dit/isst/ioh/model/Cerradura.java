package es.upm.dit.isst.ioh.model;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cerradura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @NotNull(message = "El estado de la cerradura (bloqueada) no puede ser nulo")
    
    private boolean bloqueada = true;

    @ManyToOne
    @JsonBackReference
    @JsonIgnoreProperties("cerraduras")
    private Propiedad propiedad;

    private String seamDeviceId; // Para almacenar el ID externo del dispositivo

    // Constructor vacío (obligatorio para JPA)
    public Cerradura() {
    }

    // Constructor con parámetros
    public Cerradura( boolean bloqueada, Propiedad propiedad) {
        this.bloqueada = bloqueada;
        this.propiedad = propiedad;
        this.seamDeviceId = seamDeviceId; // Inicializar a una cadena vacía o null según tus preferencias
    }

    // Getters y setters

    public Long getId() {
        return id;
    }
    public void setId(Long id) { //Solo para Tests
        this.id = id;
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


    // Seam Device ID --------------------------
    public String getSeamDeviceId() {
        return seamDeviceId;
    }

    public void setSeamDeviceId(String seamDeviceId) {
        this.seamDeviceId = seamDeviceId;
    }
    // -------------------------------------------

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
