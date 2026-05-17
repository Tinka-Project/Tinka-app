# PLAN MAESTRO — Tinka Digital MVP
## Hackathon CochaTech 2026 | Banco FIE | Categoría Fintech

---

## 1. Análisis del Estado Actual

### Base implementada (Arkive/MONAI)
| Componente | Estado | Notas |
|---|---|---|
| Onboarding 3 pasos | ✅ Existe | Orientado a finanzas personales, debe adaptarse |
| Dashboard con columnas de categorías | ✅ Existe | Paradigma de presupuesto, no de ventas |
| VoiceInput simulado | ✅ Existe | Funciona, necesita adaptación al flujo de ventas |
| AddTransaction | ✅ Existe | Campos genéricos, necesita campos de venta |
| SettingsPanel | ✅ Existe | Requiere adaptación |
| LockScreenWidget / WidgetDemo | ✅ Existe | Reutilizable |
| Login | ❌ Falta | Prioridad alta |
| Bottom Navigation Bar | ❌ Falta | Prioridad alta |
| Módulo QR Banco FIE | ❌ Falta | Diferenciador clave |
| Reportes con gráficos | ❌ Falta | Recharts ya instalado |
| Historial de transacciones detallado | ❌ Falta | |
| Sincronización BancaMovil FIE | ❌ Falta | Simulado |
| Gestión de Proveedores | ❌ Falta | |
| Dashboard BI + Insights IA | ❌ Falta | |
| Tinka Score + Gamificación | ❌ Falta | Diferenciador clave |
| Contexto global (React Context) | ❌ Falta | Arquitectura requerida |
| PWA / Offline / Service Worker | ❌ Falta | |

### Stack disponible (ya instalado)
- React 18.3.1 + TypeScript
- Tailwind CSS v4.1
- Motion (Framer Motion) 12.23.24
- Lucide React 0.487.0
- Recharts 2.15.2
- Radix UI (completo)
- Sonner (toasts)
- React Hook Form 7.55.0
- Date-fns 3.6.0
- Canvas Confetti 1.9.4
- React Router 7.13.0

---

## 2. Paradigma Shift: Finanzas Personales → Herramienta para Emprendedores

### El problema original del hackathon
Los emprendedores de la comunidad Tinka de Banco FIE registran ventas en cuadernos. Necesitan:
- Registrar cada venta (producto, monto, método de pago, ubicación, fecha)
- Gestión de usuario privado y seguro
- Reportes por período (día/semana/mes), por método de pago, con gráficos

### Adaptación conceptual
| Concepto Base (Arkive) | → | Concepto Nuevo (Tinka Digital) |
|---|---|---|
| Categoría de gasto | → | Categoría de producto / tipo de venta |
| Presupuesto mensual | → | Meta de ventas mensual |
| Transacción (gasto) | → | Venta registrada |
| Balance personal | → | Total recaudado |
| Budget tracking (columnas) | → | Sales tracking por categoría de producto |
| Gastos = rojo | → | Ventas = verde, Costos/proveedores = naranja |

---

## 3. Sistema de Diseño

### Paleta de Colores (Dark Mode — Banco FIE Branding)
```css
--bg-primary:    #09090b   /* Negro profundo */
--bg-card:       #18181b   /* Gris oscuro premium */
--bg-elevated:   #27272a   /* Superficies elevadas */
--accent:        #d946ef   /* Magenta FIE — botones CTA, estados activos */
--accent-dim:    #a21caf   /* Magenta oscuro — hovers */
--success:       #10b981   /* Verde esmeralda — ventas/ingresos */
--warning:       #f59e0b   /* Ámbar — alertas suaves */
--danger:        #ef4444   /* Rojo — solo para costos/egresos */
--border:        #3f3f46   /* Bordes sutiles */
--text-primary:  #fafafa   /* Texto principal */
--text-muted:    #a1a1aa   /* Texto secundario */
--gradient-cta:  linear-gradient(135deg, #d946ef, #9333ea)  /* Gradiente magenta-violeta */
```

### Tipografía
- Sistema nativo: SF Pro / Inter / sans-serif
- Totales: `text-5xl font-bold` (como referencia Moni app)
- Títulos de sección: `text-lg font-semibold`
- Body: `text-sm` con `text-muted`

### Radios y Espaciado
- Cards: `rounded-2xl` (16px)
- Modales/Sheets: `rounded-t-3xl` (24px top)
- Botones: `rounded-full` para FAB, `rounded-xl` para acciones
- Padding de pantalla: `px-5`

