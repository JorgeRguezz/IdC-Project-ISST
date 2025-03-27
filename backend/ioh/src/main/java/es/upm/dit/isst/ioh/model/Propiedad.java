package es.upm.dit.isst.ioh.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Propiedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty
    private String direccion;
    //nombre que le ponemos a la propiedad rollo "Casa de coruña"
    @NotEmpty
    private String nombre;

    @ManyToOne
    @JsonBackReference
    private Propietario propietario;

    @OneToMany(mappedBy = "propiedad", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @JsonIgnoreProperties("propiedad")
    private List<Cerradura> cerraduras;

    public Propiedad() {
    }

    public Propiedad(String direccion, Propietario propietario, String nombre) {
        this.direccion = direccion;
        this.propietario = propietario;
        this.nombre = nombre;
    }

    // Getters y setters

    public Long getId() {
        return id;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Propietario getPropietario() {
        return propietario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setPropietario(Propietario propietario) {
        this.propietario = propietario;
    }

    public List<Cerradura> getCerraduras() {
        return cerraduras;
    }

    public void setCerraduras(List<Cerradura> cerraduras) {
        this.cerraduras = cerraduras;
    }
}
