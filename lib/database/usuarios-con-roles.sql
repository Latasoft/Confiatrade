-- Script para crear sistema de usuarios con roles
-- Ejecutar este script en Supabase SQL Editor

-- 1. Crear tabla de usuarios con roles
CREATE TABLE IF NOT EXISTS usuarios_roles (
  id SERIAL PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'cliente')),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_clerk_id ON usuarios_roles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_email ON usuarios_roles(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON usuarios_roles(rol);

-- 3. Insertar usuarios por defecto
-- Admin: admin@confiatrade.com / confiatrade123admin
-- Cliente: cliente@confiatrade.com / confiatrade123cliente

-- Nota: Los clerk_id se actualizarán automáticamente cuando los usuarios se registren
INSERT INTO usuarios_roles (clerk_id, email, nombre, apellido, rol, estado) VALUES
  ('temp_admin_id', 'admin@confiatrade.com', 'Administrador', 'ConfiaTrade', 'admin', 'activo'),
  ('temp_cliente_id', 'cliente@confiatrade.com', 'Cliente', 'Demo', 'cliente', 'activo')
ON CONFLICT (email) DO NOTHING;

-- 4. Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_usuarios_roles_updated_at 
  BEFORE UPDATE ON usuarios_roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar Row Level Security (RLS) - opcional
ALTER TABLE usuarios_roles ENABLE ROW LEVEL SECURITY;

-- 7. Política para permitir que los usuarios vean solo su propia información
CREATE POLICY "Los usuarios pueden ver su propia información" ON usuarios_roles
  FOR SELECT USING (auth.uid()::text = clerk_id);

-- 8. Política para permitir insertar nuevos usuarios
CREATE POLICY "Permitir insertar usuarios" ON usuarios_roles
  FOR INSERT WITH CHECK (true);

-- 9. Política para actualizar solo su propia información
CREATE POLICY "Los usuarios pueden actualizar su propia información" ON usuarios_roles
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Verificar la creación
SELECT 'Tabla usuarios_roles creada exitosamente' as status;
SELECT * FROM usuarios_roles;