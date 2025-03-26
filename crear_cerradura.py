import requests
import json

# URL del endpoint para crear cerraduras
url = "http://localhost:8080/api/cerraduras"

# Datos de la cerradura a crear
cerradura_data = {
    "modelo": "Smart Lock Pro",
    "bloqueada": True
    # No asociamos a ninguna propiedad por ahora
}

# Cabeceras para la petición
headers = {
    "Content-Type": "application/json"
}

def crear_cerradura():
    try:
        # Realizar la petición POST para crear la cerradura
        response = requests.post(url, json=cerradura_data, headers=headers)
        
        # Verificar si la petición fue exitosa
        if response.status_code == 200:
            cerradura_creada = response.json()
            print("Cerradura creada exitosamente:")
            print(json.dumps(cerradura_creada, indent=4))
            return cerradura_creada
        else:
            print(f"Error al crear la cerradura. Código de estado: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"Error en la petición: {str(e)}")
        return None

def verificar_cerradura(cerradura_id):
    try:
        # Realizar una petición GET para obtener la cerradura creada
        response = requests.get(f"{url}/{cerradura_id}")
        
        if response.status_code == 200:
            cerradura = response.json()
            print(f"\nVerificación de la cerradura creada (ID {cerradura_id}):")
            print(json.dumps(cerradura, indent=4))
            return True
        else:
            print(f"Error al verificar la cerradura ID {cerradura_id}. Código de estado: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error en la verificación: {str(e)}")
        return False

if __name__ == "__main__":
    print("Creando nueva cerradura...")
    cerradura_creada = crear_cerradura()
    if cerradura_creada:
        cerradura_id = cerradura_creada.get('id')
        verificar_cerradura(cerradura_id)