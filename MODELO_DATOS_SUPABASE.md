# Modelo de Datos ConfíaTrade - Ajustado según Prototipo

## TABLAS PRINCIPALES

### paises (catálogo)

```sql
CREATE TABLE paises (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO paises (codigo, nombre) VALUES
    ('CHL', 'Chile'),
    ('BRA', 'Brasil'),
    ('ARG', 'Argentina'),
    ('PRY', 'Paraguay'),
    ('BOL', 'Bolivia'),
    ('OTR', 'Otro');
```

### sectores (catálogo)

```sql
CREATE TABLE sectores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO sectores (nombre) VALUES
    ('Logística'),
    ('Energía'),
    ('Tecnología'),
    ('Turismo corporativo');
```

### empresas

```sql
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    pais_id INTEGER NOT NULL REFERENCES paises(id),
    sector_id INTEGER NOT NULL REFERENCES sectores(id),
    descripcion TEXT,
    sitio_web VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    logo_url VARCHAR(500),
    aprobada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_empresas_pais ON empresas(pais_id);
CREATE INDEX idx_empresas_sector ON empresas(sector_id);
CREATE INDEX idx_empresas_aprobada ON empresas(aprobada);
```

### participantes

```sql
CREATE TABLE participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    cargo VARCHAR(150),
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    idioma VARCHAR(2) DEFAULT 'ES',
    requiere_interprete BOOLEAN DEFAULT FALSE,
    foto_url VARCHAR(500),
    qr_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT email_unique_per_empresa UNIQUE(empresa_id, email)
);

CREATE INDEX idx_participantes_empresa ON participantes(empresa_id);
CREATE INDEX idx_participantes_email ON participantes(email);
```

### curaduria

```sql
CREATE TABLE curaduria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    ofrece TEXT,
    busca TEXT,
    objetivos TEXT,
    capacidades TEXT,
    notas_internas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT curaduria_empresa_unique UNIQUE(empresa_id)
);

CREATE INDEX idx_curaduria_empresa ON curaduria(empresa_id);
```

### bloques_horarios

```sql
CREATE TABLE bloques_horarios (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    ubicacion VARCHAR(100),
    label VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bloques_fecha ON bloques_horarios(fecha);
CREATE INDEX idx_bloques_activo ON bloques_horarios(activo);
```

### reuniones

```sql
CREATE TABLE reuniones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloque_id INTEGER NOT NULL REFERENCES bloques_horarios(id),
    empresa_a_id UUID NOT NULL REFERENCES empresas(id),
    empresa_b_id UUID NOT NULL REFERENCES empresas(id),
    estado VARCHAR(50) DEFAULT 'programada',
    notas TEXT,
    requiere_interprete BOOLEAN DEFAULT FALSE,
    sala VARCHAR(50),
    resultado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT empresas_distintas CHECK (empresa_a_id != empresa_b_id),
    CONSTRAINT reunion_bloque_unique UNIQUE(bloque_id, empresa_a_id),
    CONSTRAINT reunion_bloque_unique_b UNIQUE(bloque_id, empresa_b_id)
);

CREATE INDEX idx_reuniones_bloque ON reuniones(bloque_id);
CREATE INDEX idx_reuniones_empresa_a ON reuniones(empresa_a_id);
CREATE INDEX idx_reuniones_empresa_b ON reuniones(empresa_b_id);
CREATE INDEX idx_reuniones_estado ON reuniones(estado);
```

### seguimiento

```sql
CREATE TABLE seguimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id),
    tipo VARCHAR(50) DEFAULT 'seguimiento',
    descripcion TEXT NOT NULL,
    responsable VARCHAR(255),
    fecha_compromiso DATE,
    estado VARCHAR(50) DEFAULT 'pendiente',
    documentos_url TEXT[],
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seguimiento_empresa ON seguimiento(empresa_id);
CREATE INDEX idx_seguimiento_tipo ON seguimiento(tipo);
CREATE INDEX idx_seguimiento_estado ON seguimiento(estado);
```

### kpis

```sql
CREATE TABLE kpis (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    empresas_meta INTEGER DEFAULT 100,
    empresas_actual INTEGER DEFAULT 0,
    reuniones_meta INTEGER DEFAULT 300,
    reuniones_actual INTEGER DEFAULT 0,
    acuerdos_meta INTEGER DEFAULT 20,
    acuerdos_actual INTEGER DEFAULT 0,
    satisfaccion_meta DECIMAL(5,2) DEFAULT 80.0,
    satisfaccion_actual DECIMAL(5,2) DEFAULT 0.0,
    ocupacion_agenda DECIMAL(5,2) DEFAULT 0.0,
    puntualidad DECIMAL(5,2) DEFAULT 0.0,
    nps DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT kpis_fecha_unique UNIQUE(fecha)
);

CREATE INDEX idx_kpis_fecha ON kpis(fecha DESC);
```

### usuarios (autenticación)

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255),
    rol VARCHAR(50) DEFAULT 'staff',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
