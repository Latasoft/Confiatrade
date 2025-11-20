"""add_credenciales_generadas_table

Revision ID: 9fabe28eae9a
Revises: 42253883b712
Create Date: 2025-11-20 10:28:50.083648

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "9fabe28eae9a"
down_revision: Union[str, Sequence[str], None] = "42253883b712"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Crear tabla credenciales_generadas
    op.create_table(
        "credenciales_generadas",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("empresa_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("participante_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("tipo", sa.String(length=20), nullable=False),
        sa.Column("fecha_generacion", sa.DateTime(), nullable=False),
        sa.Column("generada_por", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("pdf_hash", sa.String(length=64), nullable=True),
        sa.Column("formato", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["generada_por"], ["usuarios.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["participante_id"], ["participantes.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Crear índices
    op.create_index(
        op.f("ix_credenciales_generadas_id"),
        "credenciales_generadas",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_credenciales_generadas_empresa_id"),
        "credenciales_generadas",
        ["empresa_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_credenciales_generadas_participante_id"),
        "credenciales_generadas",
        ["participante_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_credenciales_generadas_tipo"),
        "credenciales_generadas",
        ["tipo"],
        unique=False,
    )
    op.create_index(
        op.f("ix_credenciales_generadas_fecha_generacion"),
        "credenciales_generadas",
        ["fecha_generacion"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Eliminar índices
    op.drop_index(
        op.f("ix_credenciales_generadas_fecha_generacion"),
        table_name="credenciales_generadas",
    )
    op.drop_index(
        op.f("ix_credenciales_generadas_tipo"), table_name="credenciales_generadas"
    )
    op.drop_index(
        op.f("ix_credenciales_generadas_participante_id"),
        table_name="credenciales_generadas",
    )
    op.drop_index(
        op.f("ix_credenciales_generadas_empresa_id"),
        table_name="credenciales_generadas",
    )
    op.drop_index(
        op.f("ix_credenciales_generadas_id"), table_name="credenciales_generadas"
    )

    # Eliminar tabla
    op.drop_table("credenciales_generadas")
