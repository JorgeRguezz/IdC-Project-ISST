package es.upm.dit.isst.ioh.dto;

public class CerraduraInfoDTO {
    private Long cerraduraId;
    private String cerraduraNombre;
    private String cerraduraModelo;
    private Long propiedadId;
    private String propiedadNombre;
    private String propiedadDireccion;
    private Long propietarioId;
    private String propietarioNombre;
    private boolean tieneAcceso;

    // Constructors
    public CerraduraInfoDTO() {
    }

    public CerraduraInfoDTO(Long cerraduraId, String cerraduraNombre, String cerraduraModelo,
            Long propiedadId, String propiedadNombre, String propiedadDireccion,
            Long propietarioId, String propietarioNombre, boolean tieneAcceso) {
        this.cerraduraId = cerraduraId;
        this.cerraduraNombre = cerraduraNombre;
        this.cerraduraModelo = cerraduraModelo;
        this.propiedadId = propiedadId;
        this.propiedadNombre = propiedadNombre;
        this.propiedadDireccion = propiedadDireccion;
        this.propietarioId = propietarioId;
        this.propietarioNombre = propietarioNombre;
        this.tieneAcceso = tieneAcceso;
    }

    // Getters and Setters
    public Long getCerraduraId() {
        return cerraduraId;
    }

    public void setCerraduraId(Long cerraduraId) {
        this.cerraduraId = cerraduraId;
    }

    public String getCerraduraNombre() {
        return cerraduraNombre;
    }

    public void setCerraduraNombre(String cerraduraNombre) {
        this.cerraduraNombre = cerraduraNombre;
    }

    public String getCerraduraModelo() {
        return cerraduraModelo;
    }

    public void setCerraduraModelo(String cerraduraModelo) {
        this.cerraduraModelo = cerraduraModelo;
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

    public String getPropiedadDireccion() {
        return propiedadDireccion;
    }

    public void setPropiedadDireccion(String propiedadDireccion) {
        this.propiedadDireccion = propiedadDireccion;
    }

    public Long getPropietarioId() {
        return propietarioId;
    }

    public void setPropietarioId(Long propietarioId) {
        this.propietarioId = propietarioId;
    }

    public String getPropietarioNombre() {
        return propietarioNombre;
    }

    public void setPropietarioNombre(String propietarioNombre) {
        this.propietarioNombre = propietarioNombre;
    }

    public boolean isTieneAcceso() {
        return tieneAcceso;
    }

    public void setTieneAcceso(boolean tieneAcceso) {
        this.tieneAcceso = tieneAcceso;
    }
}