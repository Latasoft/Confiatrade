# 🧪 TEST COMPLETO - CONFIATRADE
# Fecha: 10 de octubre de 2025
# Propósito: Verificar que todo el sistema funcione correctamente

## 📋 PREPARACIÓN DEL TEST

### ✅ 1. VERIFICAR SERVIDOR
- [ ] El servidor está corriendo en `http://localhost:3000`
- [ ] La terminal muestra "Ready" sin errores
- [ ] La consola del navegador no muestra errores críticos

### ✅ 2. VERIFICAR BASE DE DATOS
- [ ] Tabla `usuarios_roles` existe en Supabase
- [ ] Usuario admin por defecto existe: `admin@confiatrade.com`
- [ ] Credenciales de Supabase configuradas en `.env.local`

---

## 🧪 TEST 1: NAVEGACIÓN PÚBLICA (Sin autenticación)

### Páginas a probar:
1. **Página Principal**: `http://localhost:3000`
   - [ ] Se carga correctamente
   - [ ] Muestra el diseño glass morphism
   - [ ] Botones de Sign In/Sign Up visibles
   - [ ] No hay errores en consola

2. **Productos**: `http://localhost:3000/productos`
   - [ ] Se carga la página de productos
   - [ ] Lista de productos visible (si hay datos)
   - [ ] Diseño consistente

3. **Sobre Nosotros**: `http://localhost:3000/sobre-nosotros`
   - [ ] Página se carga correctamente
   - [ ] Contenido visible

4. **Cómo Funciona**: `http://localhost:3000/como-funciona`
   - [ ] Página se carga sin errores
   - [ ] Información visible

---

## 🧪 TEST 2: AUTENTICACIÓN CLIENTE

### Registro/Login como Cliente:
1. **Ir a Sign Up**: `http://localhost:3000/sign-up`
   - [ ] Formulario de registro visible
   - [ ] Campos funcionan correctamente

2. **Registrar nuevo cliente**:
   - Email: `testcliente@gmail.com`
   - Password: `testcliente123`
   - [ ] Registro exitoso
   - [ ] Redirección automática a página principal
   - [ ] Usuario aparece como "logueado"

3. **Verificar comportamiento cliente**:
   - [ ] **NO** es redirigido a `/admin`
   - [ ] Permanece en página principal (`/`)
   - [ ] Tiene acceso a todas las páginas públicas
   - [ ] En consola: "👤 Cliente permanece en página principal"

4. **Verificar en Supabase**:
   - [ ] Nuevo registro en tabla `usuarios_roles`
   - [ ] `email: testcliente@gmail.com`
   - [ ] `rol: cliente`
   - [ ] `activo: true`

---

## 🧪 TEST 3: AUTENTICACIÓN ADMIN

### Login como Admin:
1. **Cerrar sesión** (si está logueado)
   - [ ] Logout exitoso
   - [ ] Regresa a estado no autenticado

2. **Login como Admin**:
   - Email: `admin@confiatrade.com`
   - Password: `confiatrade123admin`
   - [ ] Login exitoso
   - [ ] **Redirección automática** a `/admin`
   - [ ] En consola: "🔄 Redirección automática desde: /"

3. **Verificar panel admin**:
   - URL: `http://localhost:3000/admin`
   - [ ] Panel de administración visible
   - [ ] Navbar de admin cargada
   - [ ] Opciones administrativas disponibles

4. **Probar secciones admin**:
   - `/admin/usuarios`: [ ] Se carga correctamente
   - `/admin/solicitudes`: [ ] Se carga correctamente
   - `/admin/crear`: [ ] Se carga correctamente

---

## 🧪 TEST 4: PROTECCIÓN DE RUTAS

### Verificar que las rutas están protegidas:
1. **Logout** y ir directamente a:
   - `http://localhost:3000/admin`
   - [ ] **Redirección automática** a `/sign-in`
   - [ ] No puede acceder sin autenticación

2. **Login como cliente** e ir a:
   - `http://localhost:3000/admin`
   - [ ] **Acceso denegado** o redirección
   - [ ] Solo admins pueden acceder

---

## 🧪 TEST 5: FUNCIONALIDADES CORE

### Verificar funciones principales:
1. **Sistema de roles**:
   - [ ] Admin detectado correctamente
   - [ ] Cliente detectado correctamente
   - [ ] Redirección automática funciona

2. **Base de datos**:
   - [ ] Usuarios se crean automáticamente
   - [ ] Roles se asignan correctamente
   - [ ] Conexión a Supabase estable

3. **Middleware**:
   - [ ] Protege rutas admin
   - [ ] Permite acceso público
   - [ ] Redirecciones funcionan

---

## 🧪 TEST 6: CONSOLA DEL NAVEGADOR

### Mensajes esperados (sin errores):
- ✅ `🌐 Accediendo a: /`
- ✅ `✅ Ruta pública permitida: /`
- ✅ `🔄 Redirección automática desde: /`
- ✅ `👤 Usuario: [Nombre] - Rol: [admin/cliente]`
- ✅ `✅ Nuevo usuario creado:` (para nuevos registros)

### Errores que NO deben aparecer:
- ❌ `404 (Not Found)` en usuarios_roles
- ❌ `406 (Not Acceptable)`
- ❌ `400 (Bad Request)`
- ❌ `Could not find the table 'usuarios_roles'`
- ❌ Errores de sintaxis SQL

---

## 📊 RESULTADO FINAL

### ✅ SISTEMA FUNCIONANDO CORRECTAMENTE SI:
- [ ] Todos los tests públicos pasan
- [ ] Autenticación funciona para admin y cliente
- [ ] Redirecciones automáticas funcionan
- [ ] Rutas están protegidas correctamente
- [ ] Base de datos se actualiza automáticamente
- [ ] No hay errores críticos en consola

### 🚨 SISTEMA TIENE PROBLEMAS SI:
- [ ] Errores 404/406/400 en consola
- [ ] Redirecciones no funcionan
- [ ] Admin no puede acceder a `/admin`
- [ ] Cliente es redirigido incorrectamente
- [ ] Usuarios no se crean en base de datos

---

## 🔧 COMANDOS ÚTILES PARA DEBUGGING

```bash
# Verificar servidor
npm run dev

# Ver logs en tiempo real (en otra terminal)
# Observar la consola del navegador F12

# Verificar tabla en Supabase
# SELECT * FROM usuarios_roles;

# Test de conexión API
# http://localhost:3000/api/verify-supabase
```

---

## 📝 NOTAS DE TESTING

**Credenciales de prueba:**
- Admin: `admin@confiatrade.com` / `confiatrade123admin`
- Cliente existente: `cliente@confiatrade.com` / `confiatrade123cliente`
- Cliente nuevo: `testcliente@gmail.com` / `testcliente123`

**URLs importantes:**
- Principal: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Login: `http://localhost:3000/sign-in`
- Registro: `http://localhost:3000/sign-up`

**Comportamiento esperado:**
- **Admin** → Redirección automática a `/admin`
- **Cliente** → Permanece en `/` con acceso a páginas públicas
- **No autenticado** → Redirección a `/sign-in` al intentar acceder a `/admin`