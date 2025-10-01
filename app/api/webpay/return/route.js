import { NextResponse } from 'next/server';
import { WebpayPlus } from 'transbank-sdk';
import { ordenesService, transaccionesService } from '@/lib/webpayServices';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token_ws = formData.get('token_ws');

    if (!token_ws) {
      console.error('Token de Webpay no encontrado en el retorno');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?error=token_missing`
      );
    }

    console.log('Procesando retorno de Webpay con token:', token_ws);

    // Confirmar transacción con Webpay
    const transaction = new WebpayPlus.Transaction();
    const result = await transaction.commit(token_ws);

    console.log('Resultado de confirmación Webpay:', result);

    // Buscar la orden asociada al token
    const orden = await ordenesService.getOrdenPorToken(token_ws);
    
    if (!orden) {
      console.error('Orden no encontrada para token:', token_ws);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?error=orden_no_encontrada`
      );
    }

    // Determinar estado del pago
    const pagoExitoso = result.status === 'AUTHORIZED' && result.response_code === 0;
    const nuevoEstado = pagoExitoso ? 'pagado' : 'fallido';

    // Actualizar orden
    await ordenesService.actualizarEstado(orden.id, nuevoEstado);

    // Actualizar transacción
    await transaccionesService.actualizarConRespuesta(token_ws, result);

    console.log(`Orden ${orden.id} actualizada a estado: ${nuevoEstado}`);

    // Redirigir según resultado
    if (pagoExitoso) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmacion?orden=${orden.id}&token=${token_ws}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?orden=${orden.id}&codigo=${result.response_code}`
      );
    }

  } catch (error) {
    console.error('Error al procesar retorno de Webpay:', error);
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?error=procesamiento`
    );
  }
}

// Manejar método GET para retornos directos desde Webpay
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_ws = searchParams.get('token_ws');

  if (!token_ws) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?error=token_missing`
    );
  }

  // Crear FormData simulado para reutilizar la lógica del POST
  const formData = new FormData();
  formData.append('token_ws', token_ws);
  
  const mockRequest = {
    formData: async () => formData
  };

  return POST(mockRequest);
}