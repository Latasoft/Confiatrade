# 🚀 Deploy Frontend en Render - Paso a Paso

## Paso 1: Crear Cuenta en Render

1. Ve a https://render.com
2. Click en **"Get Started"**
3. Regístrate con GitHub (recomendado) o email

## Paso 2: Conectar Repositorio

1. En el dashboard de Render, click en **"New +"**
2. Selecciona **"Static Site"**
3. Click en **"Connect a repository"**
4. Autoriza a Render a acceder a tu GitHub
5. Busca y selecciona el repo: **`Latasoft/Confiatrade`**

## Paso 3: Configurar el Proyecto

Llena los campos así:

**Name:**

```
confiatrade-frontend
```

**Branch:**

```
main
```

**Root Directory:**

```
frontend
```

**Build Command:**

```
npm install && npm run build
```

**Publish Directory:**

```
dist
```

## Paso 4: Variables de Entorno

En la sección **"Environment Variables"**, agrega:

**Key:** `VITE_API_URL`  
**Value:** `http://localhost:8000/api/v1`

_(Cambiarás esto cuando tengas el backend en Railway)_

## Paso 5: Configurar Rewrites para SPA

En **"Advanced"** → **"Redirects/Rewrites"**, agrega:

**Source:** `/*`  
**Destination:** `/index.html`  
**Action:** `Rewrite`

## Paso 6: Deploy

1. Scroll hasta abajo
2. Click en **"Create Static Site"**
3. Render comenzará a construir automáticamente
4. Espera 3-5 minutos

## Paso 7: Obtener URL

Una vez completado el deploy, verás:

```
✓ Your site is live at https://confiatrade-frontend.onrender.com
```

## Paso 8: Verificar

1. Click en la URL generada
2. Deberías ver la aplicación funcionando
3. Navega por las diferentes secciones

## Paso 9: Compartir con el Cliente

Copia la URL y envía:

```
Estimado cliente,

Le comparto el demo del frontend de ConfíaTrade:

🔗 https://confiatrade-frontend.onrender.com

Puede navegar por todos los módulos para ver la estructura.
Los datos reales se cargarán una vez conectemos la base de datos.

Saludos,
Equipo Latasoft
```

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a la rama `main`, Render automáticamente:

1. Detecta los cambios
2. Construye el nuevo build
3. Despliega la nueva versión

---

## 🛠️ Troubleshooting

### Error: "Build failed"

- Verifica que el **Root Directory** sea `frontend`
- Asegúrate que el **Build Command** incluya `npm install`

### Error: "Routes don't work"

- Verifica que configuraste el Rewrite: `/* → /index.html`

### Error: "Environment variables not working"

- Asegúrate que la variable empiece con `VITE_`
- Haz un nuevo deploy manual (botón "Manual Deploy")

---

## ⚙️ Configuración Avanzada (Opcional)

### Custom Domain

1. Ve a **"Settings"** → **"Custom Domains"**
2. Agrega tu dominio: `app.confiatrade.com`
3. Sigue las instrucciones DNS

### Deploy Hooks

1. Ve a **"Settings"** → **"Deploy Hook"**
2. Crea un webhook para deploys manuales

---

## ✅ Checklist Final

- [ ] Cuenta de Render creada
- [ ] Repositorio conectado
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Variable `VITE_API_URL` configurada
- [ ] Rewrite `/* → /index.html` configurado
- [ ] Deploy completado exitosamente
- [ ] URL verificada en navegador
- [ ] URL compartida con cliente

---

**URL Final:** `https://confiatrade-frontend.onrender.com`

**Tiempo estimado:** 10 minutos
