import requests
import json

# URL del endpoint para consultar cerraduras
url = "http://localhost:8080/api/cerraduras"

def consultar_cerraduras():
    try:
        # Realizar la petición GET para obtener todas las cerraduras
        response = requests.get(url)
        
        # Verificar si la petición fue exitosa
        if response.status_code == 200:
            cerraduras = response.json()
            print("\nListado de cerraduras disponibles:")
            print(json.dumps(cerraduras, indent=4))
            
            # Mostrar información resumida de cada cerradura
            print("\nResumen de cerraduras:")
            for cerradura in cerraduras:
                estado = "Bloqueada" if cerradura.get("bloqueada") else "Desbloqueada"
                propiedad = cerradura.get("propiedad", {})
                propiedad_nombre = propiedad.get("nombre", "Sin propiedad asignada") if propiedad else "Sin propiedad asignada"
                
                print(f"ID: {cerradura.get('id')} | Modelo: {cerradura.get('modelo')} | Estado: {estado} | Propiedad: {propiedad_nombre}")
            
            return True
        else:
            print(f"Error al consultar cerraduras. Código de estado: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"Error en la petición: {str(e)}")
        return False

def consultar_cerradura_por_id(id):
    try:
        # Realizar la petición GET para obtener una cerradura específica
        response = requests.get(f"{url}/{id}")
        
        # Verificar si la petición fue exitosa
        if response.status_code == 200:
            cerradura = response.json()
            print(f"\nInformación de la cerradura ID {id}:")
            print(json.dumps(cerradura, indent=4))
            return True
        else:
            print(f"Error al consultar la cerradura ID {id}. Código de estado: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"Error en la petición: {str(e)}")
        return False

if __name__ == "__main__":
    print("Consultando todas las cerraduras disponibles...")
    if consultar_cerraduras():
        # Preguntar al usuario si desea consultar una cerradura específica
        consultar_especifica = input("\n¿Desea consultar una cerradura específica? (s/n): ")
        if consultar_especifica.lower() == 's':
            id_cerradura = input("Ingrese el ID de la cerradura: ")
            consultar_cerradura_por_id(id_cerradura)