-- Esquema simplificado para Webpay en Supabase
-- Ejecutar en SQL Editor de Supabase

-- 1. Tabla de productos/servicios
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    imagen_url VARCHAR(500),
    categoria VARCHAR(100),
    stock INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de órdenes
CREATE TABLE IF NOT EXISTS ordenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id VARCHAR(255) NOT NULL, -- ID de Clerk
    email VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, pagado, cancelado, enviado
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'webpay',
    
    -- Datos del cliente
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    region VARCHAR(100),
    codigo_postal VARCHAR(10),
    
    -- Datos de Webpay
    webpay_token VARCHAR(255),
    webpay_buy_order VARCHAR(255),
    webpay_session_id VARCHAR(255),
    webpay_amount INTEGER, -- Monto en pesos chilenos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de items de orden
CREATE TABLE IF NOT EXISTS orden_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de transacciones de pago
CREATE TABLE IF NOT EXISTS transacciones_pago (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_id UUID NOT NULL,
    webpay_token VARCHAR(255) NOT NULL,
    webpay_buy_order VARCHAR(255) NOT NULL,
    webpay_session_id VARCHAR(255),
    webpay_amount INTEGER NOT NULL,
    
    -- Respuesta de Webpay
    webpay_vci VARCHAR(10),
    webpay_response_code INTEGER,
    webpay_transaction_date TIMESTAMP,
    webpay_authorization_code VARCHAR(20),
    webpay_payment_type_code VARCHAR(10),
    webpay_card_detail TEXT,
    
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, exitoso, fallido
    mensaje_error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insertar productos de ejemplo (servicios de transporte)
INSERT INTO productos (nombre, descripcion, precio, categoria, stock, imagen_url) VALUES
('Transporte Express Santiago', 'Servicio de transporte rápido en Santiago metropolitana', 15000.00, 'transporte', 100, '/images/transport-express.jpg'),
('Transporte Interregional', 'Transporte seguro entre regiones de Chile', 35000.00, 'transporte', 50, '/images/transport-inter.jpg'),
('Paquete Premium', 'Servicio de transporte premium con seguro incluido', 25000.00, 'transporte', 75, '/images/transport-premium.jpg'),
('Mudanza Completa', 'Servicio completo de mudanza residencial', 120000.00, 'mudanza', 20, '/images/mudanza.jpg'),
('Transporte de Carga', 'Transporte especializado para carga pesada', 80000.00, 'carga', 30, '/images/carga.jpg')
ON CONFLICT DO NOTHING;

-- 6. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ordenes_usuario_id ON ordenes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_webpay_token ON ordenes(webpay_token);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