### Principios UX (de las imágenes de referencia)
- Números grandes y legibles para totales de ventas
- Iconos emoji para categorías de productos (informal, amigable)
- Bottom sheet para acciones (no modales centrados)
- FAB de micrófono flotante (coral/magenta) — principal acción
- Bottom nav limpio con 4-5 íconos
- Light form sheets para ingreso de datos (fondo claro sobre dark)
- Voice recording: pantalla full con gradiente de color

---

## 4. Arquitectura de Componentes

### Estructura de carpetas objetivo
```
src/
├── app/
│   ├── App.tsx                          (MODIFICAR — routing + auth flow)
│   ├── contexts/
│   │   └── AppContext.tsx               (CREAR — estado global)
│   ├── hooks/
│   │   ├── useOfflineDetection.ts       (CREAR)
│   │   └── useSalesData.ts             (CREAR)
│   ├── services/
│   │   └── dataService.ts              (CREAR — LocalStorage manager)
│   ├── utils/
│   │   ├── currency.ts                  (EXISTE — adaptar a Bs.)
│   │   ├── score.ts                     (CREAR — Tinka Score)
│   │   └── mockData.ts                 (CREAR — datos demo)
│   └── components/
│       ├── ui/                          (EXISTE — no tocar)
│       ├── auth/
│       │   └── LoginScreen.tsx          (CREAR)
│       ├── layout/
│       │   ├── BottomNav.tsx            (CREAR)
│       │   ├── StatusBar.tsx            (CREAR — online/offline badge)
│       │   └── PWAInstallBanner.tsx     (CREAR)
│       ├── onboarding/
│       │   ├── OnboardingCategories.tsx (MODIFICAR — categorías de productos)
│       │   ├── OnboardingVoice.tsx      (MODIFICAR — adaptar texto)
│       │   └── OnboardingNotifications.tsx (EXISTS — mínimos cambios)
│       ├── dashboard/
│       │   ├── Dashboard.tsx            (MODIFICAR — sales-focused)
│       │   ├── SalesSummaryCard.tsx     (CREAR)
│       │   ├── PaymentMethodBadges.tsx  (CREAR)
│       │   └── RecentSalesList.tsx      (CREAR)
│       ├── sales/
│       │   ├── VoiceInput.tsx           (MODIFICAR — flujo de ventas)
│       │   ├── SaleConfirmModal.tsx     (CREAR — bottom sheet)
│       │   └── AddSaleForm.tsx          (CREAR/REFACTOR de AddTransaction)
│       ├── qr/
│       │   └── QRPaymentModal.tsx       (CREAR)
│       ├── history/
│       │   └── TransactionHistory.tsx   (CREAR)
│       ├── reports/
│       │   └── ReportsView.tsx          (CREAR — con Recharts)
│       ├── banksync/
│       │   └── BankSyncModule.tsx       (CREAR)
│       ├── suppliers/
│       │   ├── SupplierList.tsx         (CREAR)
│       │   └── SupplierEvalForm.tsx     (CREAR)
│       ├── bi/
│       │   └── BIInsights.tsx           (CREAR)
│       ├── gamification/
│       │   ├── TinkaScore.tsx           (CREAR)
│       │   └── BadgesGallery.tsx        (CREAR)
│       └── settings/
│           └── SettingsPanel.tsx        (MODIFICAR)
```

### Modelo de datos (TypeScript interfaces)
```typescript
interface Sale {
  id: string;
  product: string;
  amount: number;           // en Bs.
  paymentMethod: 'cash' | 'qr' | 'transfer' | 'card';
  location: 'store' | 'fair' | 'delivery' | 'online';
  category: string;
  date: Date;
  autoDetected?: boolean;   // desde BancaMovil
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  tinkaScore: number;
  lastEvaluation?: Date;
}

interface User {
  name: string;
  email: string;
  tinkaScore: number;
  level: 'bronce' | 'plata' | 'oro' | 'diamante';
  badges: string[];
  monthlySalesGoal: number;
}
```

---

## 5. Fases de Implementación

### FASE 0 — Fundación (Prioridad Crítica)
**Objetivo**: Arquitectura base funcional antes de construir módulos

