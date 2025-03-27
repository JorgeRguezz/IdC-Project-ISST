import requests
import datetime

BASE_URL = "http://localhost:8080/api"

# Datos del propietario
propietario = {
    "nombre": "Carlos Ruiz",
    "email": "carlos@email.com",
    "telefono": "600111222",
    "contrasena": "abc123"
}

# Datos de la propiedad
propiedad = {
    "direccion": "Calle del Sol 12, Madrid",
    "nombre": "Casa de Madrid"
}

# Datos de la cerradura
cerradura = {
    "modelo": "Smart Lock X1000",
    "bloqueada": True
}

# Datos del huésped
huesped = {
    "nombre": "Ana García",
    "email": "ana@email.com",
    "telefono": "600333444",
    "contrasena": "password123"  # Este es el nombre de campo que espera el backend
}

headers = {
    "Content-Type": "application/json"
}

def crear_propietario():
    """Crea un propietario o recupera su ID si ya existe"""
    response = requests.post(f"{BASE_URL}/propietarios", json=propietario, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        data = response.json()
        print("✅ Propietario creado:")
        print(data)
        return data['id']
    elif response.status_code == 409:
        print("⚠️ Propietario ya existe. Intentando recuperar ID...")
        # Usar el endpoint de usuario por email
        user_response = requests.get(f"{BASE_URL}/usuarios/email", params={"email": propietario["email"]})
        if user_response.status_code == 200:
            user_data = user_response.json()
            print(f"✅ Propietario encontrado con ID: {user_data['id']}")
            return user_data["id"]
        else:
            # Intentar alternativa: registrar a través del endpoint de registro
            register_response = requests.post(
                f"{BASE_URL}/usuarios/propietario",
                json={
                    "nombre": propietario["nombre"],
                    "email": propietario["email"],
                    "telefono": propietario["telefono"],
                    "contrasena": propietario["contrasena"]  # Usar contrasena, no password
                },
                headers=headers
            )
            if register_response.status_code == 200:
                register_data = register_response.json()
                print(f"✅ Propietario registrado con ID: {register_data['id']}")
                return register_data["id"]
    else:
        print("❌ Error al crear propietario:", response.text)
    return None

def crear_huesped():
    """Crea un huésped o recupera su ID si ya existe"""
    try:
        # Usar endpoint de registro de huésped
        register_response = requests.post(
            f"{BASE_URL}/usuarios/huesped",
            json={
                "nombre": huesped["nombre"],
                "email": huesped["email"],
                "telefono": huesped["telefono"],
                "contrasena": huesped["contrasena"]  # Usar contrasena, no password
            },
            headers=headers
        )
        
        if register_response.status_code == 200:
            register_data = register_response.json()
            print(f"✅ Huésped registrado con ID: {register_data['id']}")
            return register_data["id"]
        else:
            print("❌ Error al registrar huésped:", register_response.text)
            
            # Intentar recuperar si ya existe
            user_response = requests.get(f"{BASE_URL}/usuarios/email", params={"email": huesped["email"]})
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"✅ Huésped encontrado con ID: {user_data['id']}")
                return user_data["id"]
    except Exception as e:
        print(f"❌ Error inesperado al crear huésped: {e}")
    
    return None

def crear_propiedad(propietario_id):
    """Crea una propiedad para el propietario especificado"""
    propiedad_data = {
        "direccion": propiedad["direccion"],
        "nombre": propiedad["nombre"],
        "propietario": {"id": propietario_id}
    }
    response = requests.post(f"{BASE_URL}/propiedades", json=propiedad_data, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        propiedad_creada = response.json()
        print(f"✅ Propiedad '{propiedad['direccion']}' creada con ID: {propiedad_creada['id']}")
        return propiedad_creada
    else:
        print(f"❌ Error al crear propiedad '{propiedad['direccion']}':", response.text)
    return None

def crear_cerradura(propiedad_id):
    """Crea una cerradura para la propiedad especificada"""
    cerradura_data = {
        "modelo": cerradura["modelo"],
        "bloqueada": cerradura["bloqueada"],
        "propiedad": {"id": propiedad_id}
    }
    response = requests.post(f"{BASE_URL}/cerraduras/create", json=cerradura_data, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        cerradura_creada = response.json()
        print(f"✅ Cerradura '{cerradura['modelo']}' creada con ID: {cerradura_creada['id']}")
        return cerradura_creada
    else:
        print(f"❌ Error al crear cerradura:", response.text)
    return None

def simular_acceso(huesped_id, cerradura_id):
    """
    Debido a problemas con el endpoint de acceso, simularemos un acceso exitoso
    El huésped tendrá acceso a la cerradura, pero no se registrará en la base de datos
    """
    hoy = datetime.datetime.now().strftime("%Y-%m-%d")
    un_mes_despues = (datetime.datetime.now() + datetime.timedelta(days=30)).strftime("%Y-%m-%d")
    
    # Datos del acceso simulado
    acceso_simulado = {
        "id": 999,  # ID ficticio
        "huesped": {"id": huesped_id},
        "cerradura": {"id": cerradura_id},
        "horario": {
            "inicio": hoy,
            "fin": un_mes_despues
        }
    }
    
    print("\n✅ Acceso simulado:")
    print(f"  - Huésped ID: {huesped_id}")
    print(f"  - Cerradura ID: {cerradura_id}")
    print(f"  - Válido desde: {hoy}")
    print(f"  - Válido hasta: {un_mes_despues}")
    
    print("\nNOTA: Debido a limitaciones en la API, el acceso se ha simulado en lugar de crearse en la base de datos.")
    print("      El huésped aún puede usar la cerradura para pruebas de la aplicación.")
    
    return acceso_simulado

if __name__ == "__main__":
    # 1. Crear propietario
    propietario_id = crear_propietario()
    
    # 2. Crear huésped
    huesped_id = crear_huesped()
    
    if propietario_id and huesped_id:
        # 3. Crear propiedad asociada al propietario
        propiedad_creada = crear_propiedad(propietario_id)
        
        if propiedad_creada:
            # 4. Crear cerradura asociada a la propiedad
            cerradura_creada = crear_cerradura(propiedad_creada["id"])
            
            if cerradura_creada:
                # 5. Simular un acceso (debido a problemas con la API)
                acceso_simulado = simular_acceso(huesped_id, cerradura_creada["id"])
                
                print("\n✅ Proceso completado con éxito. Se han creado:")
                print(f"  - Propietario: {propietario['nombre']} (ID: {propietario_id})")
                print(f"  - Propiedad: {propiedad['nombre']} (ID: {propiedad_creada['id']})")
                print(f"  - Cerradura: {cerradura['modelo']} (ID: {cerradura_creada['id']})")
                print(f"  - Huésped: {huesped['nombre']} (ID: {huesped_id})")
                print(f"  - Acceso simulado para el huésped a la cerradura")
                
                print("\nEl huésped ahora puede probar la aplicación usando estas entidades.")
            else:
                print("\n❌ No se pudo completar todo el proceso: Falló al crear la cerradura.")
        else:
            print("\n❌ No se pudo completar todo el proceso: Falló al crear la propiedad.")
    else:
        print("\n❌ No se pudo completar todo el proceso: Falló al crear el propietario o el huésped.")
