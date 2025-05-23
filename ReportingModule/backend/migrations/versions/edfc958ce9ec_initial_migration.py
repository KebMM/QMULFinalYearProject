"""Initial migration

Revision ID: edfc958ce9ec
Revises: 
Create Date: 2025-02-20 16:14:39.423399

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'edfc958ce9ec'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('test_reports',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('test_name', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('execution_time', sa.Float(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_reports_id'), 'test_reports', ['id'], unique=False)
    op.create_index(op.f('ix_test_reports_test_name'), 'test_reports', ['test_name'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_test_reports_test_name'), table_name='test_reports')
    op.drop_index(op.f('ix_test_reports_id'), table_name='test_reports')
    op.drop_table('test_reports')
    # ### end Alembic commands ###
