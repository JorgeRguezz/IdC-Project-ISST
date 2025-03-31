package es.upm.dit.isst.ioh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import es.upm.dit.isst.ioh.model.Acceso;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Propiedad;
import es.upm.dit.isst.ioh.model.Propietario;
import es.upm.dit.isst.ioh.repository.AccesoRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.PropiedadRepository;
import es.upm.dit.isst.ioh.repository.PropietarioRepository;

@Service
public class PropietarioService {

    private final PropietarioRepository propietarioRepository;
    private final PropiedadRepository propiedadRepository;
    private final CerraduraRepository cerraduraRepository;
    private final AccesoRepository accesoRepository;

    public PropietarioService(
            PropietarioRepository propietarioRepository,
            PropiedadRepository propiedadRepository,
            CerraduraRepository cerraduraRepository,
            AccesoRepository accesoRepository) {
        this.propietarioRepository = propietarioRepository;
        this.propiedadRepository = propiedadRepository;
        this.cerraduraRepository = cerraduraRepository;
        this.accesoRepository = accesoRepository;
    }

    /**
     * Obtiene todos los accesos asociados a las cerraduras de las propiedades de un
     * propietario
     * 
     * @param propietarioId ID del propietario
     * @return Lista de accesos asociados a las cerraduras de las propiedades del
     *         propietario
     */
    public List<Acceso> obtenerAccesosPorPropietario(Long propietarioId) {
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

        // Obtener todas las cerraduras de las propiedades
        List<Cerradura> cerraduras = new ArrayList<>();
        for (Propiedad propiedad : propiedades) {
            cerraduras.addAll(propiedad.getCerraduras());
        }

        if (cerraduras.isEmpty()) {
            return new ArrayList<>(); // Retornar lista vacía si no hay cerraduras
        }

        // Obtener todos los IDs de las cerraduras
        List<Long> cerraduraIds = cerraduras.stream()
                .map(Cerradura::getId)
                .collect(Collectors.toList());

        // Obtener todos los accesos asociados a las cerraduras
        List<Acceso> accesos = new ArrayList<>();
        for (Long cerraduraId : cerraduraIds) {
            accesos.addAll(accesoRepository.findByCerraduraId(cerraduraId));
        }

        return accesos;
    }
}