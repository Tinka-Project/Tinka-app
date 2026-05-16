# Arkive - Acompañante Financiero Inteligente

Una aplicación móvil de finanzas personales diseñada con un enfoque Zen y empático, que traduce los números a lenguaje cotidiano y prioriza la empatía sobre la culpa.

## 🎨 Características de Diseño

### Paleta de Colores (Dark Mode)
- **Fondo principal**: `#0a0a0f` (Negro profundo)
- **Tarjetas**: `#131318` (Gris oscuro suave)
- **Acento/Warning**: `#ff9f43` (Naranja ámbar - NO rojo)
- **Éxito**: `#10b981` (Verde esmeralda)
- **Bordes**: `#2a2a35` (Gris sutil)

### Tipografía
- Sistema de fuentes nativo (SF Pro / Inter)
- Limpia, sans-serif y altamente legible
- Sin uso excesivo de negrita

## 📱 Flujo de la Aplicación

### 1. Onboarding (3 Pantallas)

#### Pantalla 1: Selección de Categorías
- Grid de categorías predefinidas con iconos
- Cambio de color al seleccionar
- Botón "Añadir categoría" personalizada
- Auto-generación de iconos según nombre

#### Pantalla 2: Configuración de Voz
- Animación de ondas de sonido
- Selector de idioma de entrada (español Bolivia, España, Latinoamérica, Chile)
- Demostración visual de la funcionalidad

#### Pantalla 3: Permisos de Notificaciones
- Explicación visual con ejemplos de notificaciones bancarias
- Opciones: "Omitir" o "Configurar"
- Integración futura con SMS bancarios

### 2. Dashboard Principal

#### Visualización de Columnas Dinámicas
Cada categoría se muestra como una columna vertical con 3 estados:

1. **Estado Saludable** (≤60%)
   - Barra de progreso normal
   - Sin indicadores adicionales

2. **Estado de Precaución** (>60%, ≤100%)
   - Línea punteada ARRIBA de la barra
   - Color amigable (no rojo)

3. **Estado Excedido** (>100%)
   - Línea punteada DEBAJO de la barra
   - Muestra monto excedido en la parte superior
   - Tono ámbar en lugar de rojo alarmista

#### Gestos Intuitivos
- **Mantener presionado + deslizar ABAJO**: Abre input para nueva transacción en esa categoría
- **Mantener presionado + deslizar ARRIBA**: Abre editor de presupuesto para esa categoría
- **Tap normal**: Abre vista detallada de la categoría

#### Botones de Acción
- **Izquierda (➕)**: Registro manual de transacción
- **Centro (🎤)**: Asistente de voz IA (botón grande y atractivo)
- **Derecha (📱)**: Demo de Widget de pantalla de bloqueo

### 3. Sistema de IA - "El Momento de la Verdad"

Cuando el usuario registra un gasto por voz, la IA proporciona:

#### 1. Traducción
"Esto equivale a 3 pasajes de micro"
- Convierte montos abstractos en referencias cotidianas
- Contextualizado a la realidad boliviana

#### 2. Proyección
"Si repites esto a diario, afectará tu meta de la semana"
- Muestra consecuencias futuras
- Sin juicio, solo información

#### 3. Intervención
Botones suaves para etiquetar:
- ¿Fue **Necesario** o **Impulso**?
- Retroalimentación para aprendizaje de patrones

### 4. Configuración

#### Presupuestos por Categoría
- Asignación de presupuesto mensual
- Selector de color personalizado
- Botones rápidos de montos comunes
- Alertas configurables (60%, 80%, 100%)

#### Gestión de Categorías
- Edición de categorías existentes
- Creación de nuevas categorías
- Cambio de iconos y colores

### 5. Widget de Pantalla de Bloqueo

#### Zero Friction - Registro en 2 Taps
1. **Campo numérico rápido**
2. **3 categorías más usadas** según hora del día
3. **Tap para confirmar**

#### Inteligencia Contextual
- Muestra categorías relevantes según la hora
- Ejemplo: "Desayuno" a las 8am, "Cena" a las 8pm
- Funciona sin internet (sincroniza después)

## 🎯 Principios de Diseño UX

### Atmósfera Zen
- Sin ruido visual
- Espacios respirables
- Animaciones fluidas con Motion (Framer Motion)
- Transiciones suaves y orgánicas

### Empatía sobre Culpa
- **NO se usa rojo** para presupuestos excedidos
- Tonos ámbar/naranja para alertas
- Lenguaje positivo y constructivo
- Preguntas en lugar de juicios

### Soft UI / Minimalismo Moderno
- Esquinas redondeadas generosas (rounded-3xl)
- Sombras sutiles
- Glassmorphism en algunos componentes
- Colores pastel con opacidad

## 🛠 Stack Tecnológico

- **React** 18.3.1
- **TypeScript**
- **Tailwind CSS** v4.1
- **Motion** (Framer Motion) 12.23.24 para animaciones
- **Lucide React** para iconografía
- **Radix UI** para componentes accesibles

## 📦 Componentes Principales

```
src/app/components/
├── OnboardingCategories.tsx    # Paso 1: Selección de categorías
├── OnboardingVoice.tsx          # Paso 2: Config de voz
├── OnboardingNotifications.tsx  # Paso 3: Permisos
├── Dashboard.tsx                # Vista principal con columnas
├── VoiceInput.tsx               # Input de voz IA
├── AddTransaction.tsx           # Formulario manual
├── SettingsPanel.tsx            # Configuración
├── LockScreenWidget.tsx         # Widget simulado
└── WidgetDemo.tsx               # Demo del widget
```

## 🎨 Tokens de Diseño

### Colores Primarios
```css
--background: #0a0a0f
--card: #131318
--warning: #ff9f43
--success: #10b981
--border: #2a2a35
```

### Radios
```css
rounded-xl: 12px
rounded-2xl: 16px
rounded-3xl: 24px
rounded-full: 9999px
```

## 🚀 Funcionalidades Implementadas

✅ Onboarding completo de 3 pasos
✅ Dashboard con columnas dinámicas
✅ Sistema de gestos (swipe up/down)
✅ Estados visuales de presupuesto (3 niveles)
✅ Entrada de voz con IA simulada
✅ Tarjeta de respuesta IA (Traducción + Proyección + Intervención)
✅ Configuración de presupuestos
✅ Gestión de categorías
✅ Widget de pantalla de bloqueo
✅ Animaciones fluidas con Motion
✅ Dark mode completo
✅ Mobile-first responsive design
✅ Colores empáticos (ámbar en lugar de rojo)

## 💡 Próximas Mejoras (No Implementadas)

- Integración real con reconocimiento de voz
- Lectura de comprobantes/SMS bancarios
- Machine learning para patrones de gasto
- Notificaciones push inteligentes
- Exportación de datos (CSV)
- Gráficos de tendencias
- Modo offline completo
- Sincronización multi-dispositivo

## 🎯 Filosofía del Producto

> "No es un banco, no es un contador, no es un juez. Es un acompañante que traduce, proyecta y pregunta, justo cuando más importa."

Arkive no busca controlar tus finanzas, sino ayudarte a entenderlas en tus propios términos, sin ansiedad ni culpa.

---

**Diseñado para**: Jóvenes trabajadores y freelancers en Bolivia
**Propósito**: Acompañamiento financiero, no control rígido
**Diferenciador**: Intervención ANTES del gasto, con empatía
