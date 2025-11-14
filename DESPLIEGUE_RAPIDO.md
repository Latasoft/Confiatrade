# 🚀 Despliegue Rápido del Frontend (Demo para Cliente)

## Opción 1: Vercel (Más Rápido - Recomendado)

### Paso 1: Crear cuenta en Vercel

1. Ve a https://vercel.com/signup
2. Conecta con GitHub

### Paso 2: Importar Proyecto

1. Click en **"Add New Project"**
2. Busca el repositorio: `Latasoft/Confiatrade`
3. Click en **"Import"**

### Paso 3: Configurar

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Paso 4: Variables de Entorno

En la sección "Environment Variables", agrega:

```
VITE_API_URL = http://localhost:8000/api/v1
```

_(Cambia esto cuando tengas el backend en Railway)_

### Paso 5: Deploy

- Click en **"Deploy"**
- Espera 2-3 minutos
- URL generada: `https://confiatrade-[tu-usuario].vercel.app`

---

## Opción 2: Netlify

### Deploy con Drag & Drop (Sin Git)

1. **Build local:**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy manual:**
   - Ve a https://app.netlify.com/drop
   - Arrastra la carpeta `frontend/dist/` al navegador
   - URL generada: `https://random-name-123456.netlify.app`

### Deploy automático (Con Git)

1. Ve a https://app.netlify.com/start
2. Conecta GitHub
3. Selecciona el repo `Confiatrade`
4. Configuración:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. Variables de entorno:
   ```
   VITE_API_URL = http://localhost:8000/api/v1
   ```

---

## Opción 3: GitHub Pages (Solo para ver sin backend)

```bash
cd frontend
npm run build

# Copiar contenido de dist/ a una rama gh-pages
# O usar gh-pages package:
npm install -g gh-pages
gh-pages -d dist
```

URL: `https://latasoft.github.io/Confiatrade/`

---

## 🔧 Si Solo Quieres Probarlo Local

```bash
cd frontend

# Instalar dependencias
npm install

# Modo desarrollo (con hot reload)
npm run dev
# Abre: http://localhost:5173

# O ver el build de producción
npm run build
npm run preview
# Abre: http://localhost:4173
```

---

## 📱 Compartir con el Cliente

### Opción A: URL Pública (Vercel/Netlify)

```
Enviar al cliente:
https://confiatrade.vercel.app

"Estimado cliente, puede revisar el demo en este enlace.
Nota: El backend aún no está conectado, por lo que los datos
son de prueba local."
```

### Opción B: Localhost + Túnel (Ngrok)

```bash
# Terminal 1: Iniciar frontend
cd frontend
npm run dev

# Terminal 2: Exponer con ngrok
npx ngrok http 5173

# URL generada: https://abc123.ngrok-free.app
# Enviar esta URL al cliente (válida por 2 horas)
```

---

## ✅ Verificación Pre-Demo

- [x] Build compila sin errores (`npm run build`)
- [x] Sistema de notificaciones funciona
- [x] Navegación entre rutas correcta
- [x] Componentes visuales se ven bien
- [ ] Backend conectado (pendiente de Supabase)

---

## 🎨 Aspecto Visual del Demo

El cliente verá:

- ✅ Navbar con navegación (Empresas, Participantes, Curaduría, Agenda, etc.)
- ✅ Página de empresas (vacía, esperando backend)
- ✅ Sistema de notificaciones (toast azul)
- ✅ Diseño profesional azul/blanco
- ⚠️ Sin datos reales (backend pendiente)

---

## 🔗 URLs del Proyecto

- **Frontend Demo**: https://confiatrade.vercel.app (después del deploy)
- **GitHub Repo**: https://github.com/Latasoft/Confiatrade
- **Documentación**: Ver `DEPLOY.md` para detalles completos
