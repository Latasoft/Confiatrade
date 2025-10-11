import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('🔍 Debug: Verificando datos de solicitudes_compra');
    
    // Obtener una muestra de solicitudes
    const { data: solicitudes, error } = await supabase
      .from('solicitudes_compra')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener solicitudes:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('📋 Solicitudes encontradas:', solicitudes);
    
    // Analizar cada solicitud
    const analisis = solicitudes.map(s => ({
      id: s.id,
      cliente_id: s.cliente_id,
      cliente_nombre: s.cliente_nombre,
      cliente_email: s.cliente_email,
      created_at: s.created_at,
      estado: s.estado,
      // Verificar si los campos están definidos
      campos_disponibles: {
        tiene_cliente_id: !!s.cliente_id,
        tiene_cliente_nombre: !!s.cliente_nombre,
        tiene_cliente_email: !!s.cliente_email,
        cliente_nombre_tipo: typeof s.cliente_nombre,
        cliente_email_tipo: typeof s.cliente_email
      }
    }));

    return NextResponse.json({
      success: true,
      total_solicitudes: solicitudes.length,
      solicitudes_muestra: solicitudes,
      analisis: analisis,
      message: 'Debug completado'
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}