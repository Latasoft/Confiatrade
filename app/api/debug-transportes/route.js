// API para probar directamente la conexión con transportes
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    console.log('🔍 Probando conexión directa con transportes...')
    
    // Verificar cliente
    if (!supabase) {
      return Response.json({ 
        success: false, 
        error: 'Cliente de Supabase no configurado' 
      }, { status: 500 })
    }
    
    // Obtener transportes directamente
    const { data, error } = await supabase
      .from('transportes')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('❌ Error de Supabase:', error)
      return Response.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    console.log('✅ Transportes obtenidos:', data?.length)
    
    return Response.json({ 
      success: true,
      message: 'Conexión exitosa',
      count: data?.length || 0,
      transportes: data || []
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return Response.json({ 
      success: false, 
      error: error.message
    }, { status: 500 })
  }
}