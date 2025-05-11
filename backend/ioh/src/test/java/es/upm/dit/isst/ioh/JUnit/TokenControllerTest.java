package es.upm.dit.isst.ioh.JUnit;

import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Usuario;
import es.upm.dit.isst.ioh.repository.TokenRepository;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.UsuarioRepository;
import es.upm.dit.isst.ioh.service.CerraduraService;
import es.upm.dit.isst.ioh.service.TokenService;
import es.upm.dit.isst.ioh.controller.TokenController;
import com.seam.api.types.AccessCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
 
class TokenControllerTest {

    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private CerraduraRepository cerraduraRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CerraduraService cerraduraService;
    @Mock
    private TokenService tokenService;
    @InjectMocks
    private TokenController tokenController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateToken_CodigoNoExiste() {
        // Arrange
        Token newToken = new Token();
        newToken.setCodigo("nuevoCodigo");
        Cerradura cerradura = new Cerradura();
        cerradura.setId(1L);
        newToken.setCerradura(cerradura);
        newToken.setFechaExpiracion(LocalDateTime.now().plusHours(1));

        when(tokenRepository.findByCodigo("nuevoCodigo")).thenReturn(Optional.empty());
        //when(tokenService.crearToken(1L, "nuevoCodigo", newToken.getFechaExpiracion())).thenReturn(new AccessCode()); // Mocking external service
        when(tokenRepository.save(newToken)).thenReturn(newToken);

        // Act
        ResponseEntity<Token> response = tokenController.create(newToken);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(newToken, response.getBody());
        verify(tokenRepository).save(newToken);
    }

    @Test
    void testCreateToken_CodigoExiste() {
        // Arrange
        Token existingToken = new Token();
        existingToken.setCodigo("existingCode");
        when(tokenRepository.findByCodigo("existingCode")).thenReturn(Optional.of(existingToken));

        Token newToken = new Token();
        newToken.setCodigo("existingCode");

        // Act
        ResponseEntity<Token> response = tokenController.create(newToken);

        // Assert
        assertEquals(462, response.getStatusCode().value());
        assertEquals(null, response.getBody());
        verify(tokenRepository, never()).save(any(Token.class));
    }

