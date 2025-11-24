"""
Script para expandir los sectores disponibles en la base de datos

Este script:
1. Verifica sectores existentes
2. Agrega nuevos sectores más completos y diversos
3. Mantiene los sectores existentes activos
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal
from sqlalchemy import text


def expandir_sectores():
    """Expande la lista de sectores disponibles"""

    db = SessionLocal()

    try:
        print("\n" + "=" * 80)
        print("EXPANDIENDO SECTORES DISPONIBLES")
        print("=" * 80 + "\n")

        # 1. Ver sectores existentes usando SQL directo
        print("1️⃣ Sectores actuales en la base de datos:\n")
        result = db.execute(text("SELECT id, nombre, activo FROM sectores"))
        sectores_existentes = result.fetchall()

        for sector in sectores_existentes:
            print(f"   - ID {sector[0]}: {sector[1]} (Activo: {sector[2]})")

        print(f"\n   Total actual: {len(sectores_existentes)} sectores\n")

        # 2. Nuevos sectores a agregar
        nuevos_sectores = [
            # Tecnología e Innovación
            {
                "nombre": "Tecnología de la Información",
                "descripcion": "Software, hardware, servicios IT",
            },
            {
                "nombre": "Telecomunicaciones",
                "descripcion": "Redes, infraestructura de comunicaciones",
            },
            {
                "nombre": "Inteligencia Artificial",
                "descripcion": "IA, ML, automatización inteligente",
            },
            {
                "nombre": "Blockchain y Criptomonedas",
                "descripcion": "DLT, fintech blockchain",
            },
            {
                "nombre": "Ciberseguridad",
                "descripcion": "Seguridad informática, protección de datos",
            },
            # Energía y Medio Ambiente
            {
                "nombre": "Energía Renovable",
                "descripcion": "Solar, eólica, hidroeléctrica",
            },
            {
                "nombre": "Petróleo y Gas",
                "descripcion": "Exploración, extracción, refinación",
            },
            {
                "nombre": "Gestión de Residuos",
                "descripcion": "Reciclaje, tratamiento de residuos",
            },
            {
                "nombre": "Agua y Saneamiento",
                "descripcion": "Tratamiento de agua, infraestructura",
            },
            # Manufactura e Industria
            {
                "nombre": "Manufactura y Producción",
                "descripcion": "Fabricación industrial",
            },
            {"nombre": "Automotriz", "descripcion": "Vehículos, autopartes, movilidad"},
            {"nombre": "Aeroespacial", "descripcion": "Aviación, industria espacial"},
            {
                "nombre": "Química y Petroquímica",
                "descripcion": "Productos químicos, materiales",
            },
            {"nombre": "Textil y Confección", "descripcion": "Ropa, textiles, moda"},
            # Construcción e Infraestructura
            {"nombre": "Construcción", "descripcion": "Edificación, obras civiles"},
            {
                "nombre": "Ingeniería Civil",
                "descripcion": "Infraestructura, puentes, carreteras",
            },
            {
                "nombre": "Arquitectura y Diseño",
                "descripcion": "Diseño arquitectónico, urbanismo",
            },
            {
                "nombre": "Bienes Raíces",
                "descripcion": "Inmobiliario, gestión de propiedades",
            },
            # Servicios Financieros
            {
                "nombre": "Banca y Finanzas",
                "descripcion": "Servicios bancarios, financieros",
            },
            {"nombre": "Seguros", "descripcion": "Seguros generales, vida, salud"},
            {"nombre": "Inversiones", "descripcion": "Gestión de activos, fondos"},
            {
                "nombre": "Contabilidad y Auditoría",
                "descripcion": "Servicios contables, auditoría",
            },
            # Comercio y Retail
            {
                "nombre": "Comercio Minorista",
                "descripcion": "Retail, tiendas, supermercados",
            },
            {
                "nombre": "E-commerce",
                "descripcion": "Comercio electrónico, marketplaces",
            },
            {
                "nombre": "Mayorista y Distribución",
                "descripcion": "Distribución, logística comercial",
            },
            {"nombre": "Franquicias", "descripcion": "Modelos de franquicia"},
            # Transporte y Logística
            {"nombre": "Transporte Terrestre", "descripcion": "Camiones, buses, taxis"},
            {
                "nombre": "Transporte Marítimo",
                "descripcion": "Navieras, puertos, shipping",
            },
            {"nombre": "Transporte Aéreo", "descripcion": "Aerolíneas, carga aérea"},
            {
                "nombre": "Logística y Supply Chain",
                "descripcion": "Cadena de suministro, almacenaje",
            },
            # Salud y Bienestar
            {
                "nombre": "Salud y Medicina",
                "descripcion": "Hospitales, clínicas, servicios médicos",
            },
            {
                "nombre": "Farmacéutica",
                "descripcion": "Medicamentos, biotecnología médica",
            },
            {
                "nombre": "Dispositivos Médicos",
                "descripcion": "Equipamiento médico, tecnología sanitaria",
            },
            {
                "nombre": "Bienestar y Fitness",
                "descripcion": "Gimnasios, wellness, salud preventiva",
            },
            # Alimentación y Agricultura
            {"nombre": "Agricultura", "descripcion": "Cultivos, producción agrícola"},
            {"nombre": "Ganadería", "descripcion": "Producción animal, carne, lácteos"},
            {"nombre": "Pesca y Acuicultura", "descripcion": "Pesca, cultivos marinos"},
            {
                "nombre": "Alimentos y Bebidas",
                "descripcion": "Procesamiento, producción alimentaria",
            },
            {
                "nombre": "Restaurantes y Gastronomía",
                "descripcion": "Servicios de alimentación, catering",
            },
            # Educación y Formación
            {
                "nombre": "Educación",
                "descripcion": "Instituciones educativas, enseñanza",
            },
            {
                "nombre": "E-learning",
                "descripcion": "Educación online, plataformas digitales",
            },
            {
                "nombre": "Capacitación Corporativa",
                "descripcion": "Training empresarial",
            },
            # Medios y Entretenimiento
            {
                "nombre": "Medios de Comunicación",
                "descripcion": "Prensa, radio, televisión",
            },
            {
                "nombre": "Publicidad y Marketing",
                "descripcion": "Agencias, marketing digital",
            },
            {"nombre": "Entretenimiento", "descripcion": "Cine, música, eventos"},
            {
                "nombre": "Videojuegos",
                "descripcion": "Desarrollo, publicación de juegos",
            },
            # Turismo y Hospitalidad
            {"nombre": "Turismo", "descripcion": "Agencias, operadores turísticos"},
            {"nombre": "Hotelería", "descripcion": "Hoteles, alojamiento"},
            {
                "nombre": "Eventos y Conferencias",
                "descripcion": "Organización de eventos",
            },
            # Servicios Profesionales
            {
                "nombre": "Consultoría",
                "descripcion": "Consultoría empresarial, estratégica",
            },
            {"nombre": "Legal", "descripcion": "Servicios jurídicos, asesoría legal"},
            {
                "nombre": "Recursos Humanos",
                "descripcion": "RRHH, reclutamiento, gestión de talento",
            },
            {"nombre": "Investigación y Desarrollo", "descripcion": "I+D, innovación"},
            # Otros
            {
                "nombre": "ONGs y Organizaciones Sociales",
                "descripcion": "Tercer sector, impacto social",
            },
            {
                "nombre": "Gobierno y Sector Público",
                "descripcion": "Instituciones públicas",
            },
            {"nombre": "Deportes", "descripcion": "Clubes, gestión deportiva"},
            {
                "nombre": "Arte y Cultura",
                "descripcion": "Galerías, museos, producción cultural",
            },
            {"nombre": "Minería", "descripcion": "Extracción minera, minerales"},
            {
                "nombre": "Defensa y Seguridad",
                "descripcion": "Seguridad privada, defensa",
            },
        ]

        print("2️⃣ Agregando nuevos sectores...\n")

        # Obtener nombres existentes para evitar duplicados
        nombres_existentes = {s[1].lower() for s in sectores_existentes}

        agregados = 0
        for sector_data in nuevos_sectores:
            if sector_data["nombre"].lower() not in nombres_existentes:
                db.execute(
                    text(
                        "INSERT INTO sectores (nombre, descripcion, activo) VALUES (:nombre, :descripcion, :activo)"
                    ),
                    {
                        "nombre": sector_data["nombre"],
                        "descripcion": sector_data["descripcion"],
                        "activo": True,
                    },
                )
                print(f"   ✅ Agregado: {sector_data['nombre']}")
                agregados += 1
            else:
                print(f"   ⏭️  Ya existe: {sector_data['nombre']}")

        db.commit()

        print(f"\n   Total nuevos sectores agregados: {agregados}\n")

        # 3. Mostrar resultado final
        print("3️⃣ Sectores disponibles ahora:\n")
        result = db.execute(
            text(
                "SELECT nombre, descripcion FROM sectores WHERE activo = true ORDER BY nombre"
            )
        )
        todos_sectores = result.fetchall()

        for i, sector in enumerate(todos_sectores, 1):
            print(f"   {i:2}. {sector[0]}")
            if sector[1]:
                print(f"       {sector[1]}")

        print(f"\n   ✅ Total sectores activos: {len(todos_sectores)}")

        print("\n" + "=" * 80)
        print("✅ SECTORES EXPANDIDOS EXITOSAMENTE")
        print("=" * 80 + "\n")

        return True

    except Exception as e:
        print(f"\n❌ Error al expandir sectores: {e}")
        db.rollback()
        import traceback

        traceback.print_exc()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    success = expandir_sectores()
    sys.exit(0 if success else 1)
