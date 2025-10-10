-- Agregar columna contacto_transporte si no existe
ALTER TABLE solicitudes_compra 
ADD COLUMN IF NOT EXISTS contacto_transporte TEXT;

-- Verificar las columnas existentes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'solicitudes_compra' 
AND column_name IN ('contacto_transporte', 'comprobante_url', 'comprobante_data');