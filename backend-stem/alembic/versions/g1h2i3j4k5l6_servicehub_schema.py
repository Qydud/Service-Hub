"""Replace the copied STEM schema with the independent ServiceHub schema.

Revision ID: g1h2i3j4k5l6
Revises: f1a2b3c4d5e6
"""
from alembic import op
import sqlalchemy as sa

revision = "g1h2i3j4k5l6"
down_revision = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # This branch is intentionally independent. Remove copied STEM domain
    # tables instead of carrying their data or relationships into ServiceHub.
    legacy_tables = (
        "orders",
        "products",
        "categories",
        "blog_posts",
        "product_colors",
        "colors",
        "prices",
        "visualize_usage",
        "visualizations",
        "favorites",
    )
    for table in legacy_tables:
        op.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')

    op.execute('DROP TABLE IF EXISTS "applications" CASCADE')
    op.create_table(
        "applications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("company", sa.String(), nullable=False),
        sa.Column("contact_name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("object_address", sa.String(), nullable=False),
        sa.Column("service", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("photo", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="new"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
    )
    op.create_index("ix_applications_status", "applications", ["status"])


def downgrade() -> None:
    op.drop_table("applications")
