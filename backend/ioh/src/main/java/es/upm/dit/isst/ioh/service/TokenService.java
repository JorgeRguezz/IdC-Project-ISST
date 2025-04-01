package es.upm.dit.isst.ioh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Propiedad;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.PropiedadRepository;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;
import es.upm.dit.isst.ioh.repository.TokenRepository;

@Service
public class TokenService {

    private final TokenRepository tokenRepository;
    private final PropietarioRepository propietarioRepository;
    private final PropiedadRepository propiedadRepository;
    private final CerraduraRepository cerraduraRepository;

    public TokenService(
            TokenRepository tokenRepository,
            PropietarioRepository propietarioRepository,
            PropiedadRepository propiedadRepository,
            CerraduraRepository cerraduraRepository) {
        this.tokenRepository = tokenRepository;
        this.propietarioRepository = propietarioRepository;
        this.propiedadRepository = propiedadRepository;
        this.cerraduraRepository = cerraduraRepository;
    }

    /**
     * Obtiene todos los tokens asociados a las cerraduras de las propiedades de un
     * propietario
     * 
     * @param propietarioId ID del propietario
     * @return Lista de tokens asociados a las cerraduras de las propiedades del
     *         propietario
     */
    public List<Token> obtenerTokensPorPropietario(Long propietarioId) {
        // Verificar si el propietario existe
        Optional<Propietario> optPropietario = propietarioRepository.findById(propietarioId);
        if (optPropietario.isEmpty()) {
            return new ArrayList<>(); // Retornar lista vacía si el propietario no existe
        }

        // Obtener todas las propiedades del propietario
        List<Propiedad> propiedades = propiedadRepository.findByPropietarioId(propietarioId);
        if (propiedades.isEmpty()) {
            return new ArrayList<>(); // Retornar lista vacía si no hay propiedades
        }

        // Obtener todas las cerraduras de esas propiedades
        List<Cerradura> cerraduras = new ArrayList<>();
        for (Propiedad propiedad : propiedades) {
            cerraduras.addAll(cerraduraRepository.findByPropiedadId(propiedad.getId()));
        }

        if (cerraduras.isEmpty()) {
            return new ArrayList<>(); // Retornar lista vacía si no hay cerraduras
        }

        // Obtener todos los tokens de esas cerraduras
        List<Token> tokens = new ArrayList<>();
        for (Cerradura cerradura : cerraduras) {
            tokens.addAll(tokenRepository.findByCerraduraId(cerradura.getId()));
        }

        return tokens;
    }
}