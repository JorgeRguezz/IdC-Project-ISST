import requests
import json
from datetime import datetime

# URL del endpoint para crear tokens
url = "http://localhost:8080/api/tokens"

# Fecha de expiración: 31 de diciembre de 2025
fecha_expiracion = "2025-12-31T23:59:59"

# Datos del token a crear
token_data = {
    "codigo": "123456",
    "fechaExpiracion": fecha_expiracion,
    "usosMaximos": 5,
    "cerradura": {
        "id": 1
    }
}

# Cabeceras para la petición
headers = {
    "Content-Type": "application/json"
}

def crear_token():
    try:
        # Realizar la petición POST para crear el token
        response = requests.post(url, json=token_data, headers=headers)
        
        # Verificar si la petición fue exitosa
        if response.status_code == 200:
            print("Token creado exitosamente:")
            print(json.dumps(response.json(), indent=4))
            return True
        else:
            print(f"Error al crear el token. Código de estado: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"Error en la petición: {str(e)}")
        return False

def verificar_token():
    try:
        # Realizar una petición GET para obtener todos los tokens
        response = requests.get(url)
        
        if response.status_code == 200:
            tokens = response.json()
            print("\nListado de tokens disponibles:")
            for token in tokens:
                if token.get("codigo") == "123456":
                    print(f"Token encontrado: {token}")
                    return True
            print("El token creado no se encontró en la lista.")
            return False
        else:
            print(f"Error al verificar tokens. Código de estado: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error en la verificación: {str(e)}")
        return False

if __name__ == "__main__":
    print("Creando token con código '123456' para la cerradura ID 1...")
    if crear_token():
        verificar_token()