"""
Script para testear los endpoints de roles y permisos
"""

import asyncio
import sys

from database import get_db
from models.sqlalchemy.permiso_model import PermisoModel
from models.sqlalchemy.rol_model import RolModel
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy.orm import joinedload


async def test_models():
    """
    Testear que los modelos SQLAlchemy estén correctamente configurados
    """
    print("=" * 80)
    print("TESTING MODELOS SQLALCHEMY")
    print("=" * 80)

    db = next(get_db())

    try:
        # Test 1: Listar roles con sus permisos
        print("\n1. Listando roles con sus permisos...")
        roles = db.query(RolModel).options(joinedload(RolModel.permisos)).all()
        print(f"   ✓ Encontrados {len(roles)} roles")

        for rol in roles:
            print(f"\n   Rol: {rol.nombre}")
            print(f"   - ID: {rol.id}")
            print(f"   - Descripción: {rol.descripcion}")
            print(f"   - Es sistema: {rol.es_sistema}")
            print(f"   - Activo: {rol.activo}")
            print(f"   - Permisos: {len(rol.permisos)}")

            if rol.permisos:
                print("   - Primeros 3 permisos:")
                for permiso in rol.permisos[:3]:
                    print(
                        f"     * {permiso.nombre} ({permiso.modulo}.{permiso.accion})"
                    )

        # Test 2: Listar permisos
        print("\n2. Listando permisos...")
        permisos = db.query(PermisoModel).all()
        print(f"   ✓ Encontrados {len(permisos)} permisos")

        # Agrupar por módulo
        permisos_por_modulo = {}
        for permiso in permisos:
            if permiso.modulo not in permisos_por_modulo:
                permisos_por_modulo[permiso.modulo] = []
            permisos_por_modulo[permiso.modulo].append(permiso)

        print("\n   Módulos encontrados:")
        for modulo, permisos_mod in permisos_por_modulo.items():
            print(f"   - {modulo}: {len(permisos_mod)} permisos")

        # Test 3: Verificar relación many-to-many
        print("\n3. Verificando relación many-to-many roles-permisos...")
        primer_rol = roles[0] if roles else None
        if primer_rol and primer_rol.permisos:
            primer_permiso = primer_rol.permisos[0]
            print(
                f"   ✓ Rol '{primer_rol.nombre}' tiene permiso '{primer_permiso.nombre}'"
            )
            print(
                f"   ✓ Permiso '{primer_permiso.nombre}' está en {len(primer_permiso.roles)} rol(es)"
            )

        # Test 4: Verificar usuarios con roles - solo contar, no cargar todas las relaciones
        print("\n4. Verificando usuarios con roles asignados...")
        usuarios_count = (
            db.query(UsuarioModel).filter(UsuarioModel.rol_id.isnot(None)).count()
        )
        print(f"   ✓ Encontrados {usuarios_count} usuarios con rol asignado")

        # Obtener algunos usuarios sin cargar relaciones problemáticas
        usuarios = (
            db.query(UsuarioModel)
            .filter(UsuarioModel.rol_id.isnot(None))
            .limit(5)
            .all()
        )

        for usuario in usuarios:
            # Cargar el rol manualmente
            rol = db.query(RolModel).filter(RolModel.id == usuario.rol_id).first()
            rol_nombre = rol.nombre if rol else "Sin rol"
            print(f"   - {usuario.email}: {rol_nombre}")

        print("\n" + "=" * 80)
        print("✓ TODOS LOS TESTS PASARON EXITOSAMENTE")
        print("=" * 80)

        return True

    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback

        traceback.print_exc()
        return False

    finally:
        db.close()


def test_endpoints_structure():
    """
    Verificar que los endpoints estén correctamente estructurados
    """
    print("\n" + "=" * 80)
    print("VERIFICANDO ESTRUCTURA DE ENDPOINTS")
    print("=" * 80)

    try:
        from api.v1.endpoints import roles, usuarios_organizadores

        print("\n1. Endpoints de roles:")
        print("   ✓ Módulo importado correctamente")
        print(f"   ✓ Router: {roles.router}")

        print("\n2. Endpoints de usuarios organizadores:")
        print("   ✓ Módulo importado correctamente")
        print(f"   ✓ Router: {usuarios_organizadores.router}")

        # Verificar que los routers estén en el api_router principal
        from api.v1.router import api_router

        print("\n3. Router principal:")
        print(f"   ✓ API Router: {api_router}")
        print(f"   ✓ Rutas registradas: {len(api_router.routes)}")

        # Listar algunas rutas relevantes
        print("\n   Rutas de roles y organizadores:")
        for route in api_router.routes:
            if hasattr(route, "path"):
                if "/roles" in route.path or "/organizadores" in route.path:
                    methods = (
                        ", ".join(route.methods) if hasattr(route, "methods") else "N/A"
                    )
                    print(f"   - {methods:8} {route.path}")

        print("\n" + "=" * 80)
        print("✓ ESTRUCTURA DE ENDPOINTS CORRECTA")
        print("=" * 80)

        return True

    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("INICIANDO TESTS DEL SISTEMA DE ROLES Y PERMISOS")
    print("=" * 80)

    # Test 1: Estructura de endpoints
    test1_ok = test_endpoints_structure()

    # Test 2: Modelos y base de datos
    test2_ok = asyncio.run(test_models())

    # Resumen
    print("\n" + "=" * 80)
    print("RESUMEN DE TESTS")
    print("=" * 80)
    print(f"Test estructura de endpoints: {'✓ PASÓ' if test1_ok else '✗ FALLÓ'}")
    print(f"Test modelos SQLAlchemy:      {'✓ PASÓ' if test2_ok else '✗ FALLÓ'}")
    print("=" * 80)

    if test1_ok and test2_ok:
        print("\n✓ TODOS LOS TESTS PASARON")
        sys.exit(0)
    else:
        print("\n✗ ALGUNOS TESTS FALLARON")
        sys.exit(1)
