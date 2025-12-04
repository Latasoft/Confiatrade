"""make_aprobada_nullable_in_empresas_eventos

Revision ID: 20241204000000
Revises: 42253883b712
Create Date: 2024-12-04 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20241204000000"
down_revision: Union[str, Sequence[str], None] = ("42253883b712", "e0c6af87be07")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Cambiar campo aprobada en empresas_eventos para soportar 3 estados:
    - NULL = Pendiente (nueva inscripción sin procesar)
    - TRUE = Aprobada
    - FALSE = Rechazada
    """
    # Primero, establecer NULL en registros donde aprobada = FALSE
    # (todas las inscripciones existentes con False se consideran pendientes)
    op.execute("UPDATE empresas_eventos SET aprobada = NULL WHERE aprobada = FALSE")

    # Hacer la columna nullable
    op.alter_column(
        "empresas_eventos",
        "aprobada",
        existing_type=sa.Boolean(),
        nullable=True,
        existing_nullable=False,
        server_default=None,
    )


def downgrade() -> None:
    """
    Revertir cambios: hacer NOT NULL y convertir NULL a FALSE
    """
    # Convertir NULL a FALSE antes de hacer la columna NOT NULL
    op.execute("UPDATE empresas_eventos SET aprobada = FALSE WHERE aprobada IS NULL")

    # Hacer la columna NOT NULL nuevamente
    op.alter_column(
        "empresas_eventos",
        "aprobada",
        existing_type=sa.Boolean(),
        nullable=False,
        existing_nullable=True,
        server_default=sa.text("false"),
    )
