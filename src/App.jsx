import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Crosshair, Home, Package, Archive, Settings, MessageSquare, ArrowLeft,
  Search, ArrowUpDown, Filter, Signal, AlertCircle, Clock, MapPinned, MapPin,
  Share2, Menu, Lock, Camera, Car, Users, X,
  Sunrise, Sun, Sunset, Moon, Send, Bot,
} from 'lucide-react';
import MapboxExample from './MapboxExample';
import './App.css';

// ─── Datos del panel de monitoreo ────────────────────────────────────────────
const ITEMS = [
  {
    id: 'DV-1220', tab: 'mapa', type: 'incidente',
    iconColor: '#ff5a00', signalType: 'signal', signalClass: 'error',
    name: 'Vehículo Sospechoso (Encargo Robo)',
    tag: 'CHLE', distance: 2.3, urgencia: 1,
    loc1: 'Antonio Varas 727, Puerto Montt',
    loc2: 'Último avistamiento: Mall Paseo del Mar',
    meta: 'Hace 15m',
  },
  {
    id: 'P-133', tab: 'mapa', type: 'incidente',
    iconColor: '#d9534f', signalType: 'alert', signalClass: 'error-icon',
    name: 'Procedimiento Policial',
    tag: 'GOPE', distance: 4.0, urgencia: 2,
    loc1: 'Illapel 10, Puerto Montt',
    loc2: 'Hotel Gran Pacífico, perímetro asegurado',
    meta: 'Hace 2h 23m', status: 'Apoyo requerido', statusClass: 'status-red',
  },
  {
    id: 'TF-5786', tab: 'mapa', type: 'patrulla',
    iconColor: '#f0ad4e', signalType: 'clock', signalClass: 'warning-icon',
    name: 'Patrulla 04',
    tag: 'GOPE', distance: 1.2, urgencia: 3,
    loc1: 'Paseo Costanera, Puerto Montt',
    loc2: 'Costanera Centro',
    meta: 'Hace 5m', status: 'Control de Identidad', statusClass: 'status-yellow',
  },
  {
    id: 'CAM-01', tab: 'camaras', type: 'camara',
    iconColor: '#4299e1', signalType: 'signal', signalClass: 'error',
    name: 'Cámara PTZ — Centro Cívico',
    tag: 'HD', distance: 0.4, urgencia: 5,
    loc1: 'Plaza de Armas, Puerto Montt',
    loc2: 'Cobertura 360° activa',
    meta: 'En línea',
  },
  {
    id: 'CAM-02', tab: 'camaras', type: 'camara',
    iconColor: '#4299e1', signalType: 'alert', signalClass: 'warning-icon',
    name: 'Cámara Fija — Terminal Buses',
    tag: '4K', distance: 1.8, urgencia: 4,
    loc1: 'Terminal de Buses, Diego Portales',
    loc2: 'Señal degradada — revisar',
    meta: 'Señal débil', status: 'Revisar', statusClass: 'status-yellow',
  },
  {
    id: 'PAT-01', tab: 'patrullas', type: 'patrulla',
    iconColor: '#48bb78', signalType: 'signal', signalClass: 'error',
    name: 'Patrulla 01 — OS9',
    tag: 'PDI', distance: 0.9, urgencia: 5,
    loc1: 'Av. Presidente Ibáñez, Puerto Montt',
    loc2: 'Ronda sector norte',
    meta: 'Hace 2m',
  },
  {
    id: 'PAT-02', tab: 'patrullas', type: 'patrulla',
    iconColor: '#48bb78', signalType: 'clock', signalClass: 'warning-icon',
    name: 'Patrulla 02 — Pichi Pelluco',
    tag: 'OS7', distance: 3.1, urgencia: 4,
    loc1: 'Población Pichi Pelluco',
    loc2: 'Post operativo — regresando a base',
    meta: 'Hace 18m', status: 'Regresando', statusClass: 'status-yellow',
  },
  {
    id: 'ACT-01', tab: 'activos', type: 'activo',
    iconColor: '#ed8936', signalType: 'signal', signalClass: 'error',
    name: 'Unidad GOPE — Equipo Alpha',
    tag: 'GOPE', distance: 2.1, urgencia: 2,
    loc1: 'Cuartel Central, Puerto Montt',
    loc2: '6 efectivos desplegados',
    meta: 'Activo',
  },
];

