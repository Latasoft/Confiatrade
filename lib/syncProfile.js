// En el archivo lib/syncProfile.js
export async function syncProfile(user) {
  if (!user) return

  const { id, primaryEmailAddress, firstName, lastName, fullName } = user
  const email = primaryEmailAddress?.emailAddress || ''
  
  // Extraer nombre y apellido correctamente
  const nombre = firstName || fullName?.split(' ')[0] || ''
  const apellido = lastName || fullName?.split(' ').slice(1).join(' ') || ''

  console.log('🔄 Preparando sincronización:', { 
    clerk_id: id, 
    email, 
    firstName: nombre, 
    lastName: apellido 
  })

  try {
    const res = await fetch('/api/sync-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id,           // clerk_id
        email, 
        firstName: nombre, 
        lastName: apellido 
      }),
    })

    const data = await res.json()

    if (data.success) {
      console.log('✅ Perfil sincronizado en Supabase:', data.user)
    } else {
      console.error('❌ Error al sincronizar perfil:', data.error || 'Error desconocido')
      console.error('❌ Detalles:', data.details)
    }
  } catch (err) {
    console.error('❌ Error al llamar API sync-profile:', err)
  }
}
