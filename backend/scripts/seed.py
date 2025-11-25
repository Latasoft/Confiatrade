"""
Script de seed data para la base de datos de ConfíaTrade
Inserta datos iniciales: países, sectores, KPI inicial, usuario admin
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from datetime import datetime

import bcrypt as bcrypt_lib
from database import SessionLocal
from models.sqlalchemy.kpi_model import KPIModel
from models.sqlalchemy.pais_model import PaisModel
from models.sqlalchemy.sector_model import SectorModel
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy.orm import Session

# Importar todos los modelos para que las relaciones funcionen


def seed_paises(db: Session):
    """Insertar países iniciales"""
    paises = [
        {"nombre": "Chile", "codigo": "CL", "activo": True},
        {"nombre": "Brasil", "codigo": "BR", "activo": True},
        {"nombre": "Argentina", "codigo": "AR", "activo": True},
        {"nombre": "Paraguay", "codigo": "PY", "activo": True},
        {"nombre": "Bolivia", "codigo": "BO", "activo": True},
        {"nombre": "Otro", "codigo": "XX", "activo": True},
    ]

    print("\n🌍 Insertando países...")
    for pais_data in paises:
        # Verificar si ya existe
        existing = (
            db.query(PaisModel).filter(PaisModel.codigo == pais_data["codigo"]).first()
        )
        if not existing:
            pais = PaisModel(**pais_data)
            db.add(pais)
            print(f"  ✓ {pais_data['nombre']} ({pais_data['codigo']})")
        else:
            print(f"  - {pais_data['nombre']} (ya existe)")

    db.commit()


def seed_sectores(db: Session):
    """Insertar sectores iniciales"""
    sectores = [
        {
            "nombre": "Logística",
            "descripcion": "Transporte, distribución y cadena de suministro",
            "activo": True,
        },
        {
            "nombre": "Energía",
            "descripcion": "Generación, distribución y energías renovables",
            "activo": True,
        },
        {
            "nombre": "Tecnología",
            "descripcion": "Software, hardware y servicios digitales",
            "activo": True,
        },
        {
            "nombre": "Turismo Corporativo",
            "descripcion": "Servicios turísticos para empresas y eventos",
            "activo": True,
        },
    ]

    print("\n🏢 Insertando sectores...")
    for sector_data in sectores:
        # Verificar si ya existe
        existing = (
            db.query(SectorModel)
            .filter(SectorModel.nombre == sector_data["nombre"])
            .first()
        )
        if not existing:
            sector = SectorModel(**sector_data)
            db.add(sector)
            print(f"  ✓ {sector_data['nombre']}")
        else:
            print(f"  - {sector_data['nombre']} (ya existe)")

    db.commit()


def seed_kpi_inicial(db: Session):
    """Insertar registro KPI inicial"""
    print("\n📊 Insertando KPI inicial...")

    # Verificar si ya existe un KPI
    existing = db.query(KPIModel).first()
    if not existing:
        kpi = KPIModel(
            fecha=datetime.now().date(),
            empresas_meta=100,
            empresas_actual=0,
            reuniones_meta=500,
            reuniones_actual=0,
            acuerdos_meta=50,
            acuerdos_actual=0,
            satisfaccion_meta=85.0,
            satisfaccion_actual=0.0,
            ocupacion_agenda=0.0,
            puntualidad=0.0,
            nps=0.0,
        )
        db.add(kpi)
        db.commit()
        print("  ✓ KPI inicial creado")
    else:
        print("  - KPI inicial ya existe")


def seed_usuario_admin(db: Session):
    """Insertar usuario administrador de prueba"""
    print("\n👤 Insertando usuario admin...")

    # Verificar si ya existe
    existing = (
        db.query(UsuarioModel)
        .filter(UsuarioModel.email == "admin@confiatrade.com")
        .first()
    )
    if not existing:
        # Hashear password con bcrypt
        password = "admin123".encode("utf-8")
        salt = bcrypt_lib.gensalt()
        hashed_password = bcrypt_lib.hashpw(password, salt).decode("utf-8")

        admin = UsuarioModel(
            email="admin@confiatrade.com",
            nombre_completo="Administrador Sistema",
            hashed_password=hashed_password,
            rol="admin",
            activo=True,
        )
        db.add(admin)
        db.commit()
        print("  ✓ Usuario admin creado")
        print("     Email: admin@confiatrade.com")
        print("     Password: admin123")
    else:
        print("  - Usuario admin ya existe")


def main():
    """Ejecutar todos los seeds"""
    print("=" * 60)
    print(" SEED DATA - CONFIATRADE")
    print("=" * 60)

    db = SessionLocal()

    try:
        seed_paises(db)
        seed_sectores(db)
        seed_kpi_inicial(db)
        seed_usuario_admin(db)

        print("\n" + "=" * 60)
        print(" SEED DATA COMPLETADO EXITOSAMENTE")
        print("=" * 60)

        # Mostrar resumen
        paises_count = db.query(PaisModel).count()
        sectores_count = db.query(SectorModel).count()
        kpis_count = db.query(KPIModel).count()
        usuarios_count = db.query(UsuarioModel).count()

        print("\n Resumen:")
        print(f"  • Países: {paises_count}")
        print(f"  • Sectores: {sectores_count}")
        print(f"  • KPIs: {kpis_count}")
        print(f"  • Usuarios: {usuarios_count}")
        print()

    except Exception as e:
        print(f"\n Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
