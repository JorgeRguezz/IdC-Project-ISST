package es.upm.dit.isst.ioh.JUnit;

import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.repository.AccesoRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.service.CerraduraService;
import es.upm.dit.isst.ioh.service.CerraduraService.AperturaResult;
import es.upm.dit.isst.ioh.controller.CerraduraController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class CerraduraControllerTest {

    @Mock
    private CerraduraRepository cerraduraRepository;
    @Mock
    private AccesoRepository accesoRepository;
    @Mock
    private CerraduraService cerraduraService;
    @InjectMocks
    private CerraduraController cerraduraController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllCerraduras() {
        // Arrange
        List<Cerradura> cerraduras = Arrays.asList(new Cerradura(), new Cerradura());
        when(cerraduraRepository.findAll()).thenReturn(cerraduras);

        // Act
        List<Cerradura> result = cerraduraController.getAll();

        // Assert
        assertEquals(cerraduras, result);
        verify(cerraduraRepository).findAll();
    }

    @Test
    void testCreateCerradura() {
        // Arrange
        Cerradura cerradura = new Cerradura();
        when(cerraduraRepository.save(cerradura)).thenReturn(cerradura);

        // Act
        Cerradura result = cerraduraController.create(cerradura);

        // Assert
        assertEquals(cerradura, result);
        verify(cerraduraRepository).save(cerradura);
    }

    @Test
    void testGetCerraduraById_Found() {
        // Arrange
        Cerradura cerradura = new Cerradura();
        cerradura.setId(1L);
        when(cerraduraRepository.findById(1L)).thenReturn(Optional.of(cerradura));

        // Act
        ResponseEntity<Cerradura> response = cerraduraController.getById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cerradura, response.getBody());
    }

    @Test
    void testGetCerraduraById_NotFound() {
        // Arrange
        when(cerraduraRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Cerradura> response = cerraduraController.getById(1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetCerradurasByPropiedadId() {
        // Arrange
        List<Cerradura> cerraduras = Arrays.asList(new Cerradura(), new Cerradura());
        when(cerraduraRepository.findByPropiedadId(1L)).thenReturn(cerraduras);

        // Act
        List<Cerradura> result = cerraduraController.getByPropiedadId(1L);

        // Assert
        assertEquals(cerraduras, result);
        verify(cerraduraRepository).findByPropiedadId(1L);
    }

    @Test
    void testAbrirPuerta_UsuarioIdNoProporcionado() {
        // Arrange
        Map<String, Long> datos = new HashMap<>(); // Empty map
        // Act
        ResponseEntity<?> response = cerraduraController.abrirPuerta(1L, datos);
        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Se requiere el ID del usuario", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testAbrirPuerta_Exito() {
        // Arrange
        Map<String, Long> datos = new HashMap<>();
        datos.put("usuarioId", 1L);
        AperturaResult resultado = new AperturaResult(true, "Puerta abierta");
        when(cerraduraService.abrirPuerta(1L, 1L)).thenReturn(resultado);

        // Act
        ResponseEntity<?> response = cerraduraController.abrirPuerta(1L, datos);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Puerta abierta", ((Map<?, ?>) response.getBody()).get("mensaje"));
    }

    @Test
    void testAbrirPuerta_Fallo() {
        // Arrange
        Map<String, Long> datos = new HashMap<>();
        datos.put("usuarioId", 1L);
        AperturaResult resultado = new AperturaResult(false, "No tiene acceso");
        when(cerraduraService.abrirPuerta(1L, 1L)).thenReturn(resultado);

        // Act
        ResponseEntity<?> response = cerraduraController.abrirPuerta(1L, datos);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("No tiene acceso", ((Map<?, ?>) response.getBody()).get("error"));
    }
    
    @Test
    void testCerrarPuerta_Exito() {
        // Arrange
        AperturaResult resultado = new AperturaResult(true, "Puerta cerrada");
        when(cerraduraService.cerrarPuerta(1L)).thenReturn(resultado);

        // Act
        ResponseEntity<?> response = cerraduraController.cerrarPuerta(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Puerta cerrada", ((Map<?, ?>) response.getBody()).get("mensaje"));
    }

    @Test
    void testCerrarPuerta_Fallo() {
        // Arrange
        AperturaResult resultado = new AperturaResult(false, "Error al cerrar");
        when(cerraduraService.cerrarPuerta(1L)).thenReturn(resultado);

        // Act
        ResponseEntity<?> response = cerraduraController.cerrarPuerta(1L);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Error al cerrar", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testVerificarAcceso() {
        // Arrange
        when(cerraduraService.verificarAccesoUsuario(1L, 1L)).thenReturn(true);

        // Act
        ResponseEntity<Boolean> response = cerraduraController.verificarAcceso(1L, 1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(true, response.getBody());
    }

    @Test
    void testGetNombrePropiedad() {
        // Arrange
        when(cerraduraService.obtenerNombrePropiedadPorCerradura(1L)).thenReturn("Propiedad 1");

        // Act
        ResponseEntity<String> response = cerraduraController.getNombrePropiedad(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Propiedad 1", response.getBody());
    }

    @Test
    void testGetDireccionPropiedad() {
        // Arrange
        when(cerraduraService.obtenerDireccionPropiedadPorCerradura(1L)).thenReturn("Direccion 1");

        // Act
        ResponseEntity<String> response = cerraduraController.getDireccionPropiedad(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Direccion 1", response.getBody());
    }

    @Test
    void testGetNombrePropietario() {
        // Arrange
        when(cerraduraService.obtenerNombrePropietarioPorCerradura(1L)).thenReturn("Propietario 1");

        // Act
        ResponseEntity<String> response = cerraduraController.getNombrePropietario(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Propietario 1", response.getBody());
    }
}
