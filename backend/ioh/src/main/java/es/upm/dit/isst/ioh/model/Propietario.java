package es.upm.dit.isst.ioh.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Propietario extends Usuario {
    
    @OneToMany(mappedBy = "propietario")
    @JsonManagedReference
    @JsonIgnoreProperties("propietario")
    private List<Propiedad> propiedades;
    
    public Propietario() {
    }

    public Propietario(String nombre, String email, String telefono, String contrasena) {
        super(nombre, email, telefono, contrasena);
    }
    
    public List<Propiedad> getPropiedades() {
        return propiedades;
    }
    
    public void setPropiedades(List<Propiedad> propiedades) {
        this.propiedades = propiedades;
    }
}
