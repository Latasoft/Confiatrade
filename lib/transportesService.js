import { supabase } from './supabaseClient'

// =================== TRANSPORTES SERVICE ===================
export const transportesService = {
  // Obtener todos los transportes activos
  async getTransportes() {
    try {
      console.log('🔍 Conectando a Supabase transportes...')
      
      if (!supabase) {
        throw new Error('Cliente de Supabase no está configurado')
      }
      
      const { data, error } = await supabase
        .from('transportes')
        .select('*')
        .eq('estado', 'disponible')
        .order('fecha_salida', { ascending: true })

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }
      
      console.log('✅ Transportes obtenidos:', data?.length, 'registros')
      return data || []
    } catch (error) {
      console.error('❌ Error en getTransportes:', error)
      throw error
    }
  },

  // Obtener transporte por ID
  async getTransporte(id) {
    try {
      const { data, error } = await supabase
        .from('transportes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error obteniendo transporte:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error en getTransporte:', error)
      return null
    }
  },

  // Buscar transportes por texto
  async buscarTransportes(termino) {
    try {
      const { data, error } = await supabase
        .from('transportes')
        .select('*')
        .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%,origen.ilike.%${termino}%,destino.ilike.%${termino}%,transportista.ilike.%${termino}%`)
        .eq('estado', 'disponible')
        .order('fecha_salida', { ascending: true })

      if (error) {
        console.error('Error buscando transportes:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error en buscarTransportes:', error)
      return []
    }
  },

  // Crear nueva reserva de transporte
  async crearReserva(reservaData) {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .insert({
          usuario_id: reservaData.usuario_id,
          transporte_id: reservaData.transporte_id,
          cantidad_reservada: reservaData.cantidad_reservada,
          estado: 'pendiente',
          fecha_reserva: new Date().toISOString(),
          notas: reservaData.notas
        })
        .select()

      if (error) {
        console.error('Error creando reserva:', error)
        throw error
      }
      
      return data[0]
    } catch (error) {
      console.error('Error en crearReserva:', error)
      throw error
    }
  }
}