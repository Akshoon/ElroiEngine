import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import heatmapData from './data/data_heat_map.geojson';
import { Clock, Sunrise, Sun, Sunset, Moon, Settings, Route, Flame, Check } from 'lucide-react';

// Puerto Montt, Chile
const PUERTO_MONTT = { lng: -72.9376, lat: -41.4693 };

/**
 * Devuelve el lightPreset de Mapbox Standard según la hora actual:
 *   Dawn  → 05:00–07:59
 *   Day   → 08:00–17:59
 *   Dusk  → 18:00–20:59
 *   Night → 21:00–04:59
 */
const getLightPreset = () => {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 8)  return 'dawn';
  if (hour >= 8  && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
};

const MapboxExample = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [trafficReady, setTrafficReady] = useState(false);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [heatmapReady, setHeatmapReady] = useState(false);
  const [presetMode, setPresetMode] = useState('auto'); // 'auto' | 'dawn' | 'day' | 'dusk' | 'night'
  const [settingsOpen, setSettingsOpen] = useState(false);
  const presetModeRef = useRef('auto'); // ref para acceder dentro del interval

  useEffect(() => {

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          theme: 'faded',
          lightPreset: getLightPreset(),
        },
      },
      center: [PUERTO_MONTT.lng, PUERTO_MONTT.lat],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: mapContainerRef.current,
      antialias: true,
    });

    mapRef.current.on('style.load', () => {
      const layers = mapRef.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      )?.id;

      // ── TRÁFICO ────────────────────────────────────────────────────────────
      // slot: 'bottom' → debajo de los edificios 3D del basemap Standard v3
      mapRef.current.addSource('mapbox-traffic', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1',
      });

      mapRef.current.addLayer({
        id: 'traffic-layer',
        slot: 'middle',           // ← clave: queda bajo los 3D buildings del Standard
        type: 'line',
        source: 'mapbox-traffic',
        'source-layer': 'traffic',
        minzoom: 0,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible',
        },
        paint: {
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            6, 1.5, 14, 3, 18, 6,
          ],
          'line-color': [
            'match',
            ['get', 'congestion'],
            'low', '#00C853',
            'moderate', '#FFD600',
            'heavy', '#FF6D00',
            'severe', '#D50000',
            '#aaaaaa',
          ],
          'line-opacity': 0.85,
        },
      });

      // Edificios 3D (se agregan después = quedan ENCIMA del tráfico)
      if (mapRef.current.getSource('composite')) {
        mapRef.current.addLayer(
          {
            id: 'add-3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0, 15.05, ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0, 15.05, ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.6,
            },
          },
          labelLayerId
        );
      }

      setTrafficReady(true);

      // ── MAPA DE CALOR (Incidentes) ─────────────────────────────────────────
      mapRef.current.addSource('heatmap-incidents', {
        type: 'geojson',
        data: heatmapData,
      });

      mapRef.current.addLayer({
        id: 'heatmap-layer',
        slot: 'middle',
        type: 'heatmap',
        source: 'heatmap-incidents',
        maxzoom: 20,
        paint: {
          // Peso basado en la intensidad del incidente (1-10)
          'heatmap-weight': [
            'interpolate', ['linear'], ['get', 'intensidad'],
            1, 0.1,
            10, 1,
          ],
          // Intensidad acumulada según zoom
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            0, 1,
            18, 4,
          ],
          // Radio de influencia por punto
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, 20,
            15, 50,
            18, 80,
          ],
          // Gradiente de color: azul → cian → amarillo → rojo
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0, 0, 128, 0)',
            0.2, 'rgba(65, 105, 225, 0.6)',
            0.4, 'rgba(0, 200, 200, 0.75)',
            0.6, 'rgba(255, 220, 0, 0.85)',
            0.8, 'rgba(255, 100, 0, 0.9)',
            1,   'rgba(213, 0, 0, 1)',
          ],
          'heatmap-opacity': 0.85,
        },
      });

      setHeatmapReady(true);
    });

    // Actualiza el light preset automáticamente cada minuto (solo si modo auto)
    let lastAutoPreset = getLightPreset();
    const clockInterval = setInterval(() => {
      if (presetModeRef.current !== 'auto') return;
      const preset = getLightPreset();
      if (preset !== lastAutoPreset && mapRef.current) {
        mapRef.current.setConfigProperty('basemap', 'lightPreset', preset);
        lastAutoPreset = preset;
      }
    }, 60_000);

    return () => {
      clearInterval(clockInterval);
      mapRef.current.remove();
    };
  }, []);

  const selectPreset = (mode) => {
    presetModeRef.current = mode;
    setPresetMode(mode);
    setSettingsOpen(false);
    if (!mapRef.current) return;
    const preset = mode === 'auto' ? getLightPreset() : mode;
    mapRef.current.setConfigProperty('basemap', 'lightPreset', preset);
  };

  // Sincroniza visibilidad cada vez que cambia trafficVisible
  useEffect(() => {
    if (!trafficReady || !mapRef.current) return;
    mapRef.current.setLayoutProperty(
      'traffic-layer',
      'visibility',
      trafficVisible ? 'visible' : 'none'
    );
  }, [trafficVisible, trafficReady]);

  // Sincroniza visibilidad del mapa de calor
  useEffect(() => {
    if (!heatmapReady || !mapRef.current) return;
    mapRef.current.setLayoutProperty(
      'heatmap-layer',
      'visibility',
      heatmapVisible ? 'visible' : 'none'
    );
  }, [heatmapVisible, heatmapReady]);

  const toggleTraffic = () => setTrafficVisible((v) => !v);
  const toggleHeatmap = () => setHeatmapVisible((v) => !v);

  // Etiqueta + icono del modo activo para mostrar en el botón
  const PRESET_META = {
    auto:  { label: 'Auto',       Icon: Clock   },
    dawn:  { label: 'Amanecer',   Icon: Sunrise  },
    day:   { label: 'Día',        Icon: Sun      },
    dusk:  { label: 'Anochecer',  Icon: Sunset   },
    night: { label: 'Noche',      Icon: Moon     },
  };
  const { label: activeLabel, Icon: ActiveIcon } = PRESET_META[presetMode];

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id="map" ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

      {/* ── Botón ⚙ Configuración (top-right) ─────────────────────────────── */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20 }}>
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          title="Configuración de tema"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.03em',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            background: settingsOpen
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(20,20,30,0.70)',
            color: settingsOpen ? '#fff' : '#ccc',
            boxShadow: settingsOpen
              ? '0 0 0 1.5px rgba(255,255,255,0.35), 0 4px 20px rgba(0,0,0,0.4)'
              : '0 0 0 1.5px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <Settings size={15} />
          <ActiveIcon size={14} />
          {activeLabel}
        </button>

        {/* Panel desplegable */}
        {settingsOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '200px',
            borderRadius: '12px',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(14,16,24,0.88)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.5)',
            fontFamily: 'Inter, sans-serif',
          }}>
            {/* Encabezado */}
            <div style={{
              padding: '10px 14px 6px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
            }}>
              Tema del mapa
            </div>

            {/* Opciones */}
            {[
              { id: 'auto',  Icon: Clock,   label: 'Automático',  desc: 'Cambia según el horario'   },
              { id: 'dawn',  Icon: Sunrise, label: 'Amanecer',    desc: '05:00 – 07:59'              },
              { id: 'day',   Icon: Sun,     label: 'Día',         desc: '08:00 – 17:59'              },
              { id: 'dusk',  Icon: Sunset,  label: 'Anochecer',   desc: '18:00 – 20:59'              },
              { id: 'night', Icon: Moon,    label: 'Noche',       desc: '21:00 – 04:59'              },
            ].map(({ id, Icon, label, desc }) => {
              const active = presetMode === id;
              return (
                <button
                  key={id}
                  onClick={() => selectPreset(id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 14px',
                    border: 'none',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    textAlign: 'left',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon
                    size={17}
                    style={{ flexShrink: 0, color: '#9ca3af' }}
                  />
                  <span style={{ flex: 1 }}>
                    <span style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#fff' : '#ccc',
                      letterSpacing: '0.02em',
                    }}>{label}</span>
                    <span style={{
                      display: 'block',
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.35)',
                      marginTop: '1px',
                    }}>{desc}</span>
                  </span>
                  {active && (
                    <span style={{
                      width: '7px', height: '7px',
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 6px #4ade80',
                      flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Selector de capas estilo Google Maps (bottom-center) ─────────── */}
      <div style={{
        position: 'absolute',
        bottom: '28px',
        right: '12px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(10,12,20,0.80)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)',
      }}>

        {/* — Capa: Tráfico — */}
        <button
          onClick={toggleTraffic}
          title={trafficVisible ? 'Ocultar tráfico' : 'Mostrar tráfico'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          {/* Tile */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(30,34,48,0.9)',
            border: trafficVisible
              ? '2.5px solid #00C853'
              : '2px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            transition: 'border 0.2s ease, box-shadow 0.2s ease',
            boxShadow: trafficVisible
              ? '0 0 12px rgba(0,200,83,0.3)'
              : 'none',
            position: 'relative',
          }}>
            <Route size={20} color={trafficVisible ? '#00C853' : '#555'} />
            {/* Mini barras de color de tráfico */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {['#00C853','#FFD600','#FF6D00','#D50000'].map((c) => (
                <span key={c} style={{
                  width: '8px', height: '3px', borderRadius: '1px',
                  background: c,
                  opacity: trafficVisible ? 1 : 0.25,
                  transition: 'opacity 0.2s',
                }} />
              ))}
            </div>
            {/* Check activo */}
            {trafficVisible && (
              <div style={{
                position: 'absolute', top: '-6px', right: '-6px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#00C853',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 6px rgba(0,200,83,0.6)',
              }}>
                <Check size={11} color="#000" strokeWidth={3} />
              </div>
            )}
          </div>
          {/* Label */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: trafficVisible ? 700 : 400,
            color: trafficVisible ? '#00C853' : '#666',
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}>Tráfico</span>
        </button>

        {/* — Capa: Mapa de Calor — */}
        <button
          onClick={toggleHeatmap}
          title={heatmapVisible ? 'Ocultar mapa de calor' : 'Mostrar mapa de calor'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          {/* Tile */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            border: heatmapVisible
              ? '2.5px solid #FF5252'
              : '2px solid rgba(255,255,255,0.1)',
            transition: 'border 0.2s ease, box-shadow 0.2s ease',
            boxShadow: heatmapVisible
              ? '0 0 12px rgba(213,0,0,0.35)'
              : 'none',
            position: 'relative',
            background: 'rgba(30,34,48,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}>
            <Flame size={22} color={heatmapVisible ? '#FF5252' : '#555'} />
            {/* Mini gradiente */}
            <div style={{
              width: '36px', height: '5px', borderRadius: '3px',
              background: heatmapVisible
                ? 'linear-gradient(to right, #4169E1, #00C8C8, #FFD600, #FF6400, #D50000)'
                : 'linear-gradient(to right, #2a2a2a, #444)',
              transition: 'background 0.2s',
            }} />
            {/* Check activo */}
            {heatmapVisible && (
              <div style={{
                position: 'absolute', top: '-6px', right: '-6px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#FF5252',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 6px rgba(255,82,82,0.6)',
              }}>
                <Check size={11} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
          {/* Label */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: heatmapVisible ? 700 : 400,
            color: heatmapVisible ? '#FF5252' : '#666',
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}>Calor</span>
        </button>

      </div>
    </div>
  );
};

export default MapboxExample;

