import { NextResponse } from 'next/server';
import { ordenesService, transaccionesService } from '@/lib/webpayServices';

export async function GET(request, { params }) {
  try {
    // En Next.js 15, params puede ser una Promise
    const resolvedParams = await params;
    const ordenId = parseInt(resolvedParams.id);

    if (!ordenId || isNaN(ordenId)) {
      return NextResponse.json(
        { error: 'ID de orden inválido' },
        { status: 400 }
      );
    }

    // Obtener orden con items
    const orden = await ordenesService.getOrden(ordenId);
    
    if (!orden) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Obtener transacciones de la orden (si las hay)
    let transacciones = [];
    try {
      const transaccion = await transaccionesService.getTransaccionPorToken(orden.webpay_token);
      if (transaccion) {
        transacciones = [transaccion];
      }
    } catch (error) {
      // No hay transacciones, está bien
      console.log('No se encontraron transacciones para la orden:', ordenId);
    }

    // Construir respuesta
    const respuesta = {
      orden: {
        id: orden.id,
        usuario_id: orden.usuario_id,
        email: orden.email,
        nombre: orden.nombre_cliente,
        telefono: orden.telefono,
        direccion: orden.direccion,
        ciudad: orden.ciudad,
        region: orden.region,
        codigo_postal: orden.codigo_postal,
        total: orden.total,
        estado: orden.estado,
        fecha_creacion: orden.created_at,
        fecha_pago: orden.updated_at,
        webpay_token: orden.webpay_token
      },
      items: orden.orden_items?.map(item => ({
        id: item.id,
        producto_id: item.producto_id,
        nombre_producto: item.productos?.nombre || 'Producto',
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      })) || [],
      transacciones: transacciones.map(t => ({
        id: t.id,
        estado: t.estado,
        monto: t.webpay_amount,
        codigo_respuesta: t.webpay_response_code,
        codigo_autorizacion: t.webpay_authorization_code,
        tipo_pago: t.webpay_payment_type_code,
        ultimos_digitos: t.webpay_card_detail ? JSON.parse(t.webpay_card_detail).card_number : null,
        fecha_transaccion: t.created_at
      }))
    };

    return NextResponse.json(respuesta);

  } catch (error) {
    console.error('Error al obtener orden:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}