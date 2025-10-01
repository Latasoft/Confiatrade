import { NextResponse } from 'next/server';
import { WebpayPlus, Environment } from 'transbank-sdk';
import { ordenesService, transaccionesService, utilidadesService } from '@/lib/webpayServices';

export async function POST(request) {
  console.log('=== INICIO ENDPOINT WEBPAY CREATE ===');
  
  try {
    // Configurar Webpay Plus con las credenciales
    console.log('Configurando Webpay Plus...');
    
    // Configuración para el ambiente de integración
    WebpayPlus.commerceCode = process.env.WEBPAY_COMMERCE_CODE;
    WebpayPlus.apiKey = process.env.WEBPAY_API_KEY;
    WebpayPlus.environment = Environment.Integration;
    
    console.log('Webpay Plus configurado correctamente:', {
      commerceCode: WebpayPlus.commerceCode,
      environment: WebpayPlus.environment
    });

    const body = await request.json();
    console.log('Body recibido:', JSON.stringify(body, null, 2));
    
    const { productos, datosFacturacion } = body;

    // Validar datos requeridos
    console.log('Validando datos de entrada...');
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      console.error('Error: Productos son requeridos');
      return NextResponse.json(
        { error: 'Productos son requeridos' },
        { status: 400 }
      );
    }

    if (!datosFacturacion || !datosFacturacion.email || !datosFacturacion.nombre) {
      console.error('Error: Datos de facturación incompletos', datosFacturacion);
      return NextResponse.json(
        { error: 'Datos de facturación incompletos' },
        { status: 400 }
      );
    }
    console.log('Datos validados correctamente');

    // Calcular total de la orden
    const totalOrden = productos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
    console.log('Total calculado:', totalOrden);

    // Crear la orden en la base de datos
    console.log('Creando orden en base de datos...');
    const nuevaOrden = await ordenesService.crearOrden({
      usuario_id: datosFacturacion.usuario_id || null,
      email: datosFacturacion.email,
      nombre_cliente: `${datosFacturacion.nombre} ${datosFacturacion.apellido || ''}`.trim(),
      telefono: datosFacturacion.telefono || '',
      direccion: datosFacturacion.direccion || '',
      ciudad: datosFacturacion.ciudad || '',
      region: datosFacturacion.region || '',
      codigo_postal: datosFacturacion.codigoPostal || '',
      total: totalOrden
    });
    console.log('Orden creada:', nuevaOrden);

    // Agregar productos a la orden
    console.log('Agregando items a la orden...');
    const itemsParaOrden = productos.map(producto => ({
      producto_id: producto.id,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio
    }));
    console.log('Items para orden:', itemsParaOrden);

    await ordenesService.agregarItems(nuevaOrden.id, itemsParaOrden);
    console.log('Items agregados correctamente');

    // Crear transacción con Webpay
    console.log('Preparando transacción Webpay...');
    const ordenId = nuevaOrden.id.toString();
    const buyOrder = utilidadesService.generarBuyOrder();
    const sessionId = `orden_${ordenId}_${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webpay/return`;
    
    console.log('Datos para Webpay:', {
      buyOrder,
      sessionId,
      totalOrden,
      returnUrl
    });

    console.log('Creando transacción con Webpay...');
    const transaction = new WebpayPlus.Transaction();
    const response = await transaction.create(
      buyOrder,
      sessionId, 
      totalOrden,
      returnUrl
    );
    console.log('Respuesta de Webpay:', response);

    // Actualizar orden con datos de Webpay
    console.log('Actualizando orden con datos de Webpay...');
    await ordenesService.actualizarWebpayData(nuevaOrden.id, {
      token: response.token,
      buy_order: buyOrder,
      session_id: sessionId,
      amount: totalOrden
    });
    console.log('Orden actualizada con datos de Webpay');

    // Crear registro de transacción
    console.log('Creando registro de transacción...');
    await transaccionesService.crearTransaccion({
      orden_id: nuevaOrden.id,
      webpay_token: response.token,
      webpay_buy_order: buyOrder,
      webpay_session_id: sessionId,
      webpay_amount: totalOrden
    });
    console.log('Registro de transacción creado');

    console.log('=== TRANSACCIÓN COMPLETADA EXITOSAMENTE ===');
    console.log('Transacción Webpay creada:', {
      ordenId,
      token: response.token,
      url: response.url
    });

    return NextResponse.json({
      success: true,
      ordenId: nuevaOrden.id,
      webpayUrl: response.url,
      token: response.token,
      total: totalOrden
    });

  } catch (error) {
    console.error('=== ERROR EN ENDPOINT WEBPAY CREATE ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    console.error('Nombre del error:', error.name);
    
    // Si es un error de Supabase, log adicional
    if (error.code) {
      console.error('Código de error Supabase:', error.code);
      console.error('Detalles Supabase:', error.details);
      console.error('Hint Supabase:', error.hint);
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          name: error.name,
          code: error.code || 'NO_CODE',
          details: error.details || 'NO_DETAILS'
        } : undefined
      },
      { status: 500 }
    );
  }
}