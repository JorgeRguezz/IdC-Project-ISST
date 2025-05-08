package es.upm.dit.isst.ioh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Date;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Propiedad;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.PropiedadRepository;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;
import es.upm.dit.isst.ioh.repository.TokenRepository;

// IMPORTS SEAM API -------------------------------
import java.io.Console;
import java.time.LocalDateTime;
import java.util.*;
import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seam.api.Seam;
import com.seam.api.core.ObjectMappers;
import com.seam.api.types.Device;
import com.seam.api.types.LocksUnlockDoorResponse;
import com.seam.api.types.Manufacturer;
import com.seam.api.types.ActionAttempt;
import com.seam.api.types.ConnectWebview;
import com.seam.api.types.AccessCode;
import com.seam.api.resources.devices.requests.DevicesGetRequest;
import com.seam.api.resources.devices.requests.DevicesListRequest;
import com.seam.api.resources.locks.requests.LocksUnlockDoorRequest;
import com.seam.api.resources.locks.requests.LocksLockDoorRequest;
import com.seam.api.resources.actionattempts.requests.ActionAttemptsGetRequest;
import com.seam.api.resources.accesscodes.requests.AccessCodesCreateRequest;


import es.upm.dit.isst.ioh.service.LockApiService;
// END ------------------------------------------

@Service
public class TokenService {

    private final TokenRepository tokenRepository;
    private final PropietarioRepository propietarioRepository;
    private final PropiedadRepository propiedadRepository;
    private final CerraduraRepository cerraduraRepository;

    @Value("${seam.api.key}")
    private String seamApiKey;

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

    @Transactional
    public AccessCode crearToken(Long cerraduraId, String codigo, LocalDateTime fechaExpiracion) {

        // Verificar si la cerradura existe
        Optional<Cerradura> optCerradura = cerraduraRepository.findById(cerraduraId);
        if (optCerradura.isEmpty()) {
            return null; // Retornar null si la cerradura no existe
        }

        String seamID = optCerradura.get().getSeamDeviceId();

        Seam seam = Seam.builder()
        .apiKey(this.seamApiKey)
                .build();
        
        LocalDateTime ahora = LocalDateTime.now();
        String fechaActualStr = ahora.toString();
        String fechaExpiracionStr = fechaExpiracion.toString();

        System.out.println("Fecha de expiración: " + fechaExpiracionStr);
        System.out.println("Fecha actual: " + fechaActualStr);

        AccessCode CreatedAccessCode = seam.accessCodes().create(AccessCodesCreateRequest.builder()
                .deviceId(seamID)
                .name(fechaExpiracion.toString())
                .startsAt(fechaActualStr)
                .endsAt(fechaExpiracionStr)
                .code(codigo)
                .build());
        System.out.println(CreatedAccessCode);

        return CreatedAccessCode;
        
    }
}
