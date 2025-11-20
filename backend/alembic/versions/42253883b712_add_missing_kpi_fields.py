"""add_missing_kpi_fields

Revision ID: 42253883b712
Revises: f3e3c23c793a
Create Date: 2025-11-20 09:04:10.467744

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "42253883b712"
down_revision: Union[str, Sequence[str], None] = "f3e3c23c793a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing KPI fields to participantes, bloques_horarios, and seguimiento tables."""
    # Add check_in_realizado and fecha_check_in to participantes
    op.add_column(
        "participantes", sa.Column("check_in_realizado", sa.Boolean(), nullable=True)
    )
    op.add_column(
        "participantes", sa.Column("fecha_check_in", sa.DateTime(), nullable=True)
    )
    op.create_index(
        op.f("ix_participantes_check_in_realizado"),
        "participantes",
        ["check_in_realizado"],
        unique=False,
    )

    # Set default value for existing rows
    op.execute(
        "UPDATE participantes SET check_in_realizado = FALSE WHERE check_in_realizado IS NULL"
    )

    # Make column non-nullable
    op.alter_column(
        "participantes", "check_in_realizado", nullable=False, server_default=sa.false()
    )

    # Add disponible to bloques_horarios
    op.add_column(
        "bloques_horarios", sa.Column("disponible", sa.Boolean(), nullable=True)
    )
    op.create_index(
        op.f("ix_bloques_horarios_disponible"),
        "bloques_horarios",
        ["disponible"],
        unique=False,
    )

    # Set default value for existing rows
    op.execute("UPDATE bloques_horarios SET disponible = TRUE WHERE disponible IS NULL")

    # Make column non-nullable
    op.alter_column(
        "bloques_horarios", "disponible", nullable=False, server_default=sa.true()
    )

    # Add resultado and monto_estimado to seguimiento
    op.add_column(
        "seguimiento", sa.Column("resultado", sa.String(length=50), nullable=True)
    )
    op.add_column(
        "seguimiento",
        sa.Column("monto_estimado", sa.Numeric(precision=15, scale=2), nullable=True),
    )
    op.create_index(
        op.f("ix_seguimiento_resultado"), "seguimiento", ["resultado"], unique=False
    )


def downgrade() -> None:
    """Remove KPI fields from participantes, bloques_horarios, and seguimiento tables."""
    # Remove from seguimiento
    op.drop_index(op.f("ix_seguimiento_resultado"), table_name="seguimiento")
    op.drop_column("seguimiento", "monto_estimado")
    op.drop_column("seguimiento", "resultado")

    # Remove from bloques_horarios
    op.drop_index(op.f("ix_bloques_horarios_disponible"), table_name="bloques_horarios")
    op.drop_column("bloques_horarios", "disponible")

    # Remove from participantes
    op.drop_index(
        op.f("ix_participantes_check_in_realizado"), table_name="participantes"
    )
    op.drop_column("participantes", "fecha_check_in")
    op.drop_column("participantes", "check_in_realizado")
