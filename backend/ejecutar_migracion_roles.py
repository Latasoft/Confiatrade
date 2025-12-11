"""
Script para ejecutar la migración del sistema de roles y permisos en Supabase
"""

import sys
from pathlib import Path

from database import engine
from sqlalchemy import text


def ejecutar_migracion():
    """Ejecuta el script SQL de migración"""

    # Leer el archivo SQL
    sql_file = Path(__file__).parent / "crear_sistema_roles_permisos.sql"

    if not sql_file.exists():
        print(f"❌ Error: No se encontró el archivo {sql_file}")
        sys.exit(1)

    print(f"📄 Leyendo archivo SQL: {sql_file}")
    with open(sql_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    print("\n🚀 Ejecutando migración...")
    print("=" * 80)

    try:
        with engine.begin() as conn:
            # Ejecutar el script completo
            conn.execute(text(sql_content))

        print("\n✅ Migración ejecutada exitosamente")
        print("=" * 80)

        # Verificar que se crearon las tablas y datos
        print("\n📊 Verificando instalación...")

        with engine.connect() as conn:
            # Verificar roles
            result = conn.execute(text("SELECT COUNT(*) as count FROM roles"))
            roles_count = result.fetchone()[0]
            print(f"✓ Roles creados: {roles_count}")

            # Verificar permisos
            result = conn.execute(text("SELECT COUNT(*) as count FROM permisos"))
            permisos_count = result.fetchone()[0]
            print(f"✓ Permisos creados: {permisos_count}")

            # Verificar asignaciones
            result = conn.execute(text("SELECT COUNT(*) as count FROM roles_permisos"))
            asignaciones_count = result.fetchone()[0]
            print(f"✓ Asignaciones roles-permisos: {asignaciones_count}")

            # Mostrar resumen de roles
            print("\n📋 Resumen de Roles:")
            result = conn.execute(
                text("""
                SELECT 
                    r.nombre,
                    r.es_sistema,
                    COUNT(rp.permiso_id) as cantidad_permisos,
                    COUNT(u.id) as cantidad_usuarios
                FROM roles r
                LEFT JOIN roles_permisos rp ON r.id = rp.rol_id
                LEFT JOIN usuarios u ON r.id = u.rol_id
                GROUP BY r.id, r.nombre, r.es_sistema
                ORDER BY r.nombre
            """)
            )

            print(f"{'Rol':<20} {'Sistema':<10} {'Permisos':<10} {'Usuarios':<10}")
            print("-" * 50)
            for row in result:
                es_sistema = "Sí" if row[1] else "No"
                print(f"{row[0]:<20} {es_sistema:<10} {row[2]:<10} {row[3]:<10}")

            # Mostrar módulos de permisos
            print("\n📦 Módulos de Permisos:")
            result = conn.execute(
                text("""
                SELECT 
                    modulo,
                    COUNT(*) as cantidad
                FROM permisos
                WHERE activo = TRUE
                GROUP BY modulo
                ORDER BY modulo
            """)
            )

            for row in result:
                print(f"  • {row[0]}: {row[1]} permisos")

        print("\n" + "=" * 80)
        print("✅ Sistema de roles y permisos instalado correctamente")
        print("\n📝 Próximos pasos:")
        print("  1. Reiniciar el servidor backend")
        print("  2. Probar los nuevos endpoints en /api/v1/docs")
        print("  3. Crear usuarios organizadores desde el panel admin")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ Error al ejecutar la migración: {str(e)}")
        print("\nDetalles del error:")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("MIGRACIÓN: Sistema de Roles y Permisos - ConfíaTrade")
    print("=" * 80)

    respuesta = input("\n⚠️  ¿Deseas ejecutar la migración? (s/n): ")

    if respuesta.lower() in ["s", "si", "sí", "y", "yes"]:
        ejecutar_migracion()
    else:
        print("\n❌ Migración cancelada")
        sys.exit(0)
