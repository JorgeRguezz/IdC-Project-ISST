package es.upm.dit.isst.ioh.model;

import jakarta.persistence.Entity;

@Entity
public class Propietario extends Usuario {
    public Propietario() {
    }

    public Propietario(String nombre, String email, String telefono, String contrasena) {
        super(nombre, email, telefono, contrasena);
    }
}