| Tarea | Archivo | Descripción |
|---|---|---|
| 0.1 | `AppContext.tsx` | Contexto global: user, sales[], suppliers[], settings |
| 0.2 | `dataService.ts` | CRUD en LocalStorage + datos mock de demo |
| 0.3 | `currency.ts` | Adaptar a Bolivianos (Bs.) |
| 0.4 | `App.tsx` | Routing: login → onboarding → main app con bottom nav |

---

### FASE 1 — Login + Onboarding Adaptado (Prioridad Alta)
**Objetivo**: Primera impresión impactante para el jurado

#### LoginScreen.tsx
- Branding Banco FIE: logo + "Comunidad Tinka" 
- Email/Password con `focus:ring-accent`
- Switch "Acceso Biométrico" (simulado con FaceID icon)
- Spinner magenta en validación
- PWAInstallBanner flotante (slide desde arriba)

#### OnboardingCategories.tsx (adaptar)
- Cambiar de categorías de gasto a **categorías de productos**
- Ejemplos: Artesanía 🧶, Textiles 👗, Alimentos 🍽️, Tecnología 💻, Servicios 🔧
- Mismo grid visual, misma UX — solo el contexto cambia

#### OnboardingVoice.tsx (adaptar)
- Texto: "Registra tus ventas con tu voz"
- Ejemplo: "Vendí 2 billeteras de cuero a 150 Bs por QR en la feria"

---

### FASE 2 — Dashboard Principal Rediseñado (Prioridad Alta)
**Objetivo**: Vista central orientada a ventas, no a presupuesto

#### Dashboard.tsx (refactor)
```
┌─────────────────────────────────┐
│  StatusBar (online/offline)     │
│  ¡Hola, Doña María! [Tinka 🏅] │
├─────────────────────────────────┤
│  VENTAS HOY                     │
│  + 1,250 Bs    ▲ 18% vs ayer   │
│  [- 320 Bs costos] [+1,570 Bs] │
├─────────────────────────────────┤
│  Métodos de pago hoy:           │
│  💵 Efectivo  📱 QR  🏦 Transfer│
├─────────────────────────────────┤
│  Categorías de Ventas (columnas)│
│  🧶 Artes   👗 Textil  🍽️ Food │
│  [420 Bs]   [580 Bs]  [250 Bs] │
├─────────────────────────────────┤
│  Ventas recientes (lista)       │
│  ────────────────────────────  │
│  🧶 Billetera cuero  150 Bs QR │
│  👗 Pollera  320 Bs Efectivo   │
├─────────────────────────────────┤
│        [ 🎤 FAB Magenta ]       │
└─────────────────────────────────┘
```

**Componentes del dashboard:**
- `SalesSummaryCard`: Total del día con comparativa ayer/semana/mes
- `PaymentMethodBadges`: Pills con totales por método (Efectivo, QR, Transferencia)
- Las columnas de categorías → ventas por categoría de producto (no presupuesto)
- `RecentSalesList`: Últimas 5 ventas con icono, producto, monto, método

---

### FASE 3 — Flujo de Registro de Venta (Prioridad Alta)
**Objetivo**: Núcleo del producto — que sea fluido y wow

#### VoiceInput.tsx (adaptar)
- Pantalla full con gradiente magenta (`from-purple-900 to-fuchsia-900`)
- "Escuchando tu venta..." con ondas de audio animadas
- Placeholder: *"Vendí 2 billeteras a 150 Bs por QR en la feria..."*
- Al detener → dispara `SaleConfirmModal`

#### SaleConfirmModal.tsx (NUEVO — bottom sheet)
- Bottom sheet estilo iOS (vaul ya instalado)
- Campos pre-llenados por la IA simulada:
  - 🏷️ Producto/Servicio (con autocompletado de frecuentes)
  - 💰 Monto (Bs.) con formato automático
  - 💳 Método de pago (Efectivo | QR | Transferencia | Tarjeta) — iconos
  - 📍 Ubicación (Tienda | Feria | Delivery | Online)
  - 🏷️ Categoría (dropdown con iconos)
- Si QR seleccionado → trigger `QRPaymentModal` al confirmar
- Botón "Confirmar Venta" magenta con animación de escala

#### AddSaleForm.tsx (refactor de AddTransaction)
- Para registro manual (botón + en bottom nav)
- Mismos campos que SaleConfirmModal
- Validación con react-hook-form

---

### FASE 4 — Módulo QR Banco FIE (Prioridad Alta — Diferenciador)
**Objetivo**: El módulo más impresionante para el jurado de Banco FIE

