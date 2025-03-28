package es.upm.dit.isst.ioh.service;

import es.upm.dit.isst.ioh.model.Cerradura;
import es.upm.dit.isst.ioh.model.Token;
import es.upm.dit.isst.ioh.repository.CerraduraRepository;
import es.upm.dit.isst.ioh.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class TokenService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private CerraduraRepository cerraduraRepository;

    public Token crearToken(Long cerraduraId, LocalDateTime inicio, LocalDateTime fin, boolean unaVez) {
        Token token = new Token();
        token.setCodigo(generarCodigoAlfanumerico(8));
        token.setFechaInicio(inicio);
        token.setFechaFin(fin);
        token.setValidoUnaVez(unaVez);
        token.setUsosMaximos(unaVez ? 1 : 9999);
        token.setUsosActuales(0);

        Optional<Cerradura> cerraduraOpt = cerraduraRepository.findById(cerraduraId);
        if (cerraduraOpt.isEmpty()) {
            throw new RuntimeException("Cerradura no encontrada");
        }

        token.setCerradura(cerraduraOpt.get());

        return tokenRepository.save(token);
    }

    private String generarCodigoAlfanumerico(int longitud) {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < longitud; i++) {
            sb.append(caracteres.charAt(random.nextInt(caracteres.length())));
        }
        return sb.toString();
    }
}
