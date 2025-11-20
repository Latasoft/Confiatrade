"""change pais_sede_id to pais_sede string

Revision ID: 67d4816e2fe0
Revises: 87ae9abb26b1
Create Date: 2025-11-18 14:20:14.747558

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "67d4816e2fe0"
down_revision: Union[str, Sequence[str], None] = "87ae9abb26b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Change pais_sede_id (integer) to pais_sede (varchar)"""
    # Rename column and change type
    op.alter_column(
        "eventos",
        "pais_sede_id",
        new_column_name="pais_sede",
        type_=sa.String(100),
        existing_type=sa.INTEGER,
        nullable=True,
    )


def downgrade() -> None:
    """Revert pais_sede (varchar) back to pais_sede_id (integer)"""
    op.alter_column(
        "eventos",
        "pais_sede",
        new_column_name="pais_sede_id",
        type_=sa.INTEGER,
        existing_type=sa.String(100),
        nullable=True,
    )
