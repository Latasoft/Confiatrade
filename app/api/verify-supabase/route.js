import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  try {
    console.log('🔍 Verificando conexión a Supabase...');
    
    // Verificar conexión básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('usuarios_roles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a Supabase',
        details: connectionError.message
      }, { status: 500 });
    }

    // Verificar si la tabla existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('usuarios_roles')
      .select('*')
      .limit(1);

    if (tableError && tableError.code === 'PGRST205') {
      console.error('❌ Tabla no encontrada');
      return NextResponse.json({
        success: false,
        error: 'La tabla usuarios_roles no existe',
        solution: 'Ejecuta el script SQL en Supabase para crear la tabla'
      }, { status: 404 });
    }

    console.log('✅ Conexión exitosa a Supabase');
    return NextResponse.json({
      success: true,
      message: 'Conexión a Supabase exitosa',
      tableExists: true,
      recordCount: connectionTest?.count || 0
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return NextResponse.json({
      success: false,
      error: 'Error inesperado',
      details: error.message
    }, { status: 500 });
  }
}