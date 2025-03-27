package es.upm.dit.isst.ioh.dto;

/**
 * DTO para simplificar la transferencia de datos de la entidad Cerradura
 * y evitar problemas de serialización con referencias circulares.
 */
public class CerraduraDTO {
    private Long id;
    private String modelo;
    private boolean bloqueada;
    private Long propiedadId;
    private String propiedadNombre;

    // Constructor vacío requerido para Jackson
    public CerraduraDTO() {
    }

    // Constructor para mapear desde la entidad Cerradura
    public CerraduraDTO(Long id, String modelo, boolean bloqueada, Long propiedadId, String propiedadNombre) {
        this.id = id;
        this.modelo = modelo;
        this.bloqueada = bloqueada;
        this.propiedadId = propiedadId;
        this.propiedadNombre = propiedadNombre;
    }

    // Getters y setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getPropiedadId() {
        return propiedadId;
    }

    public void setPropiedadId(Long propiedadId) {
        this.propiedadId = propiedadId;
    }

    public String getPropiedadNombre() {
        return propiedadNombre;
    }

    public void setPropiedadNombre(String propiedadNombre) {
        this.propiedadNombre = propiedadNombre;
    }
} 