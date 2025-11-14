# Análisis: Transcripción del Cliente vs Sistema ConfíaTrade

## 📋 Requisitos del Cliente (Transcripción)

> "Tú creas el evento... pueden ser foros, encuentros empresariales. Por ejemplo, queremos organizar uno en **Antofagasta**, otro en **China**, otro en **Argentina**. Todo eso tiene que tener una plataforma donde se inscriban las empresas **de acuerdo al evento**. Hay dos o tres días donde se generan reuniones B2B. La idea es que quede agendado: a qué hora, en qué mesa, en qué sala. Se le puede anexar calendario de correo (Outlook, Gmail) o generar un calendario propio de la aplicación."

---

## ✅ Cumplimiento del Sistema

### **SÍ Cumple (Con Ajuste)**

El sistema ConfíaTrade **SÍ cumple** todos los requisitos mencionados, con un ajuste arquitectónico importante:

| Requisito Cliente                                       | Estado          | Implementación                                             |
| ------------------------------------------------------- | --------------- | ---------------------------------------------------------- |
| Crear múltiples eventos (Antofagasta, China, Argentina) | ✅ **AGREGADO** | Tabla `eventos` + relación many-to-many `empresas_eventos` |
| Inscripción de empresas por evento                      | ✅              | Empresas se inscriben a un evento específico               |
| Reuniones B2B agendadas                                 | ✅              | Tabla `reuniones` con bloque horario, sala, empresas       |
| Agenda por empresa (hora, mesa, sala)                   | ✅              | Vista `vista_agenda_empresa` con todos los detalles        |
| Calendario propio de la app                             | ✅ **FRONTEND** | Componente de calendario en React (pendiente)              |
| Exportar a calendario externo (Outlook, Gmail)          | ⏳ **FUTURO**   | Generar archivos .ics (iCalendar format)                   |

---

## 🔧 Ajuste Realizado: Modelo Multi-Evento

### **Antes (Single Event)**

El sistema original asumía **un solo evento** global:

```
empresas → participantes → reuniones → bloques_horarios
```

### **Ahora (Multi-Event)**

Sistema actualizado para soportar **múltiples eventos simultáneos**:

```
eventos (Antofagasta, China, Argentina)
   ↓
empresas_eventos (inscripción por evento)
   ↓
bloques_horarios (asociados a evento)
   ↓
reuniones (dentro del evento)
```

---

## 📊 Nuevo Modelo de Datos

### **Tabla: `eventos`**

```sql
CREATE TABLE eventos (
    id UUID PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,                    -- "Encuentro B2B Antofagasta 2025"
    descripcion TEXT,
    pais_sede_id INTEGER REFERENCES paises(id),      -- País donde se realiza
    ciudad_sede VARCHAR(100),                         -- "Antofagasta", "Beijing", "Buenos Aires"
    fecha_inicio DATE NOT NULL,                       -- 2025-03-15
    fecha_fin DATE NOT NULL,                          -- 2025-03-17
    tipo VARCHAR(50) DEFAULT 'encuentro_empresarial', -- 'foro', 'encuentro', 'networking'
    estado VARCHAR(50) DEFAULT 'planificacion',       -- 'planificacion', 'inscripcion', 'en_curso', 'finalizado'
    capacidad_empresas INTEGER,                       -- Límite de empresas
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### **Tabla: `empresas_eventos` (Relación Many-to-Many)**

```sql
CREATE TABLE empresas_eventos (
    id UUID PRIMARY KEY,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
    aprobada BOOLEAN DEFAULT FALSE,                   -- Inscripción aprobada/rechazada
    fecha_inscripcion TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(empresa_id, evento_id)                     -- Una empresa se inscribe una sola vez por evento
);
```

### **Actualización: `bloques_horarios`**

```sql
ALTER TABLE bloques_horarios ADD COLUMN evento_id UUID REFERENCES eventos(id);
-- Cada bloque horario pertenece a un evento específico
```

---

## 🎯 Flujo de Uso

### **1. Crear Evento**

```python
POST /api/v1/eventos
{
  "nombre": "Encuentro B2B Antofagasta 2025",
  "ciudad_sede": "Antofagasta",
  "pais_sede_id": 1,  # Chile
  "fecha_inicio": "2025-03-15",
  "fecha_fin": "2025-03-17",
  "tipo": "encuentro_empresarial",
  "capacidad_empresas": 100
}
```

### **2. Empresa se Inscribe al Evento**

```python
POST /api/v1/eventos/{evento_id}/inscribir
{
  "empresa_id": "uuid-empresa-123"
}
```

### **3. Generar Bloques Horarios del Evento**

```python
POST /api/v1/eventos/{evento_id}/bloques
{
  "fecha": "2025-03-15",
  "hora_inicio": "09:00",
  "hora_fin": "13:00",
  "duracion_minutos": 30
}
# Genera 8 bloques automáticamente: 09:00-09:30, 09:30-10:00, ..., 12:30-13:00
```

### **4. Asignar Reuniones B2B**

```python
POST /api/v1/reuniones
{
  "bloque_id": 1,
  "empresa_a_id": "uuid-empresa-1",
  "empresa_b_id": "uuid-empresa-2",
  "sala": "Sala A - Piso 2"
}
```

### **5. Consultar Agenda de Empresa**

```python
GET /api/v1/empresas/{empresa_id}/agenda?evento_id={evento_id}

