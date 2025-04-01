import requests
import json

BASE_URL = "http://localhost:8080/api"

# Datos del huésped
huesped = {
    "nombre": "Ana López",
    "email": "ana@email.com",
    "telefono": "600000000",  # Número de teléfono genérico
    "contrasena": "ana"
}

headers = {
    "Content-Type": "application/json"
}

def crear_huesped():
    """Crea un huésped con los datos especificados o recupera su ID si ya existe"""
    print("\n🔍 Creando huésped...")
    try:
        # Usar endpoint de registro de huésped
        register_response = requests.post(
            f"{BASE_URL}/usuarios/huesped",
            json={
                "nombre": huesped["nombre"],
                "email": huesped["email"],
                "telefono": huesped["telefono"],
                "contrasena": huesped["contrasena"]
            },
            headers=headers
        )
        
        if register_response.status_code == 200:
            register_data = register_response.json()
            print(f"✅ Huésped {huesped['nombre']} registrado con ID: {register_data['id']}")
            return register_data["id"]
        elif register_response.status_code == 409:
            print(f"⚠️ El huésped con email {huesped['email']} ya existe. Intentando recuperar ID...")
            
            # Intentar recuperar si ya existe
            user_response = requests.get(f"{BASE_URL}/usuarios/email", params={"email": huesped["email"]})
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"✅ Huésped {huesped['nombre']} encontrado con ID: {user_data['id']}")
                return user_data["id"]
            else:
                print(f"❌ No se pudo recuperar el huésped existente: {user_response.text}")
        else:
            print(f"❌ Error al registrar huésped: {register_response.text}")
    except Exception as e:
        print(f"❌ Error inesperado al crear huésped: {e}")
    
    return None

def main():
    print("=== Creación de Huésped ===\n")
    print(f"Nombre: {huesped['nombre']}")
    print(f"Email: {huesped['email']}")
    print(f"Contraseña: {huesped['contrasena']}")
    
    huesped_id = crear_huesped()
    
    if huesped_id:
        print("\n✅ Proceso completado con éxito.")
    else:
        print("\n❌ No se pudo completar el proceso.")

if __name__ == "__main__":
    main()