import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('🔍 Iniciando prueba de conexión con Supabase...');
    
    // Test 1: Verificar configuración
    const config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada'
    };
    
    console.log('📋 Configuración:', config);

    // Test 2: Conectividad básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('productos')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a Supabase',
        details: connectionError,
        config
      }, { status: 500 });
    }

    console.log('✅ Conexión exitosa');

    // Test 3: Verificar tablas
    const tests = [];

    // Test productos
    try {
      const { data: productos, error: errorProductos } = await supabase
        .from('productos')
        .select('*')
        .limit(1);
      
      tests.push({
        tabla: 'productos',
        success: !errorProductos,
        error: errorProductos?.message,
        datos: productos?.length || 0
      });
    } catch (error) {
      tests.push({
        tabla: 'productos',
        success: false,
        error: error.message
      });
    }

    // Test ordenes
    try {
      const { data: ordenes, error: errorOrdenes } = await supabase
        .from('ordenes')
        .select('*')
        .limit(1);
      
      tests.push({
        tabla: 'ordenes',
        success: !errorOrdenes,
        error: errorOrdenes?.message,
        datos: ordenes?.length || 0
      });
    } catch (error) {
      tests.push({
        tabla: 'ordenes',
        success: false,
        error: error.message
      });
    }

    // Test orden_items
    try {
      const { data: items, error: errorItems } = await supabase
        .from('orden_items')
        .select('*')
        .limit(1);
      
      tests.push({
        tabla: 'orden_items',
        success: !errorItems,
        error: errorItems?.message,
        datos: items?.length || 0
      });
    } catch (error) {
      tests.push({
        tabla: 'orden_items',
        success: false,
        error: error.message
      });
    }

    // Test transacciones_pago
    try {
      const { data: transacciones, error: errorTransacciones } = await supabase
        .from('transacciones_pago')
        .select('*')
        .limit(1);
      
      tests.push({
        tabla: 'transacciones_pago',
        success: !errorTransacciones,
        error: errorTransacciones?.message,
        datos: transacciones?.length || 0
      });
    } catch (error) {
      tests.push({
        tabla: 'transacciones_pago',
        success: false,
        error: error.message
      });
    }

    console.log('📊 Resultados de pruebas:', tests);

    return NextResponse.json({
      success: true,
      message: 'Pruebas completadas',
      config,
      tests,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error general:', error);
    return NextResponse.json({
      success: false,
      error: 'Error general en las pruebas',
      details: error.message
    }, { status: 500 });
  }
}