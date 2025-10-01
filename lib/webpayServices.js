import { supabase } from './supabaseClient'

// =================== PRODUCTOS ===================
export const productosService = {
  // Obtener todos los productos activos
  async getProductos() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Obtener producto por ID
  async getProducto(id) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Obtener productos por categoría
  async getProductosPorCategoria(categoria) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria', categoria)
      .eq('activo', true)
      .order('nombre')

    if (error) throw error
    return data
  }
}

// =================== ÓRDENES ===================
export const ordenesService = {
  // Crear nueva orden
  async crearOrden(ordenData) {
    const { data, error } = await supabase
      .from('ordenes')
      .insert({
        usuario_id: ordenData.usuario_id,
        email: ordenData.email,
        nombre_cliente: ordenData.nombre_cliente,
        telefono: ordenData.telefono,
        direccion: ordenData.direccion,
        ciudad: ordenData.ciudad,
        region: ordenData.region,
        codigo_postal: ordenData.codigo_postal,
        total: ordenData.total,
        estado: 'pendiente',
        metodo_pago: 'webpay'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Agregar items a una orden
  async agregarItems(ordenId, items) {
    const itemsData = items.map(item => ({
      orden_id: ordenId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario
    }))

    const { data, error } = await supabase
      .from('orden_items')
      .insert(itemsData)
      .select()

    if (error) throw error
    return data
  },

  // Actualizar datos de Webpay en la orden
  async actualizarWebpayData(ordenId, webpayData) {
    const { data, error } = await supabase
      .from('ordenes')
      .update({
        webpay_token: webpayData.token,
        webpay_buy_order: webpayData.buy_order,
        webpay_session_id: webpayData.session_id,
        webpay_amount: webpayData.amount
      })
      .eq('id', ordenId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Obtener orden por ID
  async getOrden(ordenId) {
    const { data, error } = await supabase
      .from('ordenes')
      .select(`
        *,
        orden_items (
          *,
          productos (*)
        )
      `)
      .eq('id', ordenId)
      .single()

    if (error) throw error
    return data
  },

  // Obtener orden por token de Webpay
  async getOrdenPorToken(token) {
    const { data, error } = await supabase
      .from('ordenes')
      .select(`
        *,
        orden_items (
          *,
          productos (*)
        )
      `)
      .eq('webpay_token', token)
      .single()

    if (error) throw error
    return data
  },

  // Obtener órdenes del usuario
  async getOrdenesPorUsuario(usuarioId) {
    const { data, error } = await supabase
      .from('ordenes')
      .select(`
        *,
        orden_items (
          *,
          productos (*)
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Actualizar estado de la orden
  async actualizarEstado(ordenId, estado) {
    const { data, error } = await supabase
      .from('ordenes')
      .update({ estado })
      .eq('id', ordenId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// =================== TRANSACCIONES ===================
export const transaccionesService = {
  // Crear registro de transacción
  async crearTransaccion(transaccionData) {
    const { data, error } = await supabase
      .from('transacciones_pago')
      .insert({
        orden_id: transaccionData.orden_id,
        webpay_token: transaccionData.webpay_token,
        webpay_buy_order: transaccionData.webpay_buy_order,
        webpay_session_id: transaccionData.webpay_session_id,
        webpay_amount: transaccionData.webpay_amount,
        estado: 'pendiente'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Actualizar transacción con respuesta de Webpay
  async actualizarConRespuesta(token, respuestaWebpay) {
    const { data, error } = await supabase
      .from('transacciones_pago')
      .update({
        webpay_vci: respuestaWebpay.vci,
        webpay_response_code: respuestaWebpay.response_code,
        webpay_transaction_date: respuestaWebpay.transaction_date,
        webpay_authorization_code: respuestaWebpay.authorization_code,
        webpay_payment_type_code: respuestaWebpay.payment_type_code,
        webpay_card_detail: JSON.stringify(respuestaWebpay.card_detail),
        estado: respuestaWebpay.response_code === 0 ? 'exitoso' : 'fallido',
        mensaje_error: respuestaWebpay.response_code !== 0 ? `Error código: ${respuestaWebpay.response_code}` : null
      })
      .eq('webpay_token', token)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Obtener transacción por token
  async getTransaccionPorToken(token) {
    const { data, error } = await supabase
      .from('transacciones_pago')
      .select('*')
      .eq('webpay_token', token)
      .single()

    if (error) throw error
    return data
  }
}

// =================== UTILIDADES ===================
export const utilidadesService = {
  // Generar número de orden único
  generarBuyOrder() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `CT-${timestamp}-${random}`
  },

  // Formatear precio chileno
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio)
  },

  // Formatear fecha en español
  formatearFecha(fecha) {
    if (!fecha) return 'No disponible'
    
    const fechaObj = new Date(fecha)
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fechaObj)
  },

  // Validar email
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  // Validar RUT chileno (opcional)
  validarRUT(rut) {
    // Implementación básica - puedes mejorarla
    if (!rut) return false
    const rutLimpio = rut.replace(/[^0-9kK]/g, '')
    return rutLimpio.length >= 8 && rutLimpio.length <= 9
  }
}