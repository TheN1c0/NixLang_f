# Arquitectura del Frontend — NixLang

Este documento define la arquitectura oficial, convenciones de desarrollo y decisiones técnicas para el frontend de la plataforma NixLang. Actúa como la referencia de ingeniería principal para cualquier desarrollador que participe en el proyecto, garantizando la consistencia, mantenibilidad y escalabilidad a largo plazo.

---

## 1. Objetivo del Frontend

El frontend de NixLang tiene como objetivo principal proveer una interfaz de usuario interactiva, fluida y de alto rendimiento que permita el aprendizaje autónomo de idiomas (inglés). Debe ofrecer una navegación limpia, interactividad eficiente para la resolución de lecciones y una base de código desacoplada que facilite la incorporación de nuevos contenidos didácticos en el futuro.

---

## 2. Versiones Oficiales del Proyecto

Para el desarrollo del frontend de NixLang, se adoptan oficialmente las siguientes versiones:

* **Angular:** `21.0.x` (Estable)
* **Angular CLI:** `21.0.x`
* **Node.js:** `22.x` (LTS - Long Term Support)
* **npm:** `10.x` o compatible.
* **TypeScript:** `~5.6.x` o `~5.7.x` (Versión oficial compatible con Angular 21)

---

## 3. Justificación Tecnológica

* **Ecosistema Angular 21:** Adopta mejoras significativas en el rendimiento de la reactividad a través de **Signals**, un control de flujo declarativo moderno (bloques `@switch`, `@if`, `@for`) y compilación zoneless nativa opcional que minimiza la sobrecarga del navegador.
* **Node 22 LTS y npm:** Proporcionan un entorno de ejecución local robusto, estable y de largo soporte con mejoras de velocidad en la resolución de dependencias y compatibilidad con las herramientas más recientes del ecosistema frontend.
* **Componentes Standalone:** Angular 21 consolida la omisión de `NgModule`, reduciendo el acoplamiento técnico y agilizando la modularización de componentes.

---

## 4. Principios Arquitectónicos

El proyecto se rige por cuatro principios fundamentales de ingeniería de software:
1. **Feature First (Funcionalidades Primero):** El código se organiza en torno a agrupaciones de negocio (funcionalidades), no por tipo técnico de archivo, lo que facilita que cada flujo evolucione independientemente.
2. **Bajo Acoplamiento y Alta Cohesión:** Los componentes interactúan a través de interfaces bien definidas y tienen propósitos altamente concentrados.
3. **Una Sola Responsabilidad (SRP):** Cada clase, componente o servicio debe resolver un único problema o caso de uso.
4. **Principio de Abierto/Cerrado (OCP):** Nuevos bloques didácticos de lección deben poder añadirse sin alterar el visor o la lógica de navegación general.

---

## 5. Organización Completa de Carpetas

El repositorio `nixlang-front` estructurará su código fuente dentro del directorio `src/app/` de la siguiente manera:

