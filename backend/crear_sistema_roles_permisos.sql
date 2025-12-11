-- ========================================
-- SISTEMA DE ROLES Y PERMISOS - CONFIATRADE
-- ========================================
-- Este script crea el sistema de roles y permisos granulares
-- para gestionar usuarios organizadores con acceso limitado

-- 1. TABLA DE ROLES
-- Define los diferentes roles del sistema
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    es_sistema BOOLEAN DEFAULT FALSE, -- Roles predefinidos del sistema que no se pueden eliminar
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roles_activo ON roles(activo);
CREATE INDEX idx_roles_nombre ON roles(nombre);

-- 2. TABLA DE PERMISOS
-- Define los permisos granulares del sistema
CREATE TABLE IF NOT EXISTS permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL, -- ej: 'ver_empresas', 'crear_evento', 'gestionar_reuniones'
    descripcion TEXT,
    modulo VARCHAR(50) NOT NULL, -- ej: 'empresas', 'eventos', 'reuniones', 'participantes', 'kpis'
    accion VARCHAR(50) NOT NULL, -- ej: 'ver', 'crear', 'editar', 'eliminar', 'aprobar'
    recurso VARCHAR(100), -- Recurso específico (opcional): ej: '/api/empresas', '/eventos'
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permisos_modulo ON permisos(modulo);
CREATE INDEX idx_permisos_accion ON permisos(accion);
CREATE INDEX idx_permisos_activo ON permisos(activo);
CREATE UNIQUE INDEX idx_permisos_modulo_accion ON permisos(modulo, accion);

-- 3. TABLA INTERMEDIA ROLES-PERMISOS (muchos a muchos)
CREATE TABLE IF NOT EXISTS roles_permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id UUID NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_rol_permiso UNIQUE(rol_id, permiso_id)
);

CREATE INDEX idx_roles_permisos_rol ON roles_permisos(rol_id);
CREATE INDEX idx_roles_permisos_permiso ON roles_permisos(permiso_id);

-- 4. MODIFICAR TABLA USUARIOS
-- Agregar columna rol_id para referenciar la tabla roles
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS rol_id UUID REFERENCES roles(id);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON usuarios(rol_id);

-- ========================================
-- DATOS INICIALES - ROLES DEL SISTEMA
-- ========================================

