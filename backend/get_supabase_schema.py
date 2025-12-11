"""
Script para recuperar el esquema actual de Supabase
Genera un archivo con el DDL completo de todas las tablas del esquema público
"""

import sys

from database import engine
from sqlalchemy import text


def get_database_schema():
    """Obtiene el esquema completo de la base de datos"""

    # Query para obtener el DDL de todas las tablas
    query = """
    SELECT 
        table_name,
        'CREATE TABLE ' || table_name || ' (' || 
        string_agg(
            column_name || ' ' || 
            udt_name || 
            CASE WHEN character_maximum_length IS NOT NULL 
                THEN '(' || character_maximum_length || ')' 
                ELSE '' 
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
            ', '
        ) || ');' as ddl
    FROM information_schema.columns
    WHERE table_schema = 'public'
    GROUP BY table_name
    ORDER BY table_name;
    """

    with engine.connect() as conn:
        result = conn.execute(text(query))

        print("=" * 80)
        print("ESQUEMA DE BASE DE DATOS SUPABASE - CONFIATRADE")
        print("=" * 80)
        print()

        for row in result:
            print(f"-- Tabla: {row.table_name}")
            print(row.ddl)
            print()


def get_detailed_schema():
    """Obtiene información detallada del esquema incluyendo constraints, índices, etc."""

    queries = {
        "Tablas y Columnas": """
            SELECT 
                c.table_name,
                c.column_name,
                c.data_type,
                c.character_maximum_length,
                c.is_nullable,
                c.column_default
            FROM information_schema.columns c
            WHERE c.table_schema = 'public'
            ORDER BY c.table_name, c.ordinal_position;
        """,
        "Primary Keys": """
            SELECT
                tc.table_name,
                kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name;
        """,
        "Foreign Keys": """
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name;
        """,
        "Índices": """
            SELECT
                tablename,
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        """,
        "Unique Constraints": """
            SELECT
                tc.table_name,
                tc.constraint_name,
                kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'UNIQUE'
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name;
        """,
    }

    with engine.connect() as conn:
        for title, query in queries.items():
            print(f"\n{'=' * 80}")
            print(f"{title}")
            print("=" * 80)

            result = conn.execute(text(query))
            rows = result.fetchall()

            if rows:
                # Imprimir encabezados
                headers = result.keys()
                print(" | ".join(headers))
                print("-" * 80)

                # Imprimir filas
                for row in rows:
                    print(" | ".join(str(value) for value in row))
            else:
                print("(Sin resultados)")
            print()


def get_table_list():
    """Lista todas las tablas en el esquema público"""
    query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """

    with engine.connect() as conn:
        result = conn.execute(text(query))
        tables = [row[0] for row in result]

        print("=" * 80)
        print("TABLAS EN SUPABASE")
        print("=" * 80)
        for table in tables:
            print(f"  - {table}")
        print(f"\nTotal: {len(tables)} tablas")
        print()

        return tables


if __name__ == "__main__":
    try:
        print("\n📊 Recuperando esquema de Supabase...\n")

        # Listar tablas
        tables = get_table_list()

        # Obtener esquema detallado
        get_detailed_schema()

        print("\n✅ Esquema recuperado exitosamente")

    except Exception as e:
        print(f"\n❌ Error al recuperar el esquema: {str(e)}")
        sys.exit(1)
