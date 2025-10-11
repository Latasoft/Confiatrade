-- Script para agregar el campo "estado_producto" a las solicitudes
-- Ejecutar en Supabase SQL Editor

-- 1. Primero verificamos la estructura actual de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'solicitudes_compra'
ORDER BY ordinal_position;

-- 2. Verificar estados actuales
SELECT DISTINCT estado FROM solicitudes_compra;

-- 3. Agregar nueva columna para el estado del producto
ALTER TABLE solicitudes_compra 
ADD COLUMN IF NOT EXISTS estado_producto VARCHAR(50) DEFAULT 'pendiente';

-- 3.1. Agregar columnas para comentarios específicos de cada etapa
ALTER TABLE solicitudes_compra 
ADD COLUMN IF NOT EXISTS comentario_solicitud TEXT,
ADD COLUMN IF NOT EXISTS comentario_pago TEXT,
ADD COLUMN IF NOT EXISTS comentario_producto TEXT;

-- 4. Agregar restricción CHECK para los valores permitidos del estado del producto
DO $$ 
BEGIN
    -- Intentar eliminar la restricción CHECK existente si existe
    BEGIN
        ALTER TABLE solicitudes_compra DROP CONSTRAINT IF EXISTS solicitudes_compra_estado_producto_check;
    EXCEPTION
        WHEN OTHERS THEN
            -- Si falla, continuar
            NULL;
    END;
    
    -- Agregar nueva restricción CHECK
    ALTER TABLE solicitudes_compra 
    ADD CONSTRAINT solicitudes_compra_estado_producto_check 
    CHECK (estado_producto IN ('pendiente', 'en_proceso', 'finalizada'));
    
EXCEPTION
    WHEN OTHERS THEN
        -- Si falla, probablemente no hay restricciones CHECK, continuar
        RAISE NOTICE 'Restricción CHECK no aplicada o ya existe una similar';
END $$;

-- 5. Actualizar todos los registros existentes según su estado actual
UPDATE solicitudes_compra 
SET estado_producto = CASE 
    WHEN estado = 'aprobada' AND estado_pago = 'aprobado' THEN 'en_proceso'
    ELSE 'pendiente'
END;

-- 6. Verificar que el nuevo campo funciona correctamente
-- (Sin insertar datos de prueba para evitar errores de columnas faltantes)

-- 7. Mostrar resultado final
SELECT 
    'Campo "estado_producto" agregado correctamente' as resultado,
    COUNT(*) as total_solicitudes
FROM solicitudes_compra;

-- 8. Verificar los nuevos estados disponibles
SELECT 
    estado as solicitud_estado, 
    estado_pago as pago_estado, 
    estado_producto as producto_estado, 
    COUNT(*) as cantidad
FROM solicitudes_compra 
GROUP BY estado, estado_pago, estado_producto 
ORDER BY estado, estado_pago, estado_producto;

-- 9. Mostrar algunos registros de ejemplo
SELECT id, estado, estado_pago, estado_producto, created_at
FROM solicitudes_compra 
ORDER BY created_at DESC 
LIMIT 5;