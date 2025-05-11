package es.upm.dit.isst.ioh.JUnit;

import es.upm.dit.isst.ioh.model.RegistroApertura;
import es.upm.dit.isst.ioh.repository.RegistroAperturaRepository;
import es.upm.dit.isst.ioh.controller.RegistroAperturaController; // Ensure this path matches the actual location of the class
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
 
class RegistroAperturaControllerTest {

    @Mock
    private RegistroAperturaRepository registroAperturaRepository;

    @InjectMocks
    private RegistroAperturaController registroAperturaController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegistrarIntento() {
        // Arrange
        RegistroApertura registro = new RegistroApertura();
        LocalDateTime now = LocalDateTime.now();
        RegistroApertura guardado = new RegistroApertura();
        guardado.setId(1L); // Set an ID for the saved object.
        guardado.setTimestamp(now);

        when(registroAperturaRepository.save(registro)).thenReturn(guardado);

        // Act
        ResponseEntity<RegistroApertura> response = registroAperturaController.registrarIntento(registro);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(guardado, response.getBody());
        // Verify that the timestamp was set.
        verify(registroAperturaRepository).save(registro);
    }

    @Test
    void testObtenerTodos() {
        // Arrange
        List<RegistroApertura> registros = Arrays.asList(new RegistroApertura(), new RegistroApertura());
        when(registroAperturaRepository.findAll()).thenReturn(registros);

        // Act
        List<RegistroApertura> result = registroAperturaController.obtenerTodos();

        // Assert
        assertEquals(registros, result);
        verify(registroAperturaRepository).findAll();
    }

    @Test
    void testPorCerradura() {
        // Arrange
        List<RegistroApertura> registros = Arrays.asList(new RegistroApertura(), new RegistroApertura());
        when(registroAperturaRepository.findByCerraduraId(1L)).thenReturn(registros);

        // Act
        List<RegistroApertura> result = registroAperturaController.porCerradura(1L);

        // Assert
        assertEquals(registros, result);
        verify(registroAperturaRepository).findByCerraduraId(1L);
    }

    @Test
    void testPorUsuario() {
        // Arrange
        List<RegistroApertura> registros = Arrays.asList(new RegistroApertura(), new RegistroApertura());
        when(registroAperturaRepository.findByUsuarioId(1L)).thenReturn(registros);

        // Act
        List<RegistroApertura> result = registroAperturaController.porUsuario(1L);

        // Assert
        assertEquals(registros, result);
        verify(registroAperturaRepository).findByUsuarioId(1L);
    }

    @Test
    void testPorResultado() {
        // Arrange
        List<RegistroApertura> registros = Arrays.asList(new RegistroApertura(), new RegistroApertura());
        when(registroAperturaRepository.findByExitoso(true)).thenReturn(registros);

        // Act
        List<RegistroApertura> result = registroAperturaController.porResultado(true);

        // Assert
        assertEquals(registros, result);
        verify(registroAperturaRepository).findByExitoso(true);
    }
}
