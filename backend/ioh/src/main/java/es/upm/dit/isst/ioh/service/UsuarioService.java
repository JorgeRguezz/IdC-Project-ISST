// Necesito crear un servicio para manejar la lógica de negocio relacionada con
// los usuarios. Este servicio se encargará de la comunicación entre el frontend y el 
// backend.
package es.upm.dit.isst.ioh.service;

import es.upm.dit.isst.ioh.model.Huesped;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.model.Usuario;
import es.upm.dit.isst.ioh.repository.HuespedRepository;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;
import es.upm.dit.isst.ioh.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final HuespedRepository huespedRepository;
    private final PropietarioRepository propietarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,
            HuespedRepository huespedRepository,
            PropietarioRepository propietarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.huespedRepository = huespedRepository;
        this.propietarioRepository = propietarioRepository;
    }

    /**
     * Verifica si existe un usuario con el email proporcionado
     * 
     * @param email Email a verificar
     * @return true si existe, false en caso contrario
     */
    public boolean existeUsuarioConEmail(String email) {
        return usuarioRepository.findByEmail(email).isPresent();
    }

    /**
     * Registra un nuevo huésped en el sistema
     * 
     * @param datos Datos del huésped a registrar
     * @return El huésped registrado
     */
    @Transactional
    public Huesped registrarHuesped(Map<String, String> datos) {
        // Verificar si ya existe un usuario con ese email
        if (existeUsuarioConEmail(datos.get("email"))) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }

        // Crear nuevo huésped
        Huesped nuevoHuesped = new Huesped(
                datos.get("nombre"),
                datos.get("email"),
                datos.get("telefono"),
                datos.get("contrasena"));

        return huespedRepository.save(nuevoHuesped);
    }

    /**
     * Registra un nuevo propietario en el sistema
     * 
     * @param datos Datos del propietario a registrar
     * @return El propietario registrado
     */
    @Transactional
    public Propietario registrarPropietario(Map<String, String> datos) {
        // Verificar si ya existe un usuario con ese email
        if (existeUsuarioConEmail(datos.get("email"))) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }

        // Crear nuevo propietario
        Propietario nuevoPropietario = new Propietario(
                datos.get("nombre"),
                datos.get("email"),
                datos.get("telefono"),
                datos.get("contrasena"));

        return propietarioRepository.save(nuevoPropietario);
    }

    /**
     * Busca un usuario por su email
     * 
     * @param email Email del usuario a buscar
     * @return Optional con el usuario si existe
     */
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
    
    /**
     * Autentica a un usuario verificando sus credenciales
     * 
     * @param email Email del usuario
     * @param contrasena Contraseña proporcionada
     * @return Optional con el usuario autenticado si las credenciales son válidas
     */
    public Optional<Usuario> autenticarUsuario(String email, String contrasena) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Comprobación directa de contraseña (en un caso real se usaría bcrypt o similar)
            if (usuario.getContrasena().equals(contrasena)) {
                return Optional.of(usuario);
            }
        }
        
        return Optional.empty();
    }
}