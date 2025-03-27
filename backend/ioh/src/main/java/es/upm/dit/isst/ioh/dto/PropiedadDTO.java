package es.upm.dit.isst.ioh.dto;

/**
 * DTO para simplificar la transferencia de datos de la entidad Propiedad
 * y evitar problemas de serialización con referencias circulares.
 */
public class PropiedadDTO {
    private Long id;
    private String nombre;
    private String direccion;
    private Long propietarioId;
    private int numeroCerraduras;

    // Constructor vacío requerido para Jackson
    public PropiedadDTO() {
    }

    // Constructor para mapear desde la entidad Propiedad
    public PropiedadDTO(Long id, String nombre, String direccion, Long propietarioId, int numeroCerraduras) {
        this.id = id;
        this.nombre = nombre;
        this.direccion = direccion;
        this.propietarioId = propietarioId;
        this.numeroCerraduras = numeroCerraduras;
    }

    // Getters y setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Long getPropietarioId() {
        return propietarioId;
    }

    public void setPropietarioId(Long propietarioId) {
        this.propietarioId = propietarioId;
    }

    public int getNumeroCerraduras() {
        return numeroCerraduras;
    }

    public void setNumeroCerraduras(int numeroCerraduras) {
        this.numeroCerraduras = numeroCerraduras;
    }
} 