```

## FUNCIONES Y TRIGGERS

### Actualizar updated_at automáticamente

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participantes_updated_at
    BEFORE UPDATE ON participantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curaduria_updated_at
    BEFORE UPDATE ON curaduria
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reuniones_updated_at
    BEFORE UPDATE ON reuniones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seguimiento_updated_at
    BEFORE UPDATE ON seguimiento
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Calcular KPIs automáticamente

```sql
CREATE OR REPLACE FUNCTION calcular_kpis()
RETURNS TABLE(
    empresas_count INTEGER,
    reuniones_count INTEGER,
    acuerdos_count INTEGER,
    ocupacion DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT e.id)::INTEGER AS empresas_count,
        COUNT(DISTINCT r.id)::INTEGER AS reuniones_count,
        COUNT(DISTINCT s.id) FILTER (WHERE s.tipo IN ('acuerdo', 'loi'))::INTEGER AS acuerdos_count,
        CASE
            WHEN COUNT(b.id) > 0 THEN
                (COUNT(r.id)::DECIMAL / COUNT(b.id)::DECIMAL * 100)
            ELSE 0
        END AS ocupacion
    FROM empresas e
    CROSS JOIN bloques_horarios b
    LEFT JOIN reuniones r ON r.bloque_id = b.id
    LEFT JOIN seguimiento s ON s.empresa_id = e.id;
END;
$$ LANGUAGE plpgsql;
```

## POLÍTICAS RLS (Row Level Security) para Supabase

```sql
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE curaduria ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloques_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reuniones ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON empresas
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert" ON empresas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON empresas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON participantes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert" ON participantes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON reuniones
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage" ON reuniones
    FOR ALL USING (auth.role() = 'authenticated');
```

## VISTAS ÚTILES

### Vista de agenda por empresa

```sql
CREATE VIEW vista_agenda_empresa AS
SELECT
    e.id AS empresa_id,
    e.nombre AS empresa_nombre,
    b.id AS bloque_id,
    b.label AS bloque_label,
    b.hora_inicio,
    b.hora_fin,
    CASE
        WHEN r.empresa_a_id = e.id THEN e2.nombre
        ELSE e1.nombre
    END AS contraparte_nombre,
    r.sala,
    r.estado
FROM empresas e
JOIN reuniones r ON (r.empresa_a_id = e.id OR r.empresa_b_id = e.id)
JOIN bloques_horarios b ON b.id = r.bloque_id
LEFT JOIN empresas e1 ON e1.id = r.empresa_a_id
LEFT JOIN empresas e2 ON e2.id = r.empresa_b_id
ORDER BY b.hora_inicio;
```

### Vista de matches de curaduría

```sql
CREATE VIEW vista_matches AS
SELECT
    e1.id AS empresa_a_id,
    e1.nombre AS empresa_a_nombre,
    e1.sector_id AS empresa_a_sector,
    e2.id AS empresa_b_id,
    e2.nombre AS empresa_b_nombre,
    e2.sector_id AS empresa_b_sector,
    c1.ofrece AS empresa_a_ofrece,
    c1.busca AS empresa_a_busca,
    c2.ofrece AS empresa_b_ofrece,
    c2.busca AS empresa_b_busca,
    CASE WHEN e1.sector_id = e2.sector_id THEN 2 ELSE 0 END AS sector_match_score
FROM empresas e1
JOIN curaduria c1 ON c1.empresa_id = e1.id
CROSS JOIN empresas e2
JOIN curaduria c2 ON c2.empresa_id = e2.id
WHERE e1.id < e2.id
  AND e1.aprobada = true
  AND e2.aprobada = true;
```

## DATOS DE SEED

```sql
INSERT INTO paises (codigo, nombre) VALUES
    ('CHL', 'Chile'),
    ('BRA', 'Brasil'),
    ('ARG', 'Argentina'),
    ('PRY', 'Paraguay'),
    ('BOL', 'Bolivia'),
    ('OTR', 'Otro')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO sectores (nombre, descripcion) VALUES
    ('Logística', 'Transporte y logística internacional'),
    ('Energía', 'Energía, minería y sostenibilidad'),
    ('Tecnología', 'Innovación y servicios digitales'),
    ('Turismo corporativo', 'Turismo corporativo y experiencias empresariales')
ON CONFLICT DO NOTHING;

INSERT INTO kpis (fecha, empresas_meta, reuniones_meta, acuerdos_meta, satisfaccion_meta)
VALUES (CURRENT_DATE, 100, 300, 20, 80.0)
ON CONFLICT (fecha) DO NOTHING;
```

## CONFIGURACIÓN SUPABASE

### Connection String Format:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Environment Variables:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

## PRÓXIMOS PASOS

1. Conectar Supabase y ejecutar migraciones
2. Crear script de seed con datos iniciales
3. Implementar sistema de excepciones (Backend)
4. Implementar sistema de notificaciones (Frontend)
5. Completar repositorios para todas las entidades
