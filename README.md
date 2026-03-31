# Elroi - Plataforma de Vigilancia Interactiva

Elroi es una plataforma de vigilancia interactiva en tiempo real. Un sistema integral avanzado diseñado para monitoreo de flotas, alertas de seguridad, análisis geoespacial y gestión territorial mediante mapas interactivos avanzados en 3D.

## 🚀 Características (Módulos de Interfaz Actuales)
- **Landing Page Moderna**: Diseño inmersivo oscuro con estética táctica y profesional.
- **Mapa Interactivo 3D**: Integración dinámica con Mapbox GL JS, implementando la versión `standard` de mapas en preset de noche ("night") e incluyendo un renderizado de edificios 3D basándose en su altura y zoom.
- **Panel de Monitoreo Analítico**: Una barra lateral de control estilo "Fleet/Dashboard" para gestionar incidentes, con indicadores visuales de vehículos sospechosos, retrasos de reporte y patrullas mediante integración iconográfica.
- **Sistema de Widgets**: Visualización en la página de inicio para registros de alertas recientes y acceso a módulos de proyección de inteligencia artificial y monitoreo ambiental.

## 🛠️ Tecnologías Utilizadas
- **[React](https://react.dev/)**
- **[Vite](https://vitejs.dev/)** como empaquetador y servidor de desarrollo.
- **[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)** para toda la renderización de mapas web.
- **[Lucide React](https://lucide.dev/)** para iconografía vectorial escalable y limpia.
- **CSS** moderno (Flexbox, custom properties e interfaces adaptativas).

## 📦 Instalación y Configuración Locales

1. **Clonar/Abrir el repositorio:**
   Asegúrate de estar en el directorio de `Elroi`:
   ```bash
   cd Elroi
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Para que el mapa funcione, necesitas un token de acceso de Mapbox. Crea un archivo `.env` en la raíz del proyecto con lo siguiente:
   ```env
   VITE_MAPBOX_TOKEN=tu_token_publico_de_mapbox_aqui
   ```

4. **Ejecutar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Visitar la vista previa:**
   Abre tu navegador (usualmente en `http://localhost:5173/`).

## 🗺️ Estructura Principal de Componentes
- `public/assets/` - Recursos estáticos, como fondos del mapa base para la portada (`puerto_montt.png`).
- `src/App.jsx` - Controlador principal. Maneja las vistas intercambiables (Landing Mode `<->` Map Mode) la navegación y las barras laterales del dashboard.
- `src/MapboxExample.jsx` - Lógica base de renderización, cámaras e instanciación de la API de Mapbox 3D enfocado en el sector visualizado.
- `src/App.css` - Sistema de estilos dedicados a todo el Front.
