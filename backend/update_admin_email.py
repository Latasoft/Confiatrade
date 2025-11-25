"""Script para actualizar el email del admin"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    # Usar SQL directo para evitar problemas de definición de tablas
    result = db.execute(
        text(
            "UPDATE usuarios SET email = 'admin@confiaglobal.cl' WHERE email = 'admin@confiatrade.com' RETURNING email, rol"
        )
    )
    db.commit()

    updated = result.fetchone()
    if updated:
        print(f"✅ Email actualizado exitosamente: {updated[0]}")
        print(f"   Rol: {updated[1]}")
    else:
        print("❌ Usuario con email admin@confiatrade.com no encontrado")

        # Buscar todos los usuarios admin
        result = db.execute(
            text("SELECT email, id, rol FROM usuarios WHERE rol = 'admin'")
        )
        all_admins = result.fetchall()
        print(f"\nUsuarios admin encontrados ({len(all_admins)}):")
        for a in all_admins:
            print(f"  - {a[0]} (ID: {a[1]}, Rol: {a[2]})")

except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
