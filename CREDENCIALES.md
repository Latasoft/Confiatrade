# 👥 Credenciales de Usuario - ConfiaTrade

## 🔐 Credenciales para Testing

### Administrador
- **Email:** `admin@confiatrade.com`
- **Password:** `confiatrade123admin`
- **Rol:** Admin
- **Acceso:** Panel administrativo completo

### Cliente
- **Email:** `cliente@confiatrade.com`
- **Password:** `confiatrade123cliente`
- **Rol:** Cliente
- **Acceso:** Panel de cliente

## 📝 Instrucciones de Uso

### 1. Configurar Base de Datos
Ejecuta el script SQL en Supabase:
```sql
-- Archivo: lib/database/usuarios-con-roles.sql
```

### 2. Crear Cuentas en Clerk
1. Ve a https://dashboard.clerk.com
2. Crea las cuentas con los emails mencionados arriba
3. Los roles se asignarán automáticamente según el email

### 3. Sistema de Roles Automático
- **admin@confiatrade.com** → Redirige automáticamente a `/admin`
- **cliente@confiatrade.com** → Redirige automáticamente a `/cliente`

### 4. Protección de Rutas
- ✅ **Rutas Admin:** Solo accesibles con rol `admin`
- ✅ **Rutas Cliente:** Solo accesibles con rol `cliente`
- ✅ **Redirección Automática:** Según el rol del usuario
- ✅ **Bloqueo Cruzado:** Admin no puede acceder a cliente y viceversa

## 🔄 Flujo de Autenticación

```
1. Usuario inicia sesión
   ↓
2. Sistema verifica rol en BD
   ↓
3. Redirección automática:
   - admin@confiatrade.com → /admin
   - cliente@confiatrade.com → /cliente
   ↓
4. Protección de rutas activa
```

## 🛡️ Seguridad Implementada

- **Row Level Security (RLS)** en Supabase
- **Protección de rutas** en frontend
- **Verificación de roles** en cada navegación
- **Bloqueo automático** de acceso no autorizado

## 📧 Emails Adicionales de Admin
Para agregar más admins, edita el archivo:
`lib/useUserRole.js` → función `determinarRolPorEmail()`

```javascript
const adminEmails = [
  'admin@confiatrade.com',
  'administrador@confiatrade.com',
  'tu-email@ejemplo.com' // Agregar aquí
]
```