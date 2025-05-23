"""Added test_suites table and linked test_reports

Revision ID: 02c6990a2bdc
Revises: 0c5f7a8cc60d
Create Date: 2025-02-25 19:28:38.001774

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '02c6990a2bdc'
down_revision: Union[str, None] = '0c5f7a8cc60d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('test_suites',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('suite_name', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('suite_name')
    )
    op.create_index(op.f('ix_test_suites_id'), 'test_suites', ['id'], unique=False)
    op.add_column('test_reports', sa.Column('test_suite_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'test_reports', 'test_suites', ['test_suite_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'test_reports', type_='foreignkey')
    op.drop_column('test_reports', 'test_suite_id')
    op.drop_index(op.f('ix_test_suites_id'), table_name='test_suites')
    op.drop_table('test_suites')
    # ### end Alembic commands ###
