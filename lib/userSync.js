// lib/userSync.js
// Utilidades para sincronizar usuarios entre Clerk y Supabase

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Crear o actualizar usuario en Supabase cuando se registra en Clerk
export async function syncUserFromClerk(clerkUser) {
  try {
    const userData = {
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      nombre: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuario',
      rol: 'cliente', // Por defecto todos son clientes
      activo: true
    };

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios_roles')
      .select('*')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (existingUser) {
      // Actualizar usuario existente
      const { data, error } = await supabase
        .from('usuarios_roles')
        .update(userData)
        .eq('clerk_id', clerkUser.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Crear nuevo usuario
      const { data, error } = await supabase
        .from('usuarios_roles')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error sincronizando usuario:', error);
    throw error;
  }
}

// Obtener usuario de Supabase por Clerk ID
export async function getUserByClerkId(clerkId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
}

// Hook para obtener el usuario actual de Supabase
export function useCurrentUser(clerkUser) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!clerkUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        let userData = await getUserByClerkId(clerkUser.id);
        
        // Si no existe, crear el usuario
        if (!userData) {
          userData = await syncUserFromClerk(clerkUser);
        }

        setUser(userData);
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [clerkUser]);

  return { user, loading };
}