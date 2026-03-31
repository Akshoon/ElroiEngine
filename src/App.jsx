import React, { useState } from 'react';
import { 
  Crosshair, Home, Package, Archive, Settings, MessageSquare, ArrowLeft, 
  Search, ArrowUpDown, Filter, Signal, AlertCircle, Clock, MapPinned, MapPin,
  Share2, Menu, Lock
} from 'lucide-react';
import MapboxExample from './MapboxExample';
import './App.css';

function App() {
  const [showMap, setShowMap] = useState(false);

  if (showMap) {
    return (
      <div className="map-view-container">
        <aside className="map-sidebar">
          {/* Icon rail */}
          <div className="icon-rail">
            <div className="rail-logo"><Crosshair size={26} /></div>
            <div className="rail-icon active"><Home size={20} /></div>
            <div className="rail-icon"><Package size={20} /></div>
            <div className="rail-icon"><Archive size={20} /></div>
            <div className="rail-icon"><Settings size={20} /></div>
            <div className="rail-icon"><MessageSquare size={20} /></div>
            <div style={{ flexGrow: 1 }} />
            <div className="rail-icon back-action" onClick={() => setShowMap(false)} title="Volver">
              <ArrowLeft size={20} />
            </div>
          </div>

          {/* Panel content */}
          <div className="panel-content">
            <h2 className="panel-title">Monitoreo</h2>

            <div className="panel-tabs">
              <button className="tab active">Mapa</button>
              <button className="tab">Cámaras</button>
              <button className="tab">Patrullas</button>
              <button className="tab">Activos</button>
            </div>

            <div className="search-filter-row">
              <div className="search-box">
                <span className="search-icon"><Search size={15} /></span>
                <input type="text" placeholder="Buscar incidente o patrulla..." />
              </div>
              <button className="status-btn">
                <ArrowUpDown size={14} /> Estado
              </button>
              <button className="filter-btn">
                <Filter size={15} />
              </button>
            </div>

            <div className="item-list">
              {/* Card 1 */}
              <div className="item-card">
                <div className="item-header">
                  <span className="item-id">DV-1220</span>
                  <span className="item-signal error"><Signal size={15} /></span>
                </div>
                <div className="item-title-row">
                  <span className="item-name">
                    <MapPinned size={15} color="#ff5a00" />
                    Vehículo Sospechoso
                    <span className="item-tag">CKAR</span>
                  </span>
                  <span className="item-distance">91km</span>
                </div>
                <div className="item-details">
                  <p><MapPin size={13} /> 3 Perry St, Campsie NSW 2194</p>
                  <p><MapPin size={13} /> Shop 10.47/644 George St, Sydney</p>
                  <p className="item-meta">2h 23m • 34km</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="item-card">
                <div className="item-header">
                  <span className="item-id">DV-1220</span>
                  <span className="item-signal error-icon"><AlertCircle size={15} /></span>
                </div>
                <div className="item-title-row">
                  <span className="item-name">
                    <MapPinned size={15} color="#d9534f" />
                    Reporte Retrasado
                    <span className="item-tag">CKAR</span>
                  </span>
                  <span className="item-distance">56km</span>
                </div>
                <div className="item-details">
                  <p><MapPin size={13} /> 3 Perry St, Campsie NSW 2194</p>
                  <p><MapPin size={13} /> Shop 10.47/644 George St, Sydney</p>
                  <p className="item-meta">
                    2h 23m • 34km • <span className="status-red">65 minutos tarde</span>
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="item-card">
                <div className="item-header">
                  <span className="item-id">TF-5786</span>
                  <span className="item-signal warning-icon"><Clock size={15} /></span>
                </div>
                <div className="item-title-row">
                  <span className="item-name">
                    <MapPinned size={15} color="#f0ad4e" />
                    Patrulla 04
                    <span className="item-tag">CKAR</span>
                  </span>
                  <span className="item-distance">128km</span>
                </div>
                <div className="item-details">
                  <p><MapPin size={13} /> 3 Perry St, Campsie NSW 2194</p>
                  <p><MapPin size={13} /> Shop 10.47/644 George St, Sydney</p>
                  <p className="item-meta">
                    2h 23m • 34km • <span className="status-yellow">Patrulla Detenida</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="map-area">
          <MapboxExample />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      {/* Left sidebar (social / menu icons) */}
      <aside className="left-sidebar">
        <div className="top-icon"><Lock size={18} /></div>
        <div className="social-icons">
          <span>f</span>
          <span>t</span>
          <span>y</span>
        </div>
        <div className="bottom-icon"><Share2 size={18} /></div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="top-nav">
          <nav>
            <a href="#">Inicio</a>
            <a href="#">Sobre Nosotros</a>
            <a href="#">Blog</a>
            <a href="#">Contacto</a>
          </nav>
          <div className="menu-burger"><Menu size={28} /></div>
        </header>

        <section className="hero-section">
          <div className="hero-text-area">
            <h1 className="hero-title">EL<span className="accent">R</span>OI</h1>
            <p className="hero-description">
              Plataforma de vigilancia interactiva en tiempo real. Un sistema integral avanzado para monitoreo,
              alertas de seguridad, análisis geoespacial predictivo y gestión territorial mediante mapas interactivos avanzados.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => setShowMap(true)}>
                COMENZAR
              </button>
            </div>
          </div>
        </section>

        {/* Bottom widgets */}
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

      {/* Background image layer */}
      <div className="background-layer">
        <img className="title-overlay" src="/assets/title.png" alt="Elroi Title" />
        <div className="map-container">
          <img src="/assets/map.png" alt="Puerto Montt Mapa" />
        </div>
        <div className="gradient-overlay" />
      </div>
    </div>
  );
}

export default App;
