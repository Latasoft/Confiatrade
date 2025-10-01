import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('🔍 Probando tablas de Webpay...');
    
    const tests = {};
    
    // Test 1: Verificar tabla productos
    try {
      const { data: productos, error: errorProductos } = await supabase
        .from('productos')
        .select('id, nombre, precio')
        .limit(3);
      
      tests.productos = {
        success: !errorProductos,
        count: productos?.length || 0,
        error: errorProductos?.message || null,
        sample: productos?.[0] || null
      };
    } catch (err) {
      tests.productos = { success: false, error: err.message };
    }

    // Test 2: Verificar tabla ordenes
    try {
      const { data: ordenes, error: errorOrdenes } = await supabase
        .from('ordenes')
        .select('id')
        .limit(1);
      
      tests.ordenes = {
        success: !errorOrdenes,
        accessible: true,
        error: errorOrdenes?.message || null
      };
    } catch (err) {
      tests.ordenes = { success: false, error: err.message };
    }

    // Test 3: Verificar tabla orden_items
    try {
      const { data: items, error: errorItems } = await supabase
        .from('orden_items')
        .select('id')
        .limit(1);
      
      tests.orden_items = {
        success: !errorItems,
        accessible: true,
        error: errorItems?.message || null
      };
    } catch (err) {
      tests.orden_items = { success: false, error: err.message };
    }

    // Test 4: Verificar tabla transacciones_pago
    try {
      const { data: transacciones, error: errorTrans } = await supabase
        .from('transacciones_pago')
        .select('id')
        .limit(1);
      
      tests.transacciones_pago = {
        success: !errorTrans,
        accessible: true,
        error: errorTrans?.message || null
      };
    } catch (err) {
      tests.transacciones_pago = { success: false, error: err.message };
    }

    // Test 5: Intentar insertar una orden de prueba
    try {
      const testOrder = {
        usuario_id: 'test_user',
        email: 'test@example.com',
        nombre_cliente: 'Test User',
        total: 1000,
        estado: 'test'
      };

      const { data: insertTest, error: insertError } = await supabase
        .from('ordenes')
        .insert([testOrder])
        .select()
        .single();

      if (!insertError && insertTest) {
        // Eliminar la orden de prueba
        await supabase.from('ordenes').delete().eq('id', insertTest.id);
      }

      tests.insert_test = {
        success: !insertError,
        error: insertError?.message || null,
        details: insertError?.details || null
      };
    } catch (err) {
      tests.insert_test = { success: false, error: err.message };
    }

    console.log('✅ Tests de tablas completados:', tests);

    return NextResponse.json({
      success: true,
      message: 'Tests de tablas Webpay completados',
      tests
    });

  } catch (error) {
    console.error('❌ Error en tests:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}