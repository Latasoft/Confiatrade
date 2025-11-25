"""Script to create an initial admin user."""

import sys
from pathlib import Path

# Add the parent directory to the path so we can import from backend
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.security import get_password_hash
from database import SessionLocal
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy.orm import Session


def create_admin_user(
    email: str = "admin@confiatrade.com",
    password: str = "admin123",
    nombre_completo: str = "Administrador",
):
    """Create an admin user if it doesn't exist."""

    db: Session = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = (
            db.query(UsuarioModel).filter(UsuarioModel.email == email).first()
        )

        if existing_admin:
            print(f"Admin user with email {email} already exists")
            return False

        # Create admin user
        admin_user = UsuarioModel(
            email=email,
            hashed_password=get_password_hash(password),
            nombre_completo=nombre_completo,
            rol="admin",
            empresa_id=None,  # Admin users don't belong to a company
            activo=True,
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("Admin user created successfully!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   ID: {admin_user.id}")
        print(f"   Rol: {admin_user.rol}")
        print("\n Please change the password after first login!")

        return True

    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
        return False

    finally:
        db.close()


if __name__ == "__main__":
    # You can pass email, password, and name as command line arguments
    import sys

    email = sys.argv[1] if len(sys.argv) > 1 else "admin@confiatrade.com"
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"
    nombre_completo = sys.argv[3] if len(sys.argv) > 3 else "Administrador"

    print("Creating admin user...")
    print(f"Email: {email}")
    print(f"Nombre: {nombre_completo}\n")

    create_admin_user(email, password, nombre_completo)