    @Test
    void testValidarToken_UsuarioNoExiste() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = tokenController.validarToken("codigo", 1L, 1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Usuario no encontrado", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testValidarToken_UsuarioSinAcceso() {
        // Arrange
        Usuario usuario = new Usuario();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(cerraduraService.verificarAccesoUsuario(1L, 1L)).thenReturn(false);

        // Act
        ResponseEntity<?> response = tokenController.validarToken("codigo", 1L, 1L);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("No tienes acceso a esta cerradura", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testValidarToken_TokenNoExiste() {
        // Arrange
        Usuario usuario = new Usuario();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(cerraduraService.verificarAccesoUsuario(1L, 1L)).thenReturn(true);
        when(tokenRepository.findByCodigo("codigo")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = tokenController.validarToken("codigo", 1L, 1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Token no encontrado", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testValidarToken_TokenNoValidoParaCerradura() {
        // Arrange
        Usuario usuario = new Usuario();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(cerraduraService.verificarAccesoUsuario(1L, 1L)).thenReturn(true);

        Cerradura otraCerradura = new Cerradura();
        otraCerradura.setId(2L);
        Token token = new Token();
        token.setCerradura(otraCerradura);
        when(tokenRepository.findByCodigo("codigo")).thenReturn(Optional.of(token));

        // Act
        ResponseEntity<?> response = tokenController.validarToken("codigo", 1L, 1L);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Token no válido para esta cerradura", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testValidarToken_TokenExpirado() {
        // Arrange
        Usuario usuario = new Usuario();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(cerraduraService.verificarAccesoUsuario(1L, 1L)).thenReturn(true);

        Cerradura cerradura = new Cerradura();
        cerradura.setId(1L);
        Token token = new Token();
        token.setCerradura(cerradura);
        token.setFechaExpiracion(LocalDateTime.now().minusHours(1)); // Token expirado
        when(tokenRepository.findByCodigo("codigo")).thenReturn(Optional.of(token));

        // Act
        ResponseEntity<?> response = tokenController.validarToken("codigo", 1L, 1L);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Token expirado o sin usos disponibles", ((Map<?, ?>) response.getBody()).get("error"));
    }

    // Aquí faltaría un test para cuando el token no tiene usos disponibles, habría que modificar un poco la clase Token para poder testearlo
    @Test
    void testValidarToken_TokenSinUsos() {
        // Arrange
        Usuario usuario = new Usuario();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(cerraduraService.verificarAccesoUsuario(1L, 1L)).thenReturn(true);

        Cerradura cerradura = new Cerradura();
        cerradura.setId(1L);
        Token token = new Token();
        token.setCerradura(cerradura);
        token.setFechaExpiracion(LocalDateTime.now().plusHours(1));
        token.setUsosMaximos(1);  // Token con 1 uso máximo
        token.setUsosActuales(1);  // Token ya usado
        when(tokenRepository.findByCodigo("codigo")).thenReturn(Optional.of(token));

        // Act
        ResponseEntity<?> response = tokenController.validarToken("codigo", 1L, 1L);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Token expirado o sin usos disponibles", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testValidarToken_TokenValido() {
        // Arrange
        Usuario usuario = new Usuario();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(cerraduraService.verificarAccesoUsuario(1L, 1L)).thenReturn(true);

        Cerradura cerradura = new Cerradura();
        cerradura.setId(1L);
        Token token = new Token();
        token.setCerradura(cerradura);
        token.setFechaExpiracion(LocalDateTime.now().plusHours(1));
        token.setUsosMaximos(1);
        when(tokenRepository.findByCodigo("codigo")).thenReturn(Optional.of(token));
        when(tokenRepository.save(token)).thenReturn(token);
        when(cerraduraRepository.save(cerradura)).thenReturn(cerradura);

        // Act
        ResponseEntity<?> response = tokenController.validarToken("codigo", 1L, 1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Puerta abierta correctamente", ((Map<?, ?>) response.getBody()).get("mensaje"));
        assertEquals(1, token.getUsosActuales()); // Verifica que se actualiza el uso del token
        assertEquals(false, cerradura.isBloqueada()); // Verifica que se desbloquea la cerradura
        verify(tokenRepository).save(token);
        verify(cerraduraRepository).save(cerradura);
    }

    @Test
    void testGetAllTokens() {
        // Arrange
        Token token1 = new Token();
        Token token2 = new Token();
        Iterable<Token> tokenList = java.util.List.of(token1, token2);
        when(tokenRepository.findAll()).thenReturn(tokenList);

        // Act
        Iterable<Token> result = tokenController.getAll();

        // Assert
        assertEquals(tokenList, result);
        verify(tokenRepository).findAll();
    }

    @Test
    void testUpdateToken_TokenNotFound() {
        // Arrange
        when(tokenRepository.findById(1L)).thenReturn(Optional.empty());
        Token updatedToken = new Token();

        // Act
        ResponseEntity<?> response = tokenController.updateToken(1L, updatedToken);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Token no encontrado", response.getBody());
        verify(tokenRepository, never()).save(any(Token.class));
    }

    @Test
    void testUpdateToken_TokenFound() {
        // Arrange
        Token existingToken = new Token();
        existingToken.setId(1L);
        existingToken.setUsosActuales(0);
        existingToken.setFechaExpiracion(LocalDateTime.now());
        existingToken.setUsosMaximos(1);

        Token updatedToken = new Token();
        updatedToken.setUsosActuales(1);
        updatedToken.setFechaExpiracion(LocalDateTime.now().plusHours(1));
        updatedToken.setUsosMaximos(2);

        when(tokenRepository.findById(1L)).thenReturn(Optional.of(existingToken));
        when(tokenRepository.save(existingToken)).thenReturn(existingToken);

        // Act
        ResponseEntity<?> response = tokenController.updateToken(1L, updatedToken);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Token actualizado correctamente", response.getBody());
        assertEquals(1, existingToken.getUsosActuales());
        assertEquals(LocalDateTime.now().plusHours(1).truncatedTo(ChronoUnit.MINUTES), existingToken.getFechaExpiracion().truncatedTo(ChronoUnit.MINUTES));
        assertEquals(2, existingToken.getUsosMaximos());
        verify(tokenRepository).save(existingToken);
    }
}
