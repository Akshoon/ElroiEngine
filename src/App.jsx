import React, { useState, useEffect } from 'react';
import { 
  Crosshair, Home, Package, Archive, Settings, MessageSquare, ArrowLeft, 
  Search, ArrowUpDown, Filter, Signal, AlertCircle, Clock, MapPinned, MapPin,
  Share2, Menu, Lock
} from 'lucide-react';
import MapboxExample from './MapboxExample';
import './App.css';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Minimum wait of 0.7 seconds (700ms), wait until page fully loaded
    const timer = setTimeout(() => {
      if (document.readyState === 'complete') {
        setIsLoaded(true);
        setTimeout(() => setIsReady(true), 800); // Wait 800ms for loader to fade
      } else {
        const handleLoad = () => {
          setIsLoaded(true);
          setTimeout(() => setIsReady(true), 800);
        };
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, []);

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
                    Vehículo Sospechoso (Encargo Robo)
                    <span className="item-tag">CHLE</span>
                  </span>
                  <span className="item-distance">2.3km</span>
                </div>
                <div className="item-details">
                  <p><MapPin size={13} /> Antonio Varas 727, Puerto Montt</p>
                  <p><MapPin size={13} /> Último avistamiento: Mall Paseo del Mar</p>
                  <p className="item-meta">Hace 15m • 2.3km</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="item-card">
                <div className="item-header">
                  <span className="item-id">P-133</span>
                  <span className="item-signal error-icon"><AlertCircle size={15} /></span>
                </div>
                <div className="item-title-row">
                  <span className="item-name">
                    <MapPinned size={15} color="#d9534f" />
                    Procedimiento Policial
                    <span className="item-tag">GOPE</span>
                  </span>
                  <span className="item-distance">4km</span>
                </div>
                <div className="item-details">
                  <p><MapPin size={13} /> Illapel 10, Puerto Montt</p>
                  <p><MapPin size={13} /> Hotel Gran Pacífico, perímetro asegurado</p>
                  <p className="item-meta">
                    Hace 2h 23m • 4km • <span className="status-red">Apoyo requerido</span>
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
                    <span className="item-tag">GOPE</span>
                  </span>
                  <span className="item-distance">1.2km</span>
                </div>
                <div className="item-details">
                  <p><MapPin size={13} /> Paseo Costanera, Puerto Montt</p>
                  <p><MapPin size={13} /> Costanera Centro</p>
                  <p className="item-meta">
                    Hace 5m • 1.2km • <span className="status-yellow">Control de Identidad</span>
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
    <div className={`landing-container ${isLoaded ? 'is-loaded' : ''} ${isReady ? 'app-ready' : ''}`}>
      {/* Loading Overlay */}
      <div className="loader-wrapper">
        <div className="banter-loader">
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
        </div>
      </div>

      {/* Left sidebar (social / menu icons) */}
      <aside className="left-sidebar">
        <div className="top-icon"><Lock size={18} /></div>
        <div className="social-icons">
        </div>
        <div className="bottom-icon"><Share2 size={18} /></div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="top-nav">
          <nav>
            <a href="#">Inicio</a>
          </nav>
          <div className="menu-burger"><Menu size={28} /></div>
        </header>

        <section className="hero-section">
          <div className="hero-text-area">
            <h1 className="hero-title blur-reveal">EL<span className="accent">R</span>OI</h1>
            <p className="hero-description">
              <span className="blur-reveal delay-1">Plataforma de vigilancia interactiva en tiempo real. </span>
              <span className="blur-reveal delay-2">Un sistema integral avanzado para monitoreo, alertas de seguridad, </span>
              <span className="blur-reveal delay-3">análisis geoespacial predictivo y gestión territorial mediante mapas interactivos avanzados.</span>
            </p>
            <div className="cta-buttons blur-reveal delay-4">
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
                <strong>OPERATIVO ACTIVO</strong>
                <span className="time">11:00 AM</span>
                <span className="location">"Allanamiento - Población Pichi Pelluco"</span>
              </div>
            </div>
            <div className="schedule-item">
              <span className="date">HOY, 21</span>
              <div className="details">
                <strong>PERSECUCIÓN EN CURSO</strong>
                <span className="time">10:30 AM</span>
                <span className="location">"Vehículo robado vía Ruta 5 Sur"</span>
              </div>
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

      <div className="noise-overlay" />
    </div>
  );
}

export default App;
