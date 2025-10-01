import { NextResponse } from 'next/server';
import { WebpayPlus } from 'transbank-sdk';

export async function POST(request) {
  console.log('=== INICIO ENDPOINT WEBPAY CREATE SIMPLE ===');
  
  try {
    console.log('📦 Recibiendo datos del checkout...');
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return Response.json({ error: 'No hay productos en el carrito' }, { status: 400 });
    }
    
    if (!body.datosFacturacion) {
      return Response.json({ error: 'Faltan datos de facturación' }, { status: 400 });
    }

    console.log('✅ Datos recibidos:', {
      itemsCount: body.items.length,
      email: body.datosFacturacion.email,
      nombre: body.datosFacturacion.nombre
    });

    // Calcular total
    const totalOrden = body.items.reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0);

    console.log('💰 Total calculado:', totalOrden);

    // Generar identificadores únicos
    const timestamp = Date.now();
    const buyOrder = `ORDER_${timestamp}`;
    const sessionId = `SESSION_${timestamp}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webpay/return-simple`;

    console.log('🔧 Configurando Webpay Plus...');
    
    // CONFIGURACIÓN CORRECTA de Webpay Plus
    WebpayPlus.commerceCode = process.env.WEBPAY_COMMERCE_CODE;
    WebpayPlus.apiKey = process.env.WEBPAY_API_KEY;
    WebpayPlus.environment = WebpayPlus.environments.INTEGRATION; // Para pruebas
    
    console.log('📋 Configuración Webpay:', {
      commerceCode: WebpayPlus.commerceCode ? 'CONFIGURADO' : 'NO CONFIGURADO',
      apiKey: WebpayPlus.apiKey ? 'CONFIGURADO' : 'NO CONFIGURADO',
      environment: 'INTEGRATION'
    });

    console.log('🚀 Creando transacción Webpay...');
    console.log('📊 Parámetros transacción:', {
      buyOrder,
      sessionId,
      amount: totalOrden,
      returnUrl
    });

    try {
      const transaction = new WebpayPlus.Transaction();
      console.log('✅ Instancia de transacción creada');
      
      const response = await transaction.create(
        buyOrder,
        sessionId,
        totalOrden,
        returnUrl
      );

      console.log('🎉 Transacción creada exitosamente:', {
        token: response.token ? 'GENERADO' : 'NO GENERADO',
        url: response.url ? 'GENERADA' : 'NO GENERADA'
      });

      return Response.json({
        success: true,
        token: response.token,
        url: response.url,
        buyOrder,
        sessionId,
        amount: totalOrden
      });

    } catch (webpayError) {
      console.error('❌ Error en Webpay SDK:', webpayError);
      return Response.json({ 
        error: 'Error al crear transacción en Webpay',
        details: webpayError.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('=== ERROR EN ENDPOINT WEBPAY CREATE SIMPLE ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    console.error('Nombre del error:', error.name);
    
    return Response.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}