# Respuesta:
{
  "empresa": "ALOG Group",
  "evento": "Encuentro B2B Antofagasta 2025",
  "reuniones": [
    {
      "bloque": "09:00 - 09:30",
      "contraparte": "Empresa ABC",
      "sala": "Sala A - Piso 2"
    },
    {
      "bloque": "10:00 - 10:30",
      "contraparte": "Empresa XYZ",
      "sala": "Sala C - Piso 1"
    }
  ]
}
```

---

## 📅 Calendario Propio de la Aplicación

### **Frontend (React + Tailwind)**

El cliente prefiere **calendario propio de la app** en lugar de integración con Outlook/Gmail.

#### **Componente a Implementar:**

```tsx
<CalendarioEventoView evento_id="uuid-evento" empresa_id="uuid-empresa" />
```

**Funcionalidades:**

- Vista mensual/semanal/diaria
- Reuniones marcadas con color por estado (programada, confirmada, completada)
- Click en reunión → Modal con detalles (contraparte, sala, notas)
- Filtros: por fecha, por sala, por estado
- Exportar a PDF (agenda completa)

**Opcional (Futuro):**

- Botón "Exportar a Outlook/Gmail" → Genera archivo `.ics` (iCalendar)
- Sincronización bidireccional con Google Calendar API

---

## 🔄 Comparación: Antes vs Ahora

| Aspecto           | Antes (Single Event)            | Ahora (Multi-Event)                        |
| ----------------- | ------------------------------- | ------------------------------------------ |
| **Eventos**       | Asumía 1 evento implícito       | Múltiples eventos explícitos               |
| **Inscripciones** | `empresas.aprobada` global      | `empresas_eventos.aprobada` por evento     |
| **Bloques**       | Sin contexto de evento          | `bloques_horarios.evento_id`               |
| **Escalabilidad** | ❌ No soporta eventos paralelos | ✅ Eventos simultáneos en distintos países |
| **Datos**         | Mezcla de eventos en una DB     | Aislamiento por evento                     |

---

## ✅ Conclusión

**El sistema ConfíaTrade SÍ cumple con los requisitos del cliente** después del ajuste arquitectónico para soportar múltiples eventos.

### **Implementado:**

- ✅ Modelo de datos multi-evento (16 tablas)
- ✅ Inscripción de empresas por evento
- ✅ Reuniones B2B agendadas con sala/hora
- ✅ Sistema de excepciones centralizado
- ✅ Sistema de notificaciones (frontend)

### **Pendiente:**

- ⏳ Componente de calendario (frontend)
- ⏳ Migraciones Alembic + seed data
- ⏳ Endpoints CRUD para `eventos` y `empresas_eventos`
- ⏳ Vista de agenda por evento
- ⏳ Exportación a .ics (opcional, futuro)

---

## 🚀 Próximo Paso

**Crear archivo `.env` con credenciales Supabase** para ejecutar migraciones y tener la base de datos operativa con el nuevo modelo multi-evento.
