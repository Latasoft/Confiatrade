import { NextResponse } from 'next/server';
import { productosService } from '@/lib/webpayServices';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const activo = searchParams.get('activo');
    
    let productos;
    
    if (categoria && categoria !== 'todos') {
      productos = await productosService.getProductosPorCategoria(categoria);
    } else {
      productos = await productosService.getProductos();
    }

    // Filtrar por activo si se especifica
    if (activo !== null) {
      const activoBool = activo === 'true';
      productos = productos.filter(p => p.activo === activoBool);
    }

    return NextResponse.json({
      success: true,
      productos: productos.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        categoria: producto.categoria,
        activo: producto.activo,
        ubicacion: producto.ubicacion,
        proveedor: producto.proveedor,
        stock: producto.stock,
        unidad: producto.unidad,
        imagen_url: producto.imagen_url,
        fecha_creacion: producto.created_at
      }))
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    return NextResponse.json(
      { error: 'Creación de productos no disponible en esta API. Use el panel de administración.' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}