-- Rol de Administrador (acceso total)
INSERT INTO roles (nombre, descripcion, es_sistema, activo) 
VALUES 
    ('Administrador', 'Acceso completo a todas las funcionalidades del sistema', TRUE, TRUE),
    ('Organizador', 'Usuario con permisos limitados para organizar eventos y gestionar reuniones', TRUE, TRUE),
    ('Empresa', 'Usuario de empresa con acceso a su perfil y funcionalidades básicas', TRUE, TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- ========================================
-- DATOS INICIALES - PERMISOS DEL SISTEMA
-- ========================================

-- Permisos módulo: EMPRESAS
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_empresas', 'Ver listado de empresas', 'empresas', 'ver'),
    ('crear_empresa', 'Crear nuevas empresas', 'empresas', 'crear'),
    ('editar_empresa', 'Editar información de empresas', 'empresas', 'editar'),
    ('eliminar_empresa', 'Eliminar empresas', 'empresas', 'eliminar'),
    ('aprobar_empresa', 'Aprobar empresas pendientes', 'empresas', 'aprobar')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: EVENTOS
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_eventos', 'Ver listado de eventos', 'eventos', 'ver'),
    ('crear_evento', 'Crear nuevos eventos', 'eventos', 'crear'),
    ('editar_evento', 'Editar información de eventos', 'eventos', 'editar'),
    ('eliminar_evento', 'Eliminar eventos', 'eventos', 'eliminar'),
    ('gestionar_inscripciones', 'Gestionar inscripciones de empresas a eventos', 'eventos', 'gestionar_inscripciones')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: REUNIONES
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_reuniones', 'Ver listado de reuniones', 'reuniones', 'ver'),
    ('crear_reunion', 'Crear nuevas reuniones', 'reuniones', 'crear'),
    ('editar_reunion', 'Editar reuniones existentes', 'reuniones', 'editar'),
    ('eliminar_reunion', 'Eliminar reuniones', 'reuniones', 'eliminar'),
    ('gestionar_bloques', 'Gestionar bloques horarios', 'reuniones', 'gestionar_bloques')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: PARTICIPANTES
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_participantes', 'Ver listado de participantes', 'participantes', 'ver'),
    ('crear_participante', 'Crear nuevos participantes', 'participantes', 'crear'),
    ('editar_participante', 'Editar información de participantes', 'participantes', 'editar'),
    ('eliminar_participante', 'Eliminar participantes', 'participantes', 'eliminar'),
    ('gestionar_checkin', 'Gestionar check-in de participantes', 'participantes', 'gestionar_checkin')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: KPIs
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_kpis', 'Ver dashboard de KPIs', 'kpis', 'ver'),
    ('editar_kpis', 'Editar metas de KPIs', 'kpis', 'editar')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: USUARIOS
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_usuarios', 'Ver listado de usuarios', 'usuarios', 'ver'),
    ('crear_usuario', 'Crear nuevos usuarios', 'usuarios', 'crear'),
    ('editar_usuario', 'Editar información de usuarios', 'usuarios', 'editar'),
    ('eliminar_usuario', 'Eliminar usuarios', 'usuarios', 'eliminar'),
    ('gestionar_roles', 'Gestionar roles y permisos', 'usuarios', 'gestionar_roles')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: CURADURIA
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_curaduria', 'Ver información de curaduría', 'curaduria', 'ver'),
    ('editar_curaduria', 'Editar información de curaduría', 'curaduria', 'editar')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: SEGUIMIENTO
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('ver_seguimiento', 'Ver seguimientos', 'seguimiento', 'ver'),
    ('crear_seguimiento', 'Crear seguimientos', 'seguimiento', 'crear'),
    ('editar_seguimiento', 'Editar seguimientos', 'seguimiento', 'editar'),
    ('eliminar_seguimiento', 'Eliminar seguimientos', 'seguimiento', 'eliminar')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos módulo: CREDENCIALES
INSERT INTO permisos (nombre, descripcion, modulo, accion) VALUES
    ('generar_credenciales', 'Generar credenciales PDF', 'credenciales', 'generar'),
    ('ver_credenciales', 'Ver historial de credenciales', 'credenciales', 'ver')
ON CONFLICT (nombre) DO NOTHING;

-- ========================================
-- ASIGNACIÓN DE PERMISOS A ROLES
-- ========================================

-- ADMINISTRADOR: Todos los permisos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    r.id as rol_id,
    p.id as permiso_id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'Administrador'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- ORGANIZADOR: Permisos típicos (sin gestión de usuarios/roles)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    r.id as rol_id,
    p.id as permiso_id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'Organizador'
AND p.nombre IN (
    'ver_empresas', 'editar_empresa', 'aprobar_empresa',
    'ver_eventos', 'editar_evento',
    'ver_reuniones', 'crear_reunion', 'editar_reunion', 'gestionar_bloques',
    'ver_participantes', 'gestionar_checkin',
    'ver_kpis',
    'ver_curaduria', 'editar_curaduria',
    'ver_seguimiento', 'crear_seguimiento', 'editar_seguimiento',
    'generar_credenciales', 'ver_credenciales'
)
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- EMPRESA: Permisos básicos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
    r.id as rol_id,
    p.id as permiso_id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'Empresa'
AND p.nombre IN (
    'ver_eventos',
    'ver_reuniones',
    'ver_participantes'
)
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- ========================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- ========================================
-- Actualizar usuarios existentes con los nuevos roles

-- Asignar rol Administrador a usuarios con rol 'admin'
UPDATE usuarios 
SET rol_id = (SELECT id FROM roles WHERE nombre = 'Administrador')
WHERE rol = 'admin' AND rol_id IS NULL;

-- Asignar rol Empresa a usuarios con rol 'empresa'
UPDATE usuarios 
SET rol_id = (SELECT id FROM roles WHERE nombre = 'Empresa')
WHERE rol = 'empresa' AND rol_id IS NULL;

-- ========================================
-- FUNCIONES AUXILIARES
-- ========================================

-- Función para verificar si un usuario tiene un permiso específico
CREATE OR REPLACE FUNCTION usuario_tiene_permiso(
    p_usuario_id UUID,
    p_permiso_nombre VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    tiene_permiso BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        JOIN roles_permisos rp ON r.id = rp.rol_id
        JOIN permisos p ON rp.permiso_id = p.id
        WHERE u.id = p_usuario_id
        AND p.nombre = p_permiso_nombre
        AND u.activo = TRUE
        AND r.activo = TRUE
        AND p.activo = TRUE
    ) INTO tiene_permiso;
    
    RETURN tiene_permiso;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener todos los permisos de un usuario
CREATE OR REPLACE FUNCTION obtener_permisos_usuario(
    p_usuario_id UUID
) RETURNS TABLE (
    permiso_nombre VARCHAR,
    permiso_descripcion TEXT,
    modulo VARCHAR,
    accion VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.nombre,
        p.descripcion,
        p.modulo,
        p.accion
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    JOIN roles_permisos rp ON r.id = rp.rol_id
    JOIN permisos p ON rp.permiso_id = p.id
    WHERE u.id = p_usuario_id
    AND u.activo = TRUE
    AND r.activo = TRUE
    AND p.activo = TRUE
    ORDER BY p.modulo, p.accion;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMENTARIOS EN TABLAS
-- ========================================

COMMENT ON TABLE roles IS 'Roles del sistema que agrupan conjuntos de permisos';
COMMENT ON TABLE permisos IS 'Permisos granulares del sistema organizados por módulo y acción';
COMMENT ON TABLE roles_permisos IS 'Relación muchos a muchos entre roles y permisos';
COMMENT ON COLUMN usuarios.rol_id IS 'Rol asignado al usuario (reemplaza campo rol antiguo)';

-- ========================================
-- VIEWS ÚTILES
-- ========================================

-- Vista para ver roles con cantidad de permisos
CREATE OR REPLACE VIEW vista_roles_resumen AS
SELECT 
    r.id,
    r.nombre,
    r.descripcion,
    r.es_sistema,
    r.activo,
    COUNT(rp.permiso_id) as cantidad_permisos,
    COUNT(u.id) as cantidad_usuarios
FROM roles r
LEFT JOIN roles_permisos rp ON r.id = rp.rol_id
LEFT JOIN usuarios u ON r.id = u.rol_id
GROUP BY r.id, r.nombre, r.descripcion, r.es_sistema, r.activo;

-- Vista para ver permisos por módulo
CREATE OR REPLACE VIEW vista_permisos_por_modulo AS
SELECT 
    modulo,
    COUNT(*) as cantidad_permisos,
    array_agg(nombre ORDER BY accion) as permisos
FROM permisos
WHERE activo = TRUE
GROUP BY modulo
ORDER BY modulo;

COMMENT ON VIEW vista_roles_resumen IS 'Resumen de roles con cantidad de permisos y usuarios asignados';
COMMENT ON VIEW vista_permisos_por_modulo IS 'Permisos agrupados por módulo';
