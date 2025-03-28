package es.upm.dit.isst.ioh.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

public class TokenDTO {
    private Long cerraduraId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private String fechaInicio;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private String fechaFin;
    
    private boolean unaVez;

    // Getters y setters
    public Long getCerraduraId() {
        return cerraduraId;
    }

    public void setCerraduraId(Long cerraduraId) {
        this.cerraduraId = cerraduraId;
    }

    public String getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(String fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public String getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(String fechaFin) {
        this.fechaFin = fechaFin;
    }

    public boolean isUnaVez() {
        return unaVez;
    }

    public void setUnaVez(boolean unaVez) {
        this.unaVez = unaVez;
    }
}