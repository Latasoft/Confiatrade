import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Obtener información del usuario desde Clerk
    const user = await clerkClient.users.getUser(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Extraer información relevante
    const userData = {
      id: user.id,
      nombre: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null,
      email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
      telefono: user.primaryPhoneNumber?.phoneNumber || user.phoneNumbers?.[0]?.phoneNumber,
      nombreCompleto: user.fullName,
      username: user.username
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    
    // Si es error de Clerk (usuario no encontrado), devolver info básica
    if (error.status === 404) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado en Clerk',
        id: userId,
        nombre: 'Usuario no disponible',
        email: 'No disponible'
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      id: userId,
      nombre: 'Error al cargar',
      email: 'Error al cargar'
    }, { status: 500 });
  }
}