const SORT_OPTIONS     = [{ id:'distancia',label:'Distancia'},{id:'urgencia',label:'Urgencia'},{id:'reciente',label:'Reciente'}];
const TYPE_FILTERS     = [{ id:'todos',label:'Todos'},{id:'incidente',label:'Incidentes'},{id:'patrulla',label:'Patrullas'},{id:'camara',label:'Cámaras'},{id:'activo',label:'Activos'}];

function ItemIcon({ type, color }) {
  const s = { flexShrink: 0 };
  if (type === 'camara')   return <Camera   size={15} color={color} style={s} />;
  if (type === 'patrulla') return <Car      size={15} color={color} style={s} />;
  if (type === 'activo')   return <Users    size={15} color={color} style={s} />;
  return <MapPinned size={15} color={color} style={s} />;
}
function SignalIcon({ type }) {
  if (type === 'alert') return <AlertCircle size={15} />;
  if (type === 'clock') return <Clock       size={15} />;
  return <Signal size={15} />;
}

// ─── Panel de Monitoreo ───────────────────────────────────────────────────────
function MonitoreoPanel() {
  const [activeTab,      setActiveTab]      = useState('mapa');
  const [search,         setSearch]         = useState('');
  const [sortBy,         setSortBy]         = useState('distancia');
  const [sortAsc,        setSortAsc]        = useState(true);
  const [typeFilter,     setTypeFilter]     = useState('todos');
  const [showSortMenu,   setShowSortMenu]   = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const TABS = [
    { id:'mapa', label:'Mapa' }, { id:'camaras', label:'Cámaras' },
    { id:'patrullas', label:'Patrullas' }, { id:'activos', label:'Activos' },
  ];

  const filtered = useMemo(() => {
    let list = ITEMS.filter(i => i.tab === activeTab);
    if (typeFilter !== 'todos') list = list.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) ||
        i.loc1.toLowerCase().includes(q) || (i.tag && i.tag.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      let diff = 0;
      if (sortBy === 'distancia') diff = a.distance - b.distance;
      if (sortBy === 'urgencia')  diff = a.urgencia  - b.urgencia;
      return sortAsc ? diff : -diff;
    });
  }, [activeTab, search, sortBy, sortAsc, typeFilter]);

  const handleSortClick = (id) => {
    if (sortBy === id) setSortAsc(v => !v); else { setSortBy(id); setSortAsc(true); }
    setShowSortMenu(false);
  };

  return (
    <div className="panel-content" onClick={() => { setShowSortMenu(false); setShowFilterMenu(false); }}>
      <h2 className="panel-title">Monitoreo</h2>
      <div className="panel-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`}
            onClick={e => { e.stopPropagation(); setActiveTab(t.id); setSearch(''); setTypeFilter('todos'); }}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="search-filter-row">
        <div className="search-box">
          <span className="search-icon"><Search size={15} /></span>
          <input type="text" placeholder="Buscar incidente o patrulla..."
            value={search} onChange={e => setSearch(e.target.value)}
            onClick={e => e.stopPropagation()} />
          {search && (
            <span style={{ cursor:'pointer', color:'#555', marginLeft:4, display:'flex' }}
              onClick={e => { e.stopPropagation(); setSearch(''); }}><X size={13} /></span>
          )}
        </div>
        <div style={{ position:'relative', flexShrink:0 }} onClick={e => e.stopPropagation()}>
          <button className="status-btn"
            onClick={() => { setShowSortMenu(v => !v); setShowFilterMenu(false); }}
            style={{ background: showSortMenu ? '#2a2a2a' : undefined }}>
            <ArrowUpDown size={14} />
            {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
            {sortBy !== 'reciente' && <span style={{ fontSize:9, opacity:0.6 }}>{sortAsc ? '↑' : '↓'}</span>}
          </button>
          {showSortMenu && (
            <div className="dropdown-menu">
              {SORT_OPTIONS.map(s => (
                <button key={s.id} className={`dropdown-item${sortBy === s.id ? ' active' : ''}`}
                  onClick={() => handleSortClick(s.id)}>
                  {s.label}
                  {sortBy === s.id && s.id !== 'reciente' && (
                    <span style={{ marginLeft:'auto', fontSize:10 }}>{sortAsc ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ position:'relative', flexShrink:0 }} onClick={e => e.stopPropagation()}>
          <button className={`filter-btn${typeFilter !== 'todos' ? ' filter-active' : ''}`}
            onClick={() => { setShowFilterMenu(v => !v); setShowSortMenu(false); }}>
            <Filter size={15} />
          </button>
          {showFilterMenu && (
            <div className="dropdown-menu" style={{ right:0, minWidth:130 }}>
              {TYPE_FILTERS.map(f => (
                <button key={f.id} className={`dropdown-item${typeFilter === f.id ? ' active' : ''}`}
                  onClick={() => { setTypeFilter(f.id); setShowFilterMenu(false); }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="item-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><Search size={28} color="#333" /><p>Sin resultados</p></div>
        ) : filtered.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <span className="item-id">{item.id}</span>
              <span className={`item-signal ${item.signalClass}`}><SignalIcon type={item.signalType} /></span>
            </div>
            <div className="item-title-row">
              <span className="item-name">
                <ItemIcon type={item.type} color={item.iconColor} />
                {item.name}
                <span className="item-tag">{item.tag}</span>
              </span>
              <span className="item-distance">{item.distance}km</span>
            </div>
            <div className="item-details">
              <p><MapPin size={13} /> {item.loc1}</p>
              <p><MapPin size={13} /> {item.loc2}</p>
              <p className="item-meta">
                {item.meta} • {item.distance}km
                {item.status && <> • <span className={item.statusClass}>{item.status}</span></>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Panel de Configuración ───────────────────────────────────────────────────
const PRESET_OPTIONS = [
  { id: 'auto',  label: 'Automático',  desc: 'Cambia según el horario',  Icon: Clock   },
  { id: 'dawn',  label: 'Amanecer',    desc: '05:00 – 07:59',            Icon: Sunrise },
  { id: 'day',   label: 'Día',         desc: '08:00 – 17:59',            Icon: Sun     },
  { id: 'dusk',  label: 'Anochecer',   desc: '18:00 – 20:59',            Icon: Sunset  },
  { id: 'night', label: 'Noche',       desc: '21:00 – 04:59',            Icon: Moon    },
];

function ConfigPanel({ presetMode, onPresetChange }) {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Configuración</h2>

      {/* Tema del mapa */}
      <div className="config-section">
        <div className="config-section-title">TEMA DEL MAPA</div>
        {PRESET_OPTIONS.map(({ id, label, desc, Icon }) => {
          const active = presetMode === id;
          return (
            <button key={id} className={`preset-option${active ? ' active' : ''}`}
              onClick={() => onPresetChange(id)}>
              <div className="preset-icon-wrap">
                <Icon size={18} color={active ? '#ff5a00' : '#666'} />
              </div>
              <div className="preset-text">
                <span className="preset-label">{label}</span>
                <span className="preset-desc">{desc}</span>
              </div>
              {active && <div className="preset-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Panel Asistente IA ───────────────────────────────────────────────────────
const MOCK_RESPONSES = [
  { kw: ['hola','buenos','buenas','hi','hey'],
    res: 'Hola, soy el Asistente ELROI. ¿En qué puedo ayudarte?' },
  { kw: ['tráfico','trafico','congestion','vial','ruta'],
    res: 'El tráfico en Puerto Montt muestra congestión moderada en Av. Diego Portales y Av. Presidente Ibáñez. La Ruta 5 Sur está despejada.' },
  { kw: ['incidente','alerta','emergencia','sospechoso'],
    res: 'Hay 2 incidentes activos: DV-1220 (Vehículo Sospechoso) en Antonio Varas 727 y P-133 (Procedimiento Policial) en Illapel 10.' },
  { kw: ['cámara','camara','camaras','cámaras','video'],
    res: 'Hay 2 cámaras activas. CAM-01 operando al 100% en Plaza de Armas. CAM-02 presenta señal degradada en el Terminal de Buses.' },
  { kw: ['patrulla','patrullas','vehiculo','vehículo'],
    res: 'PAT-01 en ronda activa sector norte. PAT-02 finalizó operativo en Pichi Pelluco y está regresando a base.' },
  { kw: ['resumen','estado','situacion','situación'],
    res: 'Resumen operacional: 2 incidentes activos, 2 cámaras conectadas, 2 patrullas en servicio, 1 unidad GOPE desplegada. Nivel de alerta: MEDIO.' },
  { kw: ['tema','mapa','modo','preset','anochecer','noche','día','amanecer'],
    res: 'Puedes cambiar el tema del mapa en el panel de Configuración (icono ⚙ en el rail izquierdo). Hay 5 modos disponibles: Automático, Amanecer, Día, Anochecer y Noche.' },
];

function getResponse(msg) {
  const q = msg.toLowerCase();
  for (const { kw, res } of MOCK_RESPONSES) {
    if (kw.some(k => q.includes(k))) return res;
  }
  return 'Entendido. En este momento no tengo información específica sobre eso. Consulta el panel de Monitoreo para ver los datos en tiempo real.';
}

function AsistentePanel() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hola, soy el Asistente ELROI. Puedo ayudarte con el estado del tráfico, incidentes, cámaras y patrullas activas. ¿Qué necesitas saber?' }
  ]);
  const [input, setInput]       = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = () => {
    const text = input.trim();
    if (!text || thinking) return;
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: getResponse(text) }]);
      setThinking(false);
    }, 900 + Math.random() * 600);
  };

  return (
    <div className="panel-content asistente-panel">
      <h2 className="panel-title">
        <Bot size={18} style={{ marginRight: 8, color: '#ff5a00' }} />
        Asistente IA
      </h2>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.from}`}>
            {m.from === 'bot' && (
              <div className="chat-avatar"><Bot size={14} /></div>
            )}
            <div className="chat-text">{m.text}</div>
          </div>
        ))}
        {thinking && (
          <div className="chat-bubble bot">
            <div className="chat-avatar"><Bot size={14} /></div>
            <div className="chat-text chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe tu consulta..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="chat-send-btn" onClick={send} disabled={thinking}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── App principal ────────────────────────────────────────────────────────────
function App() {
  const [showMap,     setShowMap]     = useState(false);
  const [activePanel, setActivePanel] = useState('monitoreo');
  const [presetMode,  setPresetMode]  = useState('dusk'); // por defecto: Anochecer

  if (showMap) {
    return (
      <div className="map-view-container">
        <aside className="map-sidebar">
          {/* Icon rail */}
          <div className="icon-rail">
            <div className="rail-logo"><Crosshair size={26} /></div>

            {/* Monitoreo */}
            <div className={`rail-icon${activePanel === 'monitoreo' ? ' active' : ''}`}
              title="Monitoreo" onClick={() => setActivePanel('monitoreo')}>
              <Home size={20} />
            </div>

            {/* Sin funcionalidad (por ahora) */}
            <div className="rail-icon" title="Módulos (próximamente)" style={{ opacity: 0.4, cursor:'not-allowed' }}>
              <Package size={20} />
            </div>
            <div className="rail-icon" title="Archivos (próximamente)" style={{ opacity: 0.4, cursor:'not-allowed' }}>
              <Archive size={20} />
            </div>

            {/* Configuración */}
            <div className={`rail-icon${activePanel === 'configuracion' ? ' active' : ''}`}
              title="Configuración" onClick={() => setActivePanel('configuracion')}>
              <Settings size={20} />
            </div>

            {/* Asistente IA */}
            <div className={`rail-icon${activePanel === 'asistente' ? ' active' : ''}`}
              title="Asistente IA" onClick={() => setActivePanel('asistente')}>
              <MessageSquare size={20} />
            </div>

            <div style={{ flexGrow: 1 }} />
            <div className="rail-icon back-action" onClick={() => setShowMap(false)} title="Volver">
              <ArrowLeft size={20} />
            </div>
          </div>

          {/* Panel dinámico */}
          {activePanel === 'monitoreo'    && <MonitoreoPanel />}
          {activePanel === 'configuracion' && (
            <ConfigPanel presetMode={presetMode} onPresetChange={setPresetMode} />
          )}
          {activePanel === 'asistente'    && <AsistentePanel />}
        </aside>

        <div className="map-area">
          <MapboxExample presetMode={presetMode} />
        </div>
      </div>
    );
  }

  // ─── Landing ───────────────────────────────────────────────────────────────
  return (
    <div className="landing-container">
      <aside className="left-sidebar">
        <div className="top-icon"><Lock size={18} /></div>
        <div className="social-icons"></div>
        <div className="bottom-icon"><Share2 size={18} /></div>
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <nav><a href="#">Inicio</a></nav>
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
              <button className="btn-primary" onClick={() => setShowMap(true)}>COMENZAR</button>
            </div>
          </div>
        </section>

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
