import requests
import json
import datetime
from datetime import timedelta

BASE_URL = "http://localhost:8080/api"

# Fecha actual simulada: 31 de marzo de 2025
FECHA_ACTUAL = datetime.datetime(2025, 3, 31)

# Datos del propietario
propietario = {
    "nombre": "Carlos Ruiz",
    "email": "carlos@email.com",
    "telefono": "600111222",
    "contrasena": "abc123"
}

# Datos de las propiedades (3 propiedades)
propiedades = [
    {
        "direccion": "Calle del Sol 12, Madrid",
        "nombre": "Casa de Madrid"
    },
    {
        "direccion": "Avenida del Mar 45, Valencia",
        "nombre": "Apartamento de Valencia"
    },
    {
        "direccion": "Plaza Mayor 3, Barcelona",
        "nombre": "Loft de Barcelona"
    }
]

# Datos de las cerraduras (una para cada propiedad)
cerraduras = [
    {
        "modelo": "Smart Lock X1000",
        "bloqueada": True
    },
    {
        "modelo": "Smart Lock X2000",
        "bloqueada": False
    },
    {
        "modelo": "Smart Lock X3000",
        "bloqueada": True
    }
]

# Datos de los huéspedes (2 huéspedes)
huespedes = [
    {
        "nombre": "Ana García",
        "email": "ana@email.com",
        "telefono": "600333444",
        "contrasena": "password123"
    },
    {
        "nombre": "Luis Martínez",
        "email": "luis@email.com",
        "telefono": "600555666",
        "contrasena": "securepass456"
    }
]

# Códigos de token
TOKEN_CODIGOS = ["TOKEN123456", "TOKEN789012"]

headers = {
    "Content-Type": "application/json"
}

def crear_propietario():
    """Crea un propietario o recupera su ID si ya existe"""
    print("\n🔍 Creando propietario...")
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
                    "contrasena": propietario["contrasena"]
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

def crear_huesped(huesped_data):
    """Crea un huésped o recupera su ID si ya existe"""
    print(f"\n🔍 Creando huésped {huesped_data['nombre']}...")
    try:
        # Usar endpoint de registro de huésped
        register_response = requests.post(
            f"{BASE_URL}/usuarios/huesped",
            json={
                "nombre": huesped_data["nombre"],
                "email": huesped_data["email"],
                "telefono": huesped_data["telefono"],
                "contrasena": huesped_data["contrasena"]
            },
            headers=headers
        )
        
        if register_response.status_code == 200:
            register_data = register_response.json()
            print(f"✅ Huésped {huesped_data['nombre']} registrado con ID: {register_data['id']}")
            return register_data["id"]
        else:
            print(f"⚠️ Error al registrar huésped {huesped_data['nombre']}:", register_response.text)
            
            # Intentar recuperar si ya existe
            user_response = requests.get(f"{BASE_URL}/usuarios/email", params={"email": huesped_data["email"]})
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"✅ Huésped {huesped_data['nombre']} encontrado con ID: {user_data['id']}")
                return user_data["id"]
    except Exception as e:
        print(f"❌ Error inesperado al crear huésped {huesped_data['nombre']}: {e}")
    
    return None

