"""
Script para ver los roles existentes y sus permisos
"""

import os
import sys

from dotenv import load_dotenv

# Cargar variables de entorno desde .env
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path)

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import settings
from sqlalchemy import create_engine, text

# Crear engine directamente
engine = create_engine(settings.DATABASE_URL)


def main():
    conn = engine.connect()

    try:
        # Consultar roles directamente con SQL
        result = conn.execute(
            text("""
            SELECT id, nombre, descripcion, es_sistema, activo,
                   (SELECT COUNT(*) FROM roles_permisos WHERE rol_id = roles.id) as num_permisos
            FROM roles
            ORDER BY nombre
        """)
        )
        roles = result.fetchall()

        print(f"\n{'=' * 80}")
        print(f"ROLES EN LA BASE DE DATOS: {len(roles)}")
        print(f"{'=' * 80}\n")

        for i, rol in enumerate(roles, 1):
            print(f"{i}. {rol[1]}")  # nombre
            print(f"   ID: {rol[0]}")  # id
            print(f"   Descripción: {rol[2] or 'Sin descripción'}")  # descripcion
            print(f"   Es Sistema: {'SÍ' if rol[3] else 'NO'}")  # es_sistema
            print(f"   Activo: {'SÍ' if rol[4] else 'NO'}")  # activo
            print(f"   Permisos: {rol[5]}")  # num_permisos
            print()

        # Mostrar permisos del rol Organizador
        print(f"\n{'=' * 80}")
        print("PERMISOS DEL ROL ORGANIZADOR")
        print(f"{'=' * 80}\n")

        result = conn.execute(
            text("""
            SELECT p.modulo, p.accion, p.nombre, p.descripcion
            FROM permisos p
            JOIN roles_permisos rp ON p.id = rp.permiso_id
            JOIN roles r ON r.id = rp.rol_id
            WHERE r.nombre = 'Organizador'
            ORDER BY p.modulo, p.accion
        """)
        )
        permisos = result.fetchall()

        current_modulo = None
        for permiso in permisos:
            if permiso[0] != current_modulo:
                current_modulo = permiso[0]
                print(f"\n{current_modulo.upper()}:")
            print(f"  - {permiso[1]}: {permiso[2]}")

        # Mostrar cuántos roles se pueden editar
        roles_editables = [r for r in roles if not r[3]]  # es_sistema es el índice 3

        print(f"\n\n{'=' * 80}")
        print(f"ROLES EDITABLES (es_sistema = False): {len(roles_editables)}")
        print(f"{'=' * 80}")

        if roles_editables:
            for rol in roles_editables:
                print(f"  - {rol[1]}")  # nombre
        else:
            print("\n⚠️  No hay roles editables actualmente.")
            print("   Todos los roles son del sistema (es_sistema=True)")
            print("\n💡 Solución: Crea un nuevo rol desde la UI en /roles")
            print("   Los roles creados desde la UI tendrán es_sistema=False")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
