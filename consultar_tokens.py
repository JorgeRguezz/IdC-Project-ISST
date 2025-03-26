import requests
import json
from datetime import datetime

# URL del endpoint para consultar tokens
url = "http://localhost:8080/api/tokens"

def consultar_tokens():
    try:
        # Realizar la petición GET para obtener todos los tokens
        response = requests.get(url)
        
        # Verificar si la petición fue exitosa
        if response.status_code == 200:
            tokens = response.json()
            print("\nListado de tokens disponibles:")
            print(json.dumps(tokens, indent=4))
            
            # Mostrar información resumida de cada token
            print("\nResumen de tokens:")
            for token in tokens:
                # Formatear la fecha de expiración si existe
                fecha_exp = token.get("fechaExpiracion")
                if fecha_exp:
                    fecha_exp = datetime.fromisoformat(fecha_exp.replace("Z", "+00:00"))
                    fecha_exp_str = fecha_exp.strftime("%d/%m/%Y %H:%M:%S")
                else:
                    fecha_exp_str = "Sin fecha de expiración"
                
                # Obtener información de la cerradura asociada
                cerradura = token.get("cerradura", {})
                cerradura_id = cerradura.get("id", "N/A") if cerradura else "N/A"
                
                # Calcular estado del token
                usos_actuales = token.get("usosActuales", 0)
                usos_maximos = token.get("usosMaximos", 0)
                
                if usos_maximos > 0 and usos_actuales >= usos_maximos:
                    estado = "Agotado"
                elif fecha_exp and datetime.now() > fecha_exp:
                    estado = "Expirado"
                else:
                    estado = "Válido"
                
                # Mostrar información resumida
                print(f"ID: {token.get('id')} | Código: {token.get('codigo')} | Estado: {estado}")
                print(f"  Cerradura: {cerradura_id} | Usos: {usos_actuales}/{usos_maximos if usos_maximos > 0 else '∞'} | Expira: {fecha_exp_str}")
                print("---")
            
            return True
        else:
            print(f"Error al consultar tokens. Código de estado: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"Error en la petición: {str(e)}")
        return False

def consultar_token_por_codigo(codigo):
    try:
        # Realizar la petición GET para obtener todos los tokens
        response = requests.get(url)
        
        # Verificar si la petición fue exitosa
        if response.status_code == 200:
            tokens = response.json()
            token_encontrado = None
            
            # Buscar el token con el código especificado
            for token in tokens:
                if token.get("codigo") == codigo:
                    token_encontrado = token
                    break
            
            if token_encontrado:
                print(f"\nInformación detallada del token con código '{codigo}':")
                print(json.dumps(token_encontrado, indent=4))
                return True
            else:
                print(f"\nNo se encontró ningún token con el código '{codigo}'.")
                return False
        else:
            print(f"Error al consultar tokens. Código de estado: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"Error en la petición: {str(e)}")
        return False

if __name__ == "__main__":
    print("Consultando todos los tokens disponibles...")
    if consultar_tokens():
        # Preguntar al usuario si desea consultar un token específico
        consultar_especifico = input("\n¿Desea consultar un token específico por su código? (s/n): ")
        if consultar_especifico.lower() == 's':
            codigo_token = input("Ingrese el código del token: ")
            consultar_token_por_codigo(codigo_token)