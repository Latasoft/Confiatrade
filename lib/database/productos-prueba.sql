-- Script para agregar productos de prueba a la base de datos
-- Ejecutar este script en Supabase SQL Editor

INSERT INTO productos (nombre, descripcion, precio, categoria, activo, ubicacion, proveedor, stock, unidad, imagen_url) VALUES
('Aceite de Girasol Premium', '200 litros de aceite de girasol de alta calidad, primera extracción en frío.', 120000, 'aceites', true, 'Mendoza, Argentina', 'AgroMendoza S.A.', 50, 'litros', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'),

('Trigo Premium Exportación', '3 toneladas de trigo de primera calidad, certificado para exportación internacional.', 150000, 'cereales', true, 'Buenos Aires, Argentina', 'Cereales del Sur', 25, 'toneladas', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),

('Cereales Mixtos Orgánicos', '500kg de cereales variados orgánicos certificados para exportación.', 80000, 'cereales', true, 'Concepción, Chile', 'ChileGranos Ltd.', 75, 'kg', 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400'),

('Aceite de Oliva Extra Virgen', '100 litros de aceite de oliva extra virgen, primera presión en frío.', 200000, 'aceites', true, 'Santiago, Chile', 'Olivos del Valle', 30, 'litros', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'),

('Quinoa Orgánica Boliviana', '1 tonelada de quinoa orgánica certificada del altiplano boliviano.', 250000, 'cereales', true, 'Altiplano, Bolivia', 'Altiplano Foods', 15, 'toneladas', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),

('Miel de Abeja Pura', '50kg de miel de abeja 100% natural, sin procesar ni aditivos.', 75000, 'otros', true, 'Valdivia, Chile', 'Apícola del Sur', 40, 'kg', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'),

('Café Arábica Premium', '100kg de café arábica de montaña, tueste medio, grano seleccionado.', 180000, 'otros', true, 'Medellín, Colombia', 'Café de los Andes', 20, 'kg', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'),

('Aceite de Coco Virgen', '80 litros de aceite de coco virgen prensado en frío, orgánico certificado.', 160000, 'aceites', true, 'Costa Rica', 'Tropical Oils CR', 35, 'litros', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'),

('Avena Integral Orgánica', '2 toneladas de avena integral orgánica certificada para exportación.', 90000, 'cereales', true, 'La Pampa, Argentina', 'Granos Pampeanos', 60, 'toneladas', 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400'),

('Cacao en Polvo Premium', '200kg de cacao en polvo natural, sin azúcar, origen ecuatoriano.', 220000, 'otros', true, 'Quito, Ecuador', 'Cacao Ecuatorial', 25, 'kg', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400');

-- Verificar que se insertaron correctamente
SELECT id, nombre, precio, categoria, activo FROM productos ORDER BY fecha_creacion DESC;