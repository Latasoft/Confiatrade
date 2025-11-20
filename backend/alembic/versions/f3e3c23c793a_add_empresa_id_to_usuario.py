"""add_empresa_id_to_usuario

Revision ID: f3e3c23c793a
Revises: 67d4816e2fe0
Create Date: 2025-11-18 19:56:17.615557

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "f3e3c23c793a"
down_revision: Union[str, Sequence[str], None] = "67d4816e2fe0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add empresa_id column (nullable for existing users)
    op.add_column(
        "usuarios",
        sa.Column("empresa_id", postgresql.UUID(as_uuid=True), nullable=True),
    )

    # Create foreign key constraint
    op.create_foreign_key(
        "fk_usuario_empresa",
        "usuarios",
        "empresas",
        ["empresa_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # Create indexes for better query performance
    op.create_index("ix_usuarios_empresa_id", "usuarios", ["empresa_id"])
    op.create_index("ix_usuarios_rol", "usuarios", ["rol"])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index("ix_usuarios_rol", "usuarios")
    op.drop_index("ix_usuarios_empresa_id", "usuarios")

    # Drop foreign key constraint
    op.drop_constraint("fk_usuario_empresa", "usuarios", type_="foreignkey")

    # Drop column
    op.drop_column("usuarios", "empresa_id")