#### QRPaymentModal.tsx
- Modal full-screen con branding FIE
- Animación skeleton/loader con colores FIE
- QR generado (simulado con div estilizado o qrcode.react)
- Monto en `text-5xl font-bold text-success`
- Timer regresivo 5:00 → 0:00 (expiración del QR)
- Botón "Compartir por WhatsApp" (Web Share API)
- Simulación webhook: después de 8 segundos → confetti + checkmark animado (canvas-confetti)

---

### FASE 5 — Historial de Transacciones (Prioridad Media-Alta)
#### TransactionHistory.tsx
- Lista con scroll infinito simulado
- Cada item: icono método pago + producto + monto + ubicación + timestamp
- Badge "Auto-detectado 🤖" para ventas de BancaMovil
- Filtros: tipo (venta/costo), método, categoría, rango de fechas
- Swipe para eliminar (Motion gesture)
- Pull-to-refresh animado

---

### FASE 6 — Reportes y Analítica (Prioridad Media-Alta)
#### ReportsView.tsx (con Recharts)

**Tarjetas de resumen:**
```
[Total Hoy ▲18%] [Semana +2,840Bs] [# Transacciones] [Método Top]
```

**Gráfico 1 — Evolución de Ingresos:**
- LineChart con línea magenta sobre fondo oscuro
- Selectores: [Hoy] [Semana] [Mes] [Rango]
- Tooltip personalizado con datos exactos

**Gráfico 2 — Métodos de Pago:**
- PieChart o BarChart horizontal
- Efectivo % | QR % | Transferencia % | Tarjeta %
- Animación de entrada fade-in + scale

**Gráfico 3 — Ventas por Categoría:**
- BarChart apilado por categoría de producto
- Colores por categoría con leyenda

**Historial dinámico:**
- Misma lista de TransactionHistory con filtros de fecha

---

### FASE 7 — Sincronización BancaMovil FIE (Prioridad Media)
#### BankSyncModule.tsx (simulado)
- Card en dashboard: "🔗 Conectado a BancaMovil FIE" + timestamp
- Botón "Re-sincronizar Ahora" con spinner magenta
- Toast simulado cada 30 segundos: "💰 Nuevo ingreso detectado: +150 Bs"
- Modal de clasificación: "¿Este gasto es Materia Prima o Servicios?"
- Badge "Auto-detectado 🤖" en transacciones detectadas

---

### FASE 8 — Gestión de Proveedores (Prioridad Media)
#### SupplierList.tsx
- Cards con avatar, nombre, categoría, Tinka Score (0-100)
- Filtros por categoría y rating
- Historial de pedidos por proveedor

#### SupplierEvalForm.tsx (bottom sheet mensual)
- ⭐ Rating general (1-5 estrellas animadas)
- ⏱️ Tiempo de entrega (días)
- 💰 Costo (Muy caro / Justo / Económico)
- 📦 Calidad del producto (1-5)
- 🤝 Atención al cliente (1-5)
- 📝 Notas adicionales
- Progress bar de completitud, botón magenta

---

### FASE 9 — BI e Insights IA (Prioridad Media)
#### BIInsights.tsx
- KPIs predictivos:
  - "📈 Proyección: alcanzarás X,XXX Bs este mes"
  - "🌟 Producto estrella: Billetera de Cuero (65% margen)"
  - "🕐 Vendes más los Sábados entre 10am-2pm"
- Tarjetas accionables con recomendaciones (datos mock + lógica real sobre ventas registradas)
- Heatmap de días/horas de mayor venta (SVG custom)
- Segmentación: clientes recurrentes vs nuevos (simulado)
- Exportar reporte PDF/WhatsApp (modal con preview)

---

### FASE 10 — Gamificación Tinka Score (Prioridad Alta — Diferenciador)
#### TinkaScore.tsx
- Anillo circular de progreso (SVG animado) con gradiente magenta
- Nivel: Bronce → Plata → Oro → Diamante
- Factores del score (tooltip):
  - Consistencia en registros ✅
  - Uso de métodos digitales ✅
  - Evaluaciones de proveedores completadas ✅
  - Metas de venta alcanzadas ✅

#### BadgesGallery.tsx
- "Primera Venta Registrada 🎯"
- "Racha de 7 Días 🔥"
- "100 Ventas Completadas 💯"
- "Proveedor Evaluado 📝"
- "Meta Mensual Alcanzada 🏆"
- Animación de desbloqueo con confetti (canvas-confetti)

