import requests

BASE_URL = "http://localhost:8080/api"

# Datos del propietario
propietario = {
    "nombre": "Carlos Ruiz",
    "email": "carlos@email.com",
    "telefono": "600111222",
    "contrasena": "abc123"
}

# Propiedades que se le van a asignar
propiedades = [
    {"direccion": "Calle del Sol 12, Madrid","nombre": "Casa de Madrid"},
    {"direccion": "Avenida del Mar 5, Valencia","nombre": "Casa de Valencia"}
]

headers = {
    "Content-Type": "application/json"
}

def crear_propietario():
    response = requests.post(f"{BASE_URL}/propietarios", json=propietario, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        data = response.json()
        print("✅ Propietario creado:")
        print(data)
        return data['id']
    elif response.status_code == 409:
        print("⚠️ Propietario ya existe. Intentando recuperar ID...")
        user = requests.get(f"{BASE_URL}/usuarios/email", params={"email": propietario["email"]})
        if user.status_code == 200:
            return user.json()["id"]
    else:
        print("❌ Error al crear propietario:", response.text)
    return None

def crear_propiedades(propietario_id):
    for p in propiedades:
        propiedad_data = {
            "direccion": p["direccion"],
            "nombre": p["nombre"],
            "propietario": {"id": propietario_id}
        }
        response = requests.post(f"{BASE_URL}/propiedades", json=propiedad_data, headers=headers)
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ Propiedad '{p['direccion']}' creada.")
        else:
            print(f"❌ Error al crear propiedad '{p['direccion']}':", response.text)

if __name__ == "__main__":
    propietario_id = crear_propietario()
    if propietario_id:
        crear_propiedades(propietario_id)
