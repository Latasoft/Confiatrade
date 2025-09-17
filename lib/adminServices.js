// adminServices.js
import { supabase } from './supabaseClient'

export const AdminServices = {
  // Productos
  async createProduct(data) {
    const { data: product, error } = await supabase
      .from('productos')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return product
  },

  async getProducts() {
    const { data: products, error } = await supabase
      .from('productos')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (error) throw error
    return products
  },

  async updateProduct(id, data) {
    const { data: product, error } = await supabase
      .from('productos')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return product
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Pedidos
  async getPedidos() {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        perfiles:usuario_id (email, nombre),
        pedidos_productos (
          id,
          cantidad,
          monto,
          estado,
          productos:producto_id (nombre, precio)
        )
      `)
      .order('fecha_creacion', { ascending: false })
    
    if (error) throw error
    return pedidos
  },

  async updatePedidoStatus(id, estado) {
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return pedido
  },

  // Envíos
  async getEnvios() {
    const { data: envios, error } = await supabase
      .from('envios')
      .select(`
        *,
        pedidos:pedido_id (
          id,
          usuario_id,
          estado,
          monto_total,
          perfiles:usuario_id (email, nombre)
        )
      `)
      .order('fecha_envio', { ascending: false })
    
    if (error) throw error
    return envios
  },

  async updateEnvioStatus(id, estado_envio) {
    const { data: envio, error } = await supabase
      .from('envios')
      .update({ estado_envio })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return envio
  },

  // Usuarios (Perfiles)
  async getUsers() {
    const { data: users, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (error) throw error
    return users
  },

  async updateUserRole(id, rol) {
    const { data: user, error } = await supabase
      .from('perfiles')
      .update({ rol })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return user
  },

  // Transportes
  async getTransportes() {
    const { data: transportes, error } = await supabase
      .from('transportes')
      .select('*')
    
    if (error) throw error
    return transportes
  },

  async createTransporte(data) {
    const { data: transporte, error } = await supabase
      .from('transportes')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return transporte
  },

  async updateTransporteStatus(id, estado) {
    const { data: transporte, error } = await supabase
      .from('transportes')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return transporte
  }
}