#### MicrocreditCard.tsx
- Banner Apple Card style con degradado premium
- "🎉 Microcrédito Tinka pre-aprobado: 5,000 Bs"
- CTA "Solicitar Ahora" con formulario simulado

---

### FASE 11 — PWA & Offline (Prioridad Media)
- PWAInstallBanner: slide-down desde arriba con botón "Añadir a inicio"
- StatusBar online/offline: píldora verde/naranja en header
- useOfflineDetection hook: `navigator.onLine` + window events
- Toast automático al recuperar conexión: "✅ Datos sincronizados"
- (Opcional si hay tiempo) Workbox Service Worker básico

---

## 6. Bottom Navigation Bar

```
┌────┬─────────┬──────────┬─────────┬────────┐
│ 🏠 │  📋     │   🎤    │  📊     │  👤   │
│Home│ Ventas  │  [FAB]  │ Reportes│ Perfil │
└────┴─────────┴──────────┴─────────┴────────┘
```
- 4 tabs + FAB central magenta pulsante
- Tab activo: icono en magenta con dot indicator
- FAB: `bg-gradient-to-br from-fuchsia-500 to-purple-600` con sombra magenta
- Transición entre tabs: fade + slide suave (Motion)

---

## 7. Orden de Ejecución Recomendado

### Sprint 1 — Core (Hacerlo funcionar)
1. `AppContext.tsx` + `dataService.ts` + tipos TypeScript
2. `App.tsx` routing restructure + bottom nav shell
3. `LoginScreen.tsx`
4. `Dashboard.tsx` redesign (sales-focused)
5. `SaleConfirmModal.tsx` + `VoiceInput.tsx` adaptado

### Sprint 2 — Diferenciadores
6. `QRPaymentModal.tsx` (impacto máximo para el jurado)
7. `ReportsView.tsx` con Recharts (requerimiento del hackathon)
8. `TinkaScore.tsx` + `BadgesGallery.tsx`
9. `TransactionHistory.tsx`

### Sprint 3 — Módulos Nuevos
10. `BankSyncModule.tsx` (simulado)
11. `SupplierList.tsx` + `SupplierEvalForm.tsx`
12. `BIInsights.tsx`
13. PWA/offline + polish final

---

## 8. Checklist Final MVP

### Core (Requerido por el hackathon)
- [ ] Registro de venta: producto, monto, método de pago, ubicación, fecha/hora
- [ ] Gestión de usuarios (login privado)
- [ ] Reporte total por período (día/semana/mes/rango)
- [ ] Desglose por método de pago (gráfico)
- [ ] Visualización clara (gráficos + tablas)

### Diferenciadores (WOW factor para el jurado)
- [ ] Registro por voz (IA simulada)
- [ ] QR de cobro integrado Banco FIE
- [ ] Sincronización BancaMovil FIE
- [ ] Tinka Score + Gamificación
- [ ] Microcrédito pre-aprobado
- [ ] Insights BI con IA
- [ ] Gestión de proveedores con evaluación
- [ ] PWA installable (offline)

### UI/UX Polish
- [ ] Dark mode premium con acento magenta FIE
- [ ] Animaciones con Motion en todas las transiciones
- [ ] Bottom sheet pattern (vaul) para formularios
- [ ] Micro-interacciones: confirmar, sincronizar, logros
- [ ] Toasts informativos (Sonner)
- [ ] Skeletons de carga
- [ ] Mobile-first absoluto

---

## 9. Notas del Diseño (Observaciones de guia_imagenes)

La app de referencia (Moni) muestra el patrón de UX a seguir:
- **Números enormes** para el total: `text-5xl font-bold` — inmediato impacto visual
- **Columnas de categorías** con emoji e importe — reutilizar este patrón para productos
- **FAB flotante** de micrófono en coral/magenta — acción principal
- **Bottom sheet** limpio para ingreso de datos (descripción + monto)
- **Pantalla de voz** full-screen con gradiente de color intenso
- **Bottom nav** minimalista: + | chat | search | mic
- **Lista de transacciones** con icono de categoría + nombre + monto + categoría tag
- **Configuración** como lista scrolleable

**Adaptación para Tinka Digital**: misma UX de referencia pero en **dark mode premium** con paleta magenta-violeta de Banco FIE, y el contexto totalmente orientado a **registro de ventas** del emprendedor, no a gastos personales.

---

*Proyecto: Tinka Digital | Hackathon CochaTech 2026 | Banco FIE Bolivia*
