// Test de conexión a Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log('🔍 Probando conexión a Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('Service Key configurada:', supabaseServiceKey ? 'Sí' : 'No')
    
    // Probar conexión básica
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Error al conectar con Supabase:', error)
      return new Response(JSON.stringify({ 
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details 
      }), { status: 500 })
    }
    
    console.log('✅ Conexión exitosa a Supabase')
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Conexión exitosa a Supabase',
      count: data 
    }), { status: 200 })
    
  } catch (err) {
    console.error('❌ Error inesperado:', err)
    return new Response(JSON.stringify({ 
      error: 'Error de conexión', 
      message: err.message,
      stack: err.stack 
    }), { status: 500 })
  }
}