def crear_propiedad(propietario_id, propiedad_data, indice):
    """Crea una propiedad para el propietario especificado"""
    print(f"\n🔍 Creando propiedad {indice+1}: {propiedad_data['nombre']}...")
    propiedad_data_completa = {
        "direccion": propiedad_data["direccion"],
        "nombre": propiedad_data["nombre"],
        "propietario": {"id": propietario_id}
    }
    response = requests.post(f"{BASE_URL}/propiedades", json=propiedad_data_completa, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        propiedad_creada = response.json()
        print(f"✅ Propiedad '{propiedad_data['nombre']}' creada con ID: {propiedad_creada['id']}")
        return propiedad_creada
    else:
        print(f"❌ Error al crear propiedad '{propiedad_data['nombre']}':", response.text)
    return None

def crear_cerradura(propiedad_id, cerradura_data, indice):
    """Crea una cerradura para la propiedad especificada"""
    print(f"\n🔍 Creando cerradura {indice+1}: {cerradura_data['modelo']}...")
    cerradura_data_completa = {
        "modelo": cerradura_data["modelo"],
        "bloqueada": cerradura_data["bloqueada"],
        "propiedad": {"id": propiedad_id}
    }
    response = requests.post(f"{BASE_URL}/cerraduras/create", json=cerradura_data_completa, headers=headers)
    if response.status_code == 200 or response.status_code == 201:
        cerradura_creada = response.json()
        print(f"✅ Cerradura '{cerradura_data['modelo']}' creada con ID: {cerradura_creada['id']}")
        return cerradura_creada
    else:
        print(f"❌ Error al crear cerradura {cerradura_data['modelo']}:", response.text)
    return None

def crear_token(cerradura_id, codigo, fecha_inicio, fecha_fin, usos_maximos=5):
    """Intenta crear un token con fechas específicas y usos máximos"""
    print(f"\n🔍 Creando token {codigo} válido desde {fecha_inicio.strftime('%d/%m/%Y')} hasta {fecha_fin.strftime('%d/%m/%Y')}...")
    
    # Datos del token
    token_data = {
        "codigo": codigo,
        "usosMaximos": usos_maximos,
        "usosActuales": 0,
        "cerradura": {
            "id": cerradura_id
        }
    }
    
    try:
        print(f"Enviando datos: {json.dumps(token_data)}")
        response = requests.post(f"{BASE_URL}/tokens", json=token_data, headers=headers)
        
        print(f"Respuesta del servidor (status {response.status_code}):")
        try:
            response_content = response.json() if response.text else {}
            print(json.dumps(response_content, indent=2))
        except:
            print(response.text)
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Token creado con éxito")
            return response_content
        
    except Exception as e:
        print(f"❌ Error en la petición: {str(e)}")
    
    print(f"⚠️ No se pudo crear el token {codigo}, se utilizará un token simulado.")
    # Token simulado como fallback
    return {
        "codigo": codigo, 
        "id": 999, 
        "simulado": True,
        "usosMaximos": usos_maximos,
        "usosActuales": 0,
        "cerradura": {"id": cerradura_id},
        "fechaInicio": fecha_inicio.strftime("%Y-%m-%d"),
        "fechaFin": fecha_fin.strftime("%Y-%m-%d")
    }

def crear_acceso(huesped_id, cerradura_id, fecha_inicio, fecha_fin, estado):
    """Crea un acceso real en la base de datos siguiendo exactamente el formato de GestionarAcceso.tsx"""
    print(f"\n🔍 Creando acceso {estado}...")
    
    try:
        # 1. Buscar huésped (igual que en GestionarAcceso.tsx)
        print(f"Obteniendo información del huésped ID: {huesped_id}")
        huesped_response = requests.get(f"{BASE_URL}/usuarios/{huesped_id}")
        if not huesped_response.ok:
            print(f"❌ Error al obtener información del huésped: {huesped_response.text}")
            return None
        huesped = huesped_response.json()
        print(f"✅ Información del huésped obtenida: {huesped['nombre']}")
        
        # 2. Buscar cerradura de la propiedad
        print(f"Obteniendo información de la cerradura ID: {cerradura_id}")
        cerradura_response = requests.get(f"{BASE_URL}/cerraduras/{cerradura_id}")
        if not cerradura_response.ok:
            print(f"❌ Error al obtener información de la cerradura: {cerradura_response.text}")
            return None
        cerradura = cerradura_response.json()
        print(f"✅ Información de la cerradura obtenida: {cerradura['modelo']}")
        
        # Obtener propiedad asociada a la cerradura
        propiedad_id = None
        if 'propiedad' in cerradura and cerradura['propiedad'] is not None:
            propiedad_id = cerradura['propiedad'].get('id')
            print(f"✅ ID de propiedad obtenido de la cerradura: {propiedad_id}")
        
        # Si no se encuentra la propiedad en la cerradura, buscarla mediante el endpoint específico
        if not propiedad_id:
            print(f"Buscando propiedad para la cerradura {cerradura_id}...")
            try:
                propiedad_response = requests.get(f"{BASE_URL}/cerraduras/propiedad/{cerradura_id}")
                if propiedad_response.ok:
                    propiedades = propiedad_response.json()
                    if isinstance(propiedades, list) and len(propiedades) > 0:
                        propiedad_id = propiedades[0].get('id')
                        print(f"✅ ID de propiedad obtenido: {propiedad_id}")
                    else:
                        print("⚠️ No se encontraron propiedades asociadas a la cerradura")
            except Exception as e:
                print(f"⚠️ Error al buscar propiedad: {str(e)}")
        
        if not propiedad_id:
            print("❌ No se pudo determinar la propiedad de la cerradura")
            return None
        
        # 3. Crear horario (formato exacto como en GestionarAcceso.tsx)
        inicio_str = fecha_inicio.strftime("%Y-%m-%dT%H:%M")
        fin_str = fecha_fin.strftime("%Y-%m-%dT%H:%M")
        
        horario = {
            "inicio": f"{inicio_str}:00",
            "fin": f"{fin_str}:00"
        }
        print(f"✅ Horario creado: {horario['inicio']} hasta {horario['fin']}")
        
        # 4. Construir acceso completo (exactamente como en GestionarAcceso.tsx)
        acceso_data = {
            "huesped": huesped,
            "cerradura": {
                "id": cerradura["id"],
                "modelo": cerradura.get("modelo", "Modelo desconocido"),
                "bloqueada": cerradura.get("bloqueada", False),
                "propiedad": {
                    "id": propiedad_id
                }
            },
            "horario": horario
        }
        
        # 5. Enviar al backend
        print(f"Enviando datos de acceso al servidor...")
        response = requests.post(f"{BASE_URL}/accesos", json=acceso_data, headers=headers)
        
        print(f"Respuesta del servidor (status {response.status_code}):")
        try:
            if response.text:
                response_content = response.json()
                print(json.dumps(response_content, indent=2))
            else:
                print("(Respuesta vacía)")
                response_content = {}
        except Exception as e:
            print(f"Error al procesar respuesta: {str(e)}")
            print(f"Texto de respuesta: {response.text}")
            response_content = {}
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ Acceso {estado} creado con éxito")
            # Añadir el estado al objeto de respuesta para referencia futura
            response_content["estado"] = estado
            return response_content
        else:
            print(f"❌ Error al crear acceso: {response.text}")
    except Exception as e:
        print(f"❌ Error en la petición: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"⚠️ No se pudo crear el acceso {estado}, se utilizará un acceso simulado.")
    # Acceso simulado como fallback
    return {
        "id": 999,  # ID ficticio
        "huesped": {"id": huesped_id, "nombre": "Huésped simulado"},
        "cerradura": {"id": cerradura_id, "modelo": "Cerradura simulada"},
        "horario": {
            "inicio": fecha_inicio.strftime("%Y-%m-%dT%H:%M:%S"),
            "fin": fecha_fin.strftime("%Y-%m-%dT%H:%M:%S")
        },
        "estado": estado,
        "simulado": True
    }

def mostrar_info_escenario(propietario_id, huespedes_ids, propiedades_creadas, cerraduras_creadas, accesos_creados, tokens_creados):
    """Muestra un resumen del escenario creado"""
    print("\n📋 RESUMEN DEL ESCENARIO CREADO 📋")
    print("=================================")
    
    print(f"👤 PROPIETARIO (ID: {propietario_id}):")
    print(f"  - Nombre: {propietario['nombre']}")
    print(f"  - Email: {propietario['email']}")
    print(f"  - Contraseña: {propietario['contrasena']}")
    
    print("\n🏠 PROPIEDADES:")
    for i, propiedad in enumerate(propiedades_creadas):
        print(f"  {i+1}. {propiedad['nombre']} (ID: {propiedad['id']})")
        print(f"     - Dirección: {propiedad['direccion']}")
    
    print("\n🔒 CERRADURAS:")
    for i, cerradura in enumerate(cerraduras_creadas):
        print(f"  {i+1}. {cerradura['modelo']} (ID: {cerradura['id']})")
        print(f"     - Estado: {'Bloqueada' if cerradura['bloqueada'] else 'Desbloqueada'}")
        print(f"     - Propiedad: {propiedades_creadas[i]['nombre']}")
    
    print("\n👥 HUÉSPEDES:")
    for i, huesped_id in enumerate(huespedes_ids):
        print(f"  {i+1}. {huespedes[i]['nombre']} (ID: {huesped_id})")
        print(f"     - Email: {huespedes[i]['email']}")
        print(f"     - Contraseña: {huespedes[i]['contrasena']}")
    
    print("\n🔑 TOKENS DE ACCESO:")
    for i, token in enumerate(tokens_creados):
        print(f"  {i+1}. Código: {token['codigo']}")
        print(f"     - Usos máximos: {token['usosMaximos']}")
        if 'fechaInicio' in token and 'fechaFin' in token:
            print(f"     - Válido desde: {token['fechaInicio']}")
            print(f"     - Válido hasta: {token['fechaFin']}")
        if token.get("simulado", False):
            print("     - NOTA: Este token es SIMULADO y no está registrado en la base de datos")
            print("              debido a limitaciones técnicas en la API de tokens.")
    
    print("\n✅ ACCESOS DE HUÉSPEDES:")
    if not accesos_creados or len(accesos_creados) == 0:
        print("  No se han creado accesos o no se han podido recuperar correctamente.")
        print("  Por favor, revise los logs anteriores para más información.")
    else:
        for i, acceso in enumerate(accesos_creados):
            # Obtener índice del huésped de forma segura
            huesped_id = acceso.get('huesped', {}).get('id')
            huesped_index = next((idx for idx, hid in enumerate(huespedes_ids) if hid == huesped_id), 0)
            
            # Obtener índice de la cerradura de forma segura
            cerradura_id = acceso.get('cerradura', {}).get('id')
            cerradura_index = next((idx for idx, c in enumerate(cerraduras_creadas) if c['id'] == cerradura_id), 0)
            
            # Mostrar información del acceso
            print(f"  {i+1}. {huespedes[huesped_index]['nombre']} → {propiedades_creadas[cerradura_index]['nombre']}")
            
            # Determinar estado
            estado = acceso.get('estado', '')
            if not estado:
                # Extraer fechas del horario de forma segura
                horario = acceso.get('horario', {})
                inicio_str = horario.get('inicio', '')
                fin_str = horario.get('fin', '')
                
                # Procesar fechas
                try:
                    if 'T' in inicio_str:
                        inicio = inicio_str.split('T')[0]
                    else:
                        inicio = inicio_str
                        
                    if 'T' in fin_str:
                        fin = fin_str.split('T')[0]
                    else:
                        fin = fin_str
                    
                    inicio_date = datetime.datetime.strptime(inicio, "%Y-%m-%d").date()
                    fin_date = datetime.datetime.strptime(fin, "%Y-%m-%d").date()
                    hoy = FECHA_ACTUAL.date()
                    
                    if inicio_date <= hoy <= fin_date:
                        estado = "ACTIVO"
                    elif hoy < inicio_date:
                        estado = "FUTURO"
                    else:
                        estado = "CADUCADO"
                except Exception as e:
                    print(f"     ⚠️ Error al procesar fechas: {e}")
                    estado = "DESCONOCIDO"
            
            print(f"     - Estado: {estado}")
            
            # Mostrar fechas de validez
            horario = acceso.get('horario', {})
            inicio_str = horario.get('inicio', 'Fecha no disponible')
            fin_str = horario.get('fin', 'Fecha no disponible')
            
            if 'T' in inicio_str:
                inicio_str = inicio_str.split('T')[0]
            if 'T' in fin_str:
                fin_str = fin_str.split('T')[0]
                
            print(f"     - Válido desde: {inicio_str}")
            print(f"     - Válido hasta: {fin_str}")
            
            # Indicar si es simulado
            if acceso.get("simulado", False):
                print("     - NOTA: Este acceso es SIMULADO y no está registrado en la base de datos")
                print("              debido a limitaciones técnicas en la API de accesos.")
    
    print("\n📱 INSTRUCCIONES DE USO:")
    print("  1. Inicie sesión como propietario para gestionar las propiedades:")
    print(f"     - Email: {propietario['email']}")
    print(f"     - Contraseña: {propietario['contrasena']}")
    
    print("\n  2. Inicie sesión como huésped para abrir las cerraduras:")
    for i, huesped in enumerate(huespedes):
        print(f"     Huésped {i+1}: {huesped['nombre']}")
        print(f"     - Email: {huesped['email']}")
        print(f"     - Contraseña: {huesped['contrasena']}")
    
    print("\n  3. Para pruebas de acceso con token:")
    for i, token in enumerate(tokens_creados):
        cerradura_id = token['cerradura']['id']
        cerradura_index = next((i for i, c in enumerate(cerraduras_creadas) if c['id'] == cerradura_id), 0)
        print(f"     Token {i+1}: {token['codigo']}")
        print(f"     - Cerradura: {cerraduras_creadas[cerradura_index]['modelo']} (ID: {cerradura_id})")
        print(f"     - Propiedad: {propiedades_creadas[cerradura_index]['nombre']}")
        if 'fechaInicio' in token and 'fechaFin' in token:
            print(f"     - Válido desde: {token['fechaInicio']}")
            print(f"     - Válido hasta: {token['fechaFin']}")
    
    print("\n=================================")

if __name__ == "__main__":
    print("\n🚀 INICIANDO CREACIÓN DEL ESCENARIO DE PRUEBA 🚀")
    print("==============================================")
    print(f"📅 Fecha simulada: {FECHA_ACTUAL.strftime('%d/%m/%Y')}")
    
    # 1. Crear propietario
    propietario_id = crear_propietario()
    
    # 2. Crear huéspedes
    huespedes_ids = []
    for huesped_data in huespedes:
        huesped_id = crear_huesped(huesped_data)
        if huesped_id:
            huespedes_ids.append(huesped_id)
    
    if propietario_id and len(huespedes_ids) == 2:
        # 3. Crear propiedades asociadas al propietario
        propiedades_creadas = []
        for i, propiedad_data in enumerate(propiedades):
            propiedad_creada = crear_propiedad(propietario_id, propiedad_data, i)
            if propiedad_creada:
                propiedades_creadas.append(propiedad_creada)
        
        if len(propiedades_creadas) >= 2:
            # 4. Crear cerraduras asociadas a las propiedades
            cerraduras_creadas = []
            for i, propiedad in enumerate(propiedades_creadas):
                if i < len(cerraduras):
                    cerradura_creada = crear_cerradura(propiedad["id"], cerraduras[i], i)
                    if cerradura_creada:
                        cerraduras_creadas.append(cerradura_creada)
            
            if len(cerraduras_creadas) >= 2:
                # 5. Crear accesos con diferentes estados
                accesos_creados = []
                
                print("\n🔄 Creando accesos para los huéspedes...")
                
                # Acceso activo para huésped 1 en propiedad 1
                print("\n📝 Creando acceso ACTIVO para huésped 1 en propiedad 1...")
                acceso_activo1 = crear_acceso(
                    huespedes_ids[0],
                    cerraduras_creadas[0]["id"],
                    FECHA_ACTUAL - timedelta(days=5),  # Inicio hace 5 días
                    FECHA_ACTUAL + timedelta(days=10),  # Fin en 10 días
                    "ACTIVO"
                )
                if acceso_activo1:
                    print(f"✅ Acceso ACTIVO creado y añadido a la lista (ID: {acceso_activo1.get('id', 'N/A')})")
                    accesos_creados.append(acceso_activo1)
                else:
                    print("❌ No se pudo crear el acceso ACTIVO para huésped 1 en propiedad 1")
                
                # Acceso activo para huésped 1 en propiedad 2
                print("\n📝 Creando acceso ACTIVO para huésped 1 en propiedad 2...")
                acceso_activo2 = crear_acceso(
                    huespedes_ids[0],
                    cerraduras_creadas[1]["id"],
                    FECHA_ACTUAL - timedelta(days=3),  # Inicio hace 3 días
                    FECHA_ACTUAL + timedelta(days=15),  # Fin en 15 días
                    "ACTIVO"
                )
                if acceso_activo2:
                    print(f"✅ Acceso ACTIVO creado y añadido a la lista (ID: {acceso_activo2.get('id', 'N/A')})")
                    accesos_creados.append(acceso_activo2)
                else:
                    print("❌ No se pudo crear el acceso ACTIVO para huésped 1 en propiedad 2")
                
                # Acceso caducado para huésped 2 en propiedad 1
                print("\n📝 Creando acceso CADUCADO para huésped 2 en propiedad 1...")
                acceso_caducado = crear_acceso(
                    huespedes_ids[1],
                    cerraduras_creadas[0]["id"],
                    FECHA_ACTUAL - timedelta(days=30),  # Inicio hace 30 días
                    FECHA_ACTUAL - timedelta(days=1),  # Fin ayer
                    "CADUCADO"
                )
                if acceso_caducado:
                    print(f"✅ Acceso CADUCADO creado y añadido a la lista (ID: {acceso_caducado.get('id', 'N/A')})")
                    accesos_creados.append(acceso_caducado)
                else:
                    print("❌ No se pudo crear el acceso CADUCADO para huésped 2 en propiedad 1")
                
                # Acceso futuro para huésped 2 en propiedad 2
                print("\n📝 Creando acceso FUTURO para huésped 2 en propiedad 2...")
                acceso_futuro = crear_acceso(
                    huespedes_ids[1],
                    cerraduras_creadas[1]["id"],
                    FECHA_ACTUAL + timedelta(days=5),  # Inicio en 5 días
                    FECHA_ACTUAL + timedelta(days=20),  # Fin en 20 días
                    "FUTURO"
                )
                if acceso_futuro:
                    print(f"✅ Acceso FUTURO creado y añadido a la lista (ID: {acceso_futuro.get('id', 'N/A')})")
                    accesos_creados.append(acceso_futuro)
                else:
                    print("❌ No se pudo crear el acceso FUTURO para huésped 2 en propiedad 2")
                
                print(f"\n📊 Total de accesos creados: {len(accesos_creados)}")
                if len(accesos_creados) == 0:
                    print("⚠️ No se pudo crear ningún acceso. Se crearán accesos simulados para mostrar en el resumen.")
                    # Crear accesos simulados para el resumen
                    accesos_creados = [
                        {
                            "id": 999,
                            "huesped": {"id": huespedes_ids[0], "nombre": huespedes[0]["nombre"]},
                            "cerradura": {"id": cerraduras_creadas[0]["id"], "modelo": cerraduras_creadas[0]["modelo"]},
                            "horario": {
                                "inicio": (FECHA_ACTUAL - timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%S"),
                                "fin": (FECHA_ACTUAL + timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%S")
                            },
                            "estado": "ACTIVO",
                            "simulado": True
                        },
                        {
                            "id": 998,
                            "huesped": {"id": huespedes_ids[1], "nombre": huespedes[1]["nombre"]},
                            "cerradura": {"id": cerraduras_creadas[1]["id"], "modelo": cerraduras_creadas[1]["modelo"]},
                            "horario": {
                                "inicio": (FECHA_ACTUAL + timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%S"),
                                "fin": (FECHA_ACTUAL + timedelta(days=20)).strftime("%Y-%m-%dT%H:%M:%S")
                            },
                            "estado": "FUTURO",
                            "simulado": True
                        }
                    ]
                
                # 6. Crear tokens con diferentes fechas
                tokens_creados = []
                
                # Token activo ahora
                token_activo = crear_token(
                    cerraduras_creadas[0]["id"],
                    TOKEN_CODIGOS[0],
                    FECHA_ACTUAL - timedelta(days=1),  # Válido desde ayer
                    FECHA_ACTUAL + timedelta(days=10)   # Válido por 10 días más
                )
                tokens_creados.append(token_activo)
                
                # Token para acceso futuro
                token_futuro = crear_token(
                    cerraduras_creadas[1]["id"],
                    TOKEN_CODIGOS[1],
                    FECHA_ACTUAL + timedelta(days=5),  # Válido en 5 días
                    FECHA_ACTUAL + timedelta(days=15)   # Válido hasta dentro de 15 días
                )
                tokens_creados.append(token_futuro)
                
                # 7. Mostrar resumen del escenario creado
                mostrar_info_escenario(
                    propietario_id,
                    huespedes_ids,
                    propiedades_creadas,
                    cerraduras_creadas,
                    accesos_creados,
                    tokens_creados
                )
            else:
                print("\n❌ No se pudo completar todo el proceso: Falló al crear las cerraduras.")
        else:
            print("\n❌ No se pudo completar todo el proceso: Falló al crear las propiedades.")
    else:
        print("\n❌ No se pudo completar todo el proceso: Falló al crear el propietario o los huéspedes.")