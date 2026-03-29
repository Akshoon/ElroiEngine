import React, { useState } from 'react';
import MapboxExample from './MapboxExample';
import './App.css';

function App() {
  const [showMap, setShowMap] = useState(false);

  if (showMap) {
    return (
      <div className="map-view-container">
        <button className="back-btn" onClick={() => setShowMap(false)}>
          &larr; Volver
        </button>
        <MapboxExample />
      </div>
    );
  }

  return (
    <div className="landing-container">
      {/* Sidebar izquierda (iconos sociales/menu) */}
      <aside className="left-sidebar">
        <div className="top-icon"></div>
        <div className="social-icons">
          <span>f</span>
          <span>t</span>
          <span>y</span>
        </div>
        <div className="bottom-icon">⚯</div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <header className="top-nav">
          <nav>
            <a href="#">Inicio</a>
            <a href="#">Sobre Nosotros</a>
            <a href="#">Blog</a>
            <a href="#">Contacto</a>
          </nav>
          <div className="menu-burger">=</div>
        </header>

        <section className="hero-section">
          <div className="hero-text-area">
            <h1 className="hero-title">EL<span className="accent">R</span>OI</h1>
            <p className="hero-description">
              Plataforma de vigilancia interactiva en tiempo real. Un sistema integral tipo "ojo de Dios" para monitoreo, 
              alertas de seguridad, análisis geoespacial predictivo y gestión territorial mediante mapas interactivos avanzados.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => setShowMap(true)}>
                COMENZAR
              </button>
              <button className="btn-secondary">PRUEBA GRATIS</button>
            </div>
          </div>
        </section>

        {/* Sección inferior (cronograma y vistas) */}
        <section className="bottom-widgets">
          <div className="schedule-widget">
            <h3 className="widget-title">REGISTRO DE ALERTAS</h3>
            <div className="schedule-item">
              <span className="date">HOY, 15</span>
              <div className="details">
                <strong>ZONA PUERTO</strong>
                <span className="time">11:00 AM</span>
                <span className="location">"Cámara 04 - Sector Norte"</span>
              </div>
            </div>
            <div className="schedule-item">
              <span className="date">HOY, 21</span>
              <div className="details">
                <strong>AV. PRINCIPAL</strong>
                <span className="time">10:30 AM</span>
                <span className="location">"Sensor perimetral"</span>
              </div>
            </div>
          </div>

          <div className="preview-widget">
            <div className="preview-card">
              <span className="preview-label">MÓDULO 1</span>
              <div className="preview-image-placeholder">Monitoreo 3D</div>
            </div>
            <div className="preview-card">
              <span className="preview-label">MÓDULO 2</span>
              <div className="preview-image-placeholder">Análisis AI</div>
            </div>
          </div>
        </section>
      </main>

      {/* Capa de fondo con la imagen de Puerto Montt */}
      <div className="background-layer">
        <img src="/assets/puerto_montt.png" alt="Puerto Montt Mapa" />
        <div className="gradient-overlay"></div>
      </div>
    </div>
  );
}

export default App;