```text
src/
 ├── app/
 │    ├── core/                       # ELEMENTOS SINGLETON (Se cargan una única vez en app.config)
 │    │    ├── guards/                # Reglas de protección de rutas (ej. AuthGuard)
 │    │    ├── interceptors/          # Interceptores de red (ej. JwtInterceptor)
 │    │    ├── services/              # Servicios compartidos de infraestructura (ej. AuthService)
 │    │    └── models/                # Estructuras de datos transversales globales (ej. User, TokenSession)
 │    │
 │    ├── shared/                     # ELEMENTOS COMPARTIDOS (Reutilizados en múltiples features)
 │    │    ├── components/            # UI Atoms/Molecules visuales y puros (ej. Spinner, Button, Modal)
 │    │    ├── directives/            # Directivas comunes
 │    │    └── pipes/                 # Pipes de formateo
 │    │
 │    ├── layout/                     # ESTRUCTURA BASE (Shell de la aplicación)
 │    │    ├── components/            # HeaderComponent, FooterComponent, SidebarComponent
 │    │    └── main-layout/           # Componente contenedor con router-outlet principal
 │    │
 │    ├── features/                   # FUNCIONALIDADES DEL SISTEMA (Feature-First)
 │    │    ├── auth/                  # Inicio de sesión y registro de usuarios
 │    │    │    ├── components/       # Componentes puros locales (ej. LoginForm)
 │    │    │    ├── pages/            # Controladores de página inteligentes (ej. LoginPage)
 │    │    │    └── models/           # Contratos específicos del flujo de autenticación (ej. LoginRequest)
 │    │    │
 │    │    ├── lessons/                # Catálogo y visor de lección (HU-017, HU-018, HU-019)
 │    │    │    ├── components/       # Componentes locales (ej. LessonCard, LessonBlockRenderer)
 │    │    │    ├── pages/            # Páginas controladoras (ej. CatalogPage, LessonPlayPage)
 │    │    │    ├── services/         # Servicios de negocio locales (ej. LessonService)
 │    │    │    └── models/           # Modelos de negocio locales de lección (ej. Lesson, LessonBlock, Exercise)
 │    │    │
 │    │    ├── exercises/              # Resolver actividades (futuro)
 │    │    ├── progress/               # Historial de progreso personal (futuro)
 │    │    └── admin/                  # Panel de administración (futuro)
 │    │
 │    ├── app.config.ts               # Proveedores globales del arranque
 │    ├── app.routes.ts               # Enrutamiento raíz con Lazy Loading para features
 │    └── app.component.ts            # Componente de bootstrap
 ├── docs/
 │    └── Arquitectura_Frontend_NixLang.md # Este documento de referencia
 ├── angular.json
 ├── package.json
 └── tsconfig.json
```

---

## 6. Responsabilidad de cada Carpeta

