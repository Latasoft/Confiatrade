import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('Probando conexión a Supabase...');
    
    // Test 1: Verificar conexión básica
    const { data: healthCheck, error: healthError } = await supabase
      .from('productos')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('Error en health check:', healthError);
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a Supabase',
        details: healthError
      }, { status: 500 });
    }

    // Test 2: Verificar tabla ordenes
    const { data: ordenesCheck, error: ordenesError } = await supabase
      .from('ordenes')
      .select('count', { count: 'exact', head: true });

    // Test 3: Verificar tabla orden_items
    const { data: itemsCheck, error: itemsError } = await supabase
      .from('orden_items')
      .select('count', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      tests: {
        productos: {
          success: !healthError,
          count: healthCheck?.count || 0,
          error: healthError?.message
        },
        ordenes: {
          success: !ordenesError,
          count: ordenesCheck?.count || 0,
          error: ordenesError?.message
        },
        orden_items: {
          success: !itemsError,
          count: itemsCheck?.count || 0,
          error: itemsError?.message
        }
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });

  } catch (error) {
    console.error('Error en test de Supabase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error general',
      details: error.message
    }, { status: 500 });
  }
}