package es.upm.dit.isst.ioh.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.upm.dit.isst.ioh.model.Acceso;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Huesped;
import es.upm.dit.isst.ioh.model.Propiedad;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.model.Usuario;
import es.upm.dit.isst.ioh.repository.AccesoRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.HuespedRepository;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;
import es.upm.dit.isst.ioh.repository.UsuarioRepository;

@Service
public class CerraduraService {

    private final CerraduraRepository cerraduraRepository;
    private final AccesoRepository accesoRepository;
    private final PropietarioRepository propietarioRepository;
    private final HuespedRepository huespedRepository;
    private final UsuarioRepository usuarioRepository;

    public CerraduraService(
            CerraduraRepository cerraduraRepository,
            AccesoRepository accesoRepository,
            PropietarioRepository propietarioRepository,
            HuespedRepository huespedRepository,
            UsuarioRepository usuarioRepository) {
        this.cerraduraRepository = cerraduraRepository;
        this.accesoRepository = accesoRepository;
        this.propietarioRepository = propietarioRepository;
        this.huespedRepository = huespedRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Verifica si un usuario tiene acceso a una cerradura en este momento
     * 
     * @param usuarioId ID del usuario
     * @param cerraduraId ID de la cerradura
     * @return true si tiene acceso, false de lo contrario
     */
    public boolean verificarAccesoUsuario(Long usuarioId, Long cerraduraId) {
        // Obtener la cerradura
        Optional<Cerradura> optCerradura = cerraduraRepository.findById(cerraduraId);
        if (optCerradura.isEmpty()) {
            return false;
        }
        
        Cerradura cerradura = optCerradura.get();
        Optional<Usuario> optUsuario = usuarioRepository.findById(usuarioId);
        
        if (optUsuario.isEmpty()) {
            return false;
        }
        
        Usuario usuario = optUsuario.get();
        
        // Si el usuario es propietario
        if (usuario instanceof Propietario) {
            // Verificar si la propiedad pertenece al propietario
            Propiedad propiedad = cerradura.getPropiedad();
            return propiedad.getPropietario().getId().equals(usuario.getId());
        }
        
        // Si el usuario es huésped
        if (usuario instanceof Huesped) {
            // Verificar si tiene un acceso activo a esta cerradura
            LocalDateTime ahora = LocalDateTime.now();
            return accesoRepository
                    .findByHuespedIdAndHorario_InicioBeforeAndHorario_FinAfter(
                            usuario.getId(), ahora, ahora)
                    .stream()
                    .anyMatch(a -> a.getCerradura().getId().equals(cerraduraId));
        }
        
        return false;
    }
    
    /**
     * Intenta abrir una cerradura verificando que el usuario tenga acceso
     * 
     * @param usuarioId ID del usuario que intenta abrir
     * @param cerraduraId ID de la cerradura a abrir
     * @return Resultado de la operación con un mensaje
     */
    @Transactional
    public AperturaResult abrirPuerta(Long usuarioId, Long cerraduraId) {
        // Verificar si la cerradura existe
        Optional<Cerradura> optCerradura = cerraduraRepository.findById(cerraduraId);
        if (optCerradura.isEmpty()) {
            return new AperturaResult(false, "Cerradura no encontrada");
        }
        
        // Verificar si el usuario tiene acceso
        if (!verificarAccesoUsuario(usuarioId, cerraduraId)) {
            return new AperturaResult(false, "No tienes acceso a esta cerradura");
        }
        
        // Abrir la cerradura
        Cerradura cerradura = optCerradura.get();
        cerradura.setBloqueada(false);
        cerraduraRepository.save(cerradura);
        
        return new AperturaResult(true, "Puerta abierta correctamente");
    }
    
    /**
     * Clase para representar el resultado de intentar abrir una puerta
     */
    public static class AperturaResult {
        private final boolean exito;
        private final String mensaje;

        public AperturaResult(boolean exito, String mensaje) {
            this.exito = exito;
            this.mensaje = mensaje;
        }

        public boolean isExito() {
            return exito;
        }

        public String getMensaje() {
            return mensaje;
        }
    }
    
    public String obtenerNombrePropiedadPorCerradura(Long cerraduraId) {
        Optional<Cerradura> optCerradura = cerraduraRepository.findById(cerraduraId);
    
        if (optCerradura.isPresent()) {
            Cerradura cerradura = optCerradura.get();
            Propiedad propiedad = cerradura.getPropiedad();
    
            if (propiedad != null) {
                return propiedad.getNombre(); // Suponiendo que Propiedad tiene un atributo "nombre"
            }
        }
    
        return "Propiedad no encontrada";
    }
    
} 