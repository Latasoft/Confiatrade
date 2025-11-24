"""add_presentacion_url_to_empresa

Revision ID: e0c6af87be07
Revises: 9fabe28eae9a
Create Date: 2025-11-20 19:17:01.381188

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e0c6af87be07"
down_revision: Union[str, Sequence[str], None] = "9fabe28eae9a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add presentacion_url column to empresas table."""
    op.add_column(
        "empresas", sa.Column("presentacion_url", sa.String(length=500), nullable=True)
    )


def downgrade() -> None:
    """Remove presentacion_url column from empresas table."""
    op.drop_column("empresas", "presentacion_url")
