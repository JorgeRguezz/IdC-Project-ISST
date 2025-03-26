package es.upm.dit.isst.ioh.model;

import jakarta.persistence.Entity;

@Entity
public class Huesped extends Usuario {
    public Huesped() {
    }

    public Huesped(String nombre, String email, String telefono, String contrasena) {
        super(nombre, email, telefono, contrasena);
    }
}
