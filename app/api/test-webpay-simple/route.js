import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "API Webpay Simple funcionando correctamente",
      timestamp: new Date().toISOString(),
      endpoints: {
        create: "/api/webpay/create-simple",
        return: "/api/webpay/return-simple"
      },
      test_data: {
        productos: [
          {
            id: 1,
            nombre: "Producto Test",
            precio: 10000,
            cantidad: 1
          }
        ],
        datosFacturacion: {
          nombre: "Test User",
          email: "test@example.com",
          telefono: "123456789"
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en test simple:', error);
    
    return NextResponse.json(
      { 
        error: 'Error en endpoint de test',
        details: error.message
      },
      { status: 500 }
    );
  }
}