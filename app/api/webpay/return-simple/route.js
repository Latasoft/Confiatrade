import { NextResponse } from 'next/server';
import { WebpayPlus } from 'transbank-sdk';

export async function POST(request) {
  try {
    const { token_ws } = await request.json();

    if (!token_ws) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    console.log('🔍 Confirmando transacción con token:', token_ws);

    // Confirmar transacción con Webpay
    const transaction = new WebpayPlus.Transaction();
    const response = await transaction.commit(token_ws);

    console.log('📋 Respuesta de confirmación:', response);

    // Verificar si la transacción fue exitosa
    if (response.response_code === 0) {
      // Transacción exitosa
      return NextResponse.json({
        success: true,
        transaccion: {
          authorizationCode: response.authorization_code,
          amount: response.amount,
          buyOrder: response.buy_order,
          sessionId: response.session_id,
          cardNumber: response.card_detail?.card_number,
          accountingDate: response.accounting_date,
          transactionDate: response.transaction_date,
          responseCode: response.response_code,
          status: 'COMPLETED'
        }
      });
    } else {
      // Transacción rechazada
      return NextResponse.json({
        success: false,
        error: 'Transacción rechazada',
        details: {
          responseCode: response.response_code,
          amount: response.amount,
          buyOrder: response.buy_order
        }
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error al confirmar transacción:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la confirmación',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}