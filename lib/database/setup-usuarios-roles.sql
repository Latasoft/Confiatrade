-- Crear tabla usuarios_roles para el sistema de autenticación
CREATE TABLE IF NOT EXISTS public.usuarios_roles (
    id SERIAL PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    nombre TEXT,
    rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_clerk_id ON public.usuarios_roles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_email ON public.usuarios_roles(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON public.usuarios_roles(rol);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.usuarios_roles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios autenticados lean todos los registros
CREATE POLICY IF NOT EXISTS "Los usuarios autenticados pueden leer todos los roles" ON public.usuarios_roles
    FOR SELECT USING (true);

-- Política para permitir insertar nuevos usuarios
CREATE POLICY IF NOT EXISTS "Los usuarios pueden crear su propio perfil" ON public.usuarios_roles
    FOR INSERT WITH CHECK (true);

-- Política para permitir actualizar su propio perfil
CREATE POLICY IF NOT EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.usuarios_roles
    FOR UPDATE USING (true);

-- Función para determinar rol por email
CREATE OR REPLACE FUNCTION determinar_rol_por_email(email_input TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Admin si el email es específico
    IF email_input = 'admin@confiatrade.com' THEN
        RETURN 'admin';
    -- Cliente por defecto
    ELSE
        RETURN 'cliente';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insertar usuario admin por defecto si no existe
INSERT INTO public.usuarios_roles (clerk_id, email, nombre, rol)
VALUES ('admin_default', 'admin@confiatrade.com', 'Administrador', 'admin')
ON CONFLICT (clerk_id) DO NOTHING;

-- Crear función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auto-actualizar updated_at
CREATE TRIGGER IF NOT EXISTS trigger_update_usuarios_roles_updated_at
    BEFORE UPDATE ON public.usuarios_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();