* **core/**: Contiene componentes esenciales no visuales de la aplicación que deben cargarse al arrancar (seguridad, autenticación, interceptación de tráfico).
* **shared/**: Contiene componentes visuales genéricos (*Dumb Components*), directivas y pipes de formato reutilizables. Ningún elemento en shared debe inyectar servicios del negocio ni de HTTP.
* **layout/**: Define la carcasa de la aplicación (menú superior, menús laterales, pie de página). Actúa como la estructura estática de la SPA.
* **features/**: Agrupa las secciones funcionales del negocio de forma aislada. Cada feature debe ser autosuficiente y contener sus propias vistas, componentes de presentación, servicios locales y modelos de datos específicos.
* **services/**: Clases encargadas de encapsular llamadas a la API y el procesamiento básico de datos.
* **guards/**: Lógica de interceptación de rutas para redirigir a usuarios no autenticados o restringir páginas administrativas.
* **interceptors/**: Lógica de red transversal, como inyectar tokens JWT o manejar respuestas de error HTTP 401/500 de manera global.
* **pages/**: Componentes inteligentes (*Smart Components*) asociados a una ruta que inyectan servicios, manejan el ciclo de vida y pasan datos hacia componentes más pequeños.
* **components/**: Componentes de presentación (*Dumb Components*). Solo pintan datos que reciben como `@Input()` y reportan interacciones de usuario por medio de `@Output()`.
* **models/**: Definiciones TypeScript (interfaces o tipos) para garantizar tipado estricto. Los modelos de una feature viven exclusivamente en su carpeta; solo se comparten globalmente en `core/` o `shared/` aquellos que cruzan múltiples dominios de negocio.

---

## 7. Flujo de Comunicación entre Componentes, Servicios y API

Se prohíbe terminantemente la inyección directa de `HttpClient` en componentes visuales. La arquitectura debe mantener siempre el siguiente flujo unidireccional de comunicación:

```text
Componente Inteligente (Page)
        ↓
Servicio Especializado (Inyecta HttpClient)
        ↓
HttpClient (Angular)
        ↓
API de Backend (REST Endpoint)
```

1. Las páginas inteligentes (`Page`) inyectan el servicio de feature (ej. `LessonService`).
2. El servicio inyecta `HttpClient` para comunicarse con la API.
3. El servicio tipa estrictamente los datos que recibe y expone Signals u Observables hacia la página.
4. La página inteligente propaga los datos enlazándolos a componentes de presentación (`components/`) mediante entradas `@Input()`.
5. Los componentes de presentación emiten eventos hacia arriba (`@Output()`) cuando ocurre interacción del usuario.

---

## 8. Estrategia de Renderizado de `LessonBlock`

Para dar soporte a la **HU-019 (Carga de Contenido)** ocultando detalles de dominio al usuario, toda la renderización de la secuencia de contenidos se gestionará a través de un **Renderizador Único**.

### Flujo de Renderizado
```text
LessonPlayPage (Orquesta la carga y navegación de la lección)
        ↓
LessonBlockRenderer (Único componente autorizado a evaluar block.type)
        ↓
┌───────────────────┬───────────────────┬───────────────────┐
↓                   ↓                   ↓                   ↓
HeadingBlock   ParagraphBlock       AudioBlock        ExerciseBlock
```

* **Principio de Centralización:** El componente `LessonBlockRendererComponent` será el único punto autorizado en el frontend para procesar el tipo de bloque (`block.type`).
* **Plantilla Limpia:** Utiliza el control de flujo nativo `@switch` para mapear los distintos bloques:

```html
@switch (block.type) {
  @case ('Heading') {
    <app-heading-block [content]="block.configurationValue" />
  }
  @case ('Paragraph') {
    <app-paragraph-block [content]="block.configurationValue" />
  }
  @case ('Audio') {
    <app-audio-block [url]="block.configurationValue" />
  }
  @case ('Exercise') {
    <app-exercise-block [exercise]="block.exercise" />
  }
  @default {
    <div class="unknown-block">Contenido no disponible</div>
  }
}
```

---

## 9. Estrategia de Manejo del Estado

* **Sin NgRx:** No se incorporará Redux / NgRx para evitar el exceso de código de plantilla (*boilerplate*).
* **Herramientas Nativas:** El estado se gestionará exclusivamente con:
  * **Signals (Angular 21):** Para estados reactivos asíncronos y síncronos optimizados (ej. lección activa, progreso del bloque).
  * **RxJS:** Para la coordinación de eventos asíncronos complejos y el ciclo de vida del transporte HTTP.
  * **Servicios Singleton de Feature:** Guardan el estado en memoria durante la sesión y lo exponen mediante Signals reactivos de solo lectura.

---

## 10. Estrategia de Seguridad

* **Tokens JWT:** Manejo de sesiones seguras guardando el JWT en memoria o almacenamiento local efímero tras autenticación.
* **JwtInterceptor:** Interceptor global en `core/` que intercepta las peticiones HTTP salientes para adjuntar el encabezado `Authorization: Bearer <token>`.
* **Guards de Enrutamiento:** Proteger las páginas privadas del catálogo y visor de lección redirigiendo al login si no se encuentra un token activo en sesión.
* **Separación de Autenticación y Autorización:** El frontend evaluará los claims internos del token JWT (como el rol de Administrador o Usuario) para limitar el acceso físico a rutas a nivel de Guards y alternar componentes en la interfaz de usuario.

---

## 11. Estrategia de Rendimiento

* **Lazy Loading Obligatorio:** Todas las rutas asociadas a las carpetas de `features/` deben configurarse para carga diferida utilizando `loadChildren` o `loadComponent`.
* **ChangeDetectionStrategy.OnPush:** Todo componente presentacional o inteligente utilizará esta estrategia por defecto para reducir drásticamente los ciclos de ejecución de comprobación de cambios de Angular.
* **Componentes Pequeños y Ligeros:** Componentes atómicos con responsabilidad única, evitando lógica de formateo pesada y bucles complejos en el código TypeScript.

---

## 12. Convenciones de Desarrollo

* **Nombres de archivos:** Formato kebab-case separando el propósito por punto (ej. `lesson-catalog.component.ts`, `lesson.service.ts`, `lesson.model.ts`).
* **Nombres de Clases:** PascalCase con sufijo claro (ej. `LessonPlayPageComponent`, `LessonService`).
* **Código Limpio:** ESLint y Prettier configurados para formatear el código al guardar y rechazar compilar si existen variables no utilizadas o el uso de tipos implícitos `any`.

---

## 13. Reglas de Arquitectura que NO deben Romperse

1. **No inyectar HttpClient en componentes:** Toda llamada de red pasa obligatoriamente por un servicio.
2. **No usar NgModule:** Todos los componentes, directivas y pipes deben serStandalone.
3. **No importar componentes de una Feature en otra:** Las features deben estar aisladas. Si se requiere compartir un componente, este debe ser genérico y promoverse a `shared/`.
4. **No evaluar block.type fuera del Renderer:** Solo el componente `LessonBlockRendererComponent` interpreta el tipo de bloque pedagógico de una lección.

---

## 14. Decisiones Arquitectónicas Adoptadas (ADR Simplificadas)

### ADR-001: Adopción de Angular 21 y Node 22 LTS
* **Contexto:** Se requiere iniciar el desarrollo del frontend de NixLang sobre una base moderna y de largo soporte.
* **Decisión:** Adoptar Angular 21 y Node 22 LTS como pila de desarrollo base oficial.
* **Consecuencias:** Mayor velocidad de compilación, control nativo de Signals, e incompatibilidad con entornos de Node heredados anteriores a v20.

### ADR-002: Estructura de Proyecto Feature First
* **Contexto:** Las aplicaciones estructuradas por capas técnicas (carpetas de servicios, carpetas de componentes globales) se vuelven inmanejables al escalar.
* **Decisión:** Organizar el código por módulos de negocio independientes (*Feature First*) bajo la carpeta `features/`.
* **Consecuencias:** Desacoplamiento de desarrollos y modularidad limpia.

### ADR-003: Carga Diferida (Lazy Loading) Obligatoria
* **Contexto:** Reducir el tiempo de carga percibido por el usuario en el navegador.
* **Decisión:** Forzar el uso de Lazy Loading en el enrutamiento para todas las secciones funcionales.
* **Consecuencias:** Bundles individuales ligeros generados en compilación y carga progresiva según la navegación del usuario.

### ADR-004: Gestión de Estado Simple sin NgRx
* **Contexto:** Evitar añadir boilerplate de Redux a un proyecto en etapa inicial.
* **Decisión:** Excluir NgRx y utilizar Angular Signals con servicios reactivos.
* **Consecuencias:** Estructura de archivos limpia y fácil de mantener para un equipo ágil.

### ADR-005: Exclusión de Tailwind CSS en MVP (CSS Vanilla)
* **Contexto:** Enfocar los esfuerzos del equipo en la solidez de la arquitectura y la modularidad del código TypeScript y los contratos JSON de API.
* **Decisión:** Excluir Tailwind CSS en la etapa de desarrollo del MVP, utilizando únicamente CSS Vanilla moderno y semántico.
* **Consecuencias:** Código de plantillas limpio sin cientos de clases de estilo aplicadas de forma directa y facilidad para migrar a cualquier framework CSS en fases posteriores.

---

## 15. Recomendaciones para Mantener la Escalabilidad Futura

1. **Refactorización de Componentes Inteligentes:** Vigilar el tamaño de las clases dentro de `pages/`. Si una página inteligente empieza a gestionar demasiada lógica visual, delegar esa representación en componentes pequeños dentro de `components/`.
2. **Generación automática de DTOs:** Considerar el uso posterior de herramientas de generación de tipos TypeScript a partir de los esquemas C# de backend para evitar discordancias manuales en las interfaces API.
