# ConfíaTrade Frontend

Sistema de gestión de eventos B2B - Interfaz de usuario.

## 🚀 Despliegue en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. **Conectar con GitHub:**

   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Importa el repositorio `Latasoft/Confiatrade`
   - Selecciona la carpeta `frontend` como Root Directory

2. **Configuración del Proyecto:**

   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Variables de Entorno:**

   ```
   VITE_API_URL = https://tu-backend.railway.app/api/v1
   ```

4. **Deploy:**
   - Click en "Deploy"
   - Vercel construirá y desplegará automáticamente
   - URL de producción: `https://confiatrade.vercel.app`

### Opción 2: Deploy Manual (CLI)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Navegar al frontend
cd frontend

# Login a Vercel
vercel login

# Deploy a producción
vercel --prod

# Configurar variables de entorno
vercel env add VITE_API_URL production
# Ingresa: https://tu-backend.railway.app/api/v1
```

---

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# Abre: http://localhost:5173

# Build para producción (verifica que compile sin errores)
npm run build

# Preview del build de producción
npm run preview
```

---

## 📦 Build para Producción

```bash
# Generar build optimizado
npm run build

# Resultado en carpeta: frontend/dist/
# Archivos: index.html, assets/index-[hash].js, assets/index-[hash].css
```

---

## 🌍 Otras Plataformas de Deploy

### Netlify

1. **Deploy Manual:**

   ```bash
   npm install -g netlify-cli
   npm run build
   netlify deploy --prod --dir=dist
   ```

2. **Deploy Automático:**
   - Conecta repo en netlify.com
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend`

### GitHub Pages (No recomendado para apps con routing)

```bash
npm run build
# Copiar contenido de dist/ a gh-pages branch
```

### Railway

```bash
# railway.json en frontend/
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 🔧 Configuración para Producción

### Variables de Entorno

Crear archivo `.env.production`:

```env
VITE_API_URL=https://confiatrade-api.railway.app/api/v1
```

### Optimizaciones Aplicadas

- ✅ Code splitting automático (Vite)
- ✅ Tree shaking
- ✅ Minificación JS/CSS
- ✅ Compresión gzip/brotli (automática en Vercel)
- ✅ CSS purge (Tailwind automático)
- ✅ Lazy loading de componentes

---

## 📊 Tamaño del Bundle

```bash
npm run build

# Salida esperada:
# dist/index.html                   0.45 kB
# dist/assets/index-[hash].css     12.34 kB
# dist/assets/index-[hash].js     156.78 kB
```

---

## 🚨 Troubleshooting

### Error: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS en producción

- Verifica que el backend tenga el dominio de Vercel en `CORS_ORIGINS`
- Backend config.py: `CORS_ORIGINS=["https://confiatrade.vercel.app"]`

### Rutas no funcionan después del deploy

- Vercel: Crear `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Variables de entorno no funcionan

- Asegúrate de que empiecen con `VITE_`
- Reinicia el servidor de desarrollo
- En Vercel: Variables de entorno deben estar configuradas en el dashboard

---

## 📱 Preview del Demo

URL temporal para el cliente: `https://confiatrade-[hash].vercel.app`

**Credenciales de prueba (cuando backend esté listo):**

```
Usuario: admin@confiatrade.com
Password: demo123
```

---

## ✅ Checklist Pre-Deploy

- [ ] `npm run build` compila sin errores
- [ ] Variables de entorno configuradas (`.env`)
- [ ] API URL apunta al backend correcto
- [ ] Sin warnings de TypeScript
- [ ] Componentes críticos probados
- [ ] Sistema de notificaciones funciona
- [ ] Navegación entre rutas correcta

---

## 🔗 URLs Útiles

- **Frontend (Vercel)**: https://confiatrade.vercel.app
- **Backend (Railway)**: https://confiatrade-api.railway.app
- **Docs API**: https://confiatrade-api.railway.app/docs
- **GitHub Repo**: https://github.com/Latasoft/Confiatrade
