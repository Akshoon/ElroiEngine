import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import heatmapData from './data/data_heat_map.geojson';
import { Route, Flame, Check } from 'lucide-react';

// Puerto Montt, Chile
const PUERTO_MONTT = { lng: -72.9376, lat: -41.4693 };

const getLightPreset = () => {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 8)  return 'dawn';
  if (hour >= 8  && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
};

const MapboxExample = ({ presetMode = 'dusk' }) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [trafficReady,   setTrafficReady]   = useState(false);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [heatmapReady,   setHeatmapReady]   = useState(false);
  const [mapReady,       setMapReady]        = useState(false);
  const presetModeRef = useRef(presetMode);

  // Sync ref when prop changes
  useEffect(() => {
    presetModeRef.current = presetMode;
  }, [presetMode]);

  // Apply preset to map when prop changes (once map is ready)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const preset = presetMode === 'auto' ? getLightPreset() : presetMode;
    mapRef.current.setConfigProperty('basemap', 'lightPreset', preset);
  }, [presetMode, mapReady]);

  // Map initialization
  useEffect(() => {
    const initialPreset = presetMode === 'auto' ? getLightPreset() : presetMode;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          theme: 'faded',
          lightPreset: initialPreset,
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

      // ── Traffic ──────────────────────────────────────────────────────────
      mapRef.current.addSource('mapbox-traffic', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1',
      });

      mapRef.current.addLayer({
        id: 'traffic-layer',
        slot: 'middle',
        type: 'line',
        source: 'mapbox-traffic',
        'source-layer': 'traffic',
        minzoom: 0,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: 'visible',
        },
        paint: {
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.5, 14, 3, 18, 6],
          'line-color': [
            'match', ['get', 'congestion'],
            'low',      '#00C853',
            'moderate', '#FFD600',
            'heavy',    '#FF6D00',
            'severe',   '#D50000',
            '#aaaaaa',
          ],
          'line-opacity': 0.85,
        },
      });

      setTrafficReady(true);

      // ── 3D Buildings ─────────────────────────────────────────────────────
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
                'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.6,
            },
          },
          labelLayerId
        );
      }

      // ── Heatmap ───────────────────────────────────────────────────────────
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
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensidad'], 1, 0.1, 10, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 18, 4],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 20, 15, 50, 18, 80],
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
      setMapReady(true);
    });

    // ── Auto clock interval ───────────────────────────────────────────────
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync traffic visibility
  useEffect(() => {
    if (!trafficReady || !mapRef.current) return;
    mapRef.current.setLayoutProperty(
      'traffic-layer', 'visibility', trafficVisible ? 'visible' : 'none'
    );
  }, [trafficVisible, trafficReady]);

  // Sync heatmap visibility
  useEffect(() => {
    if (!heatmapReady || !mapRef.current) return;
    mapRef.current.setLayoutProperty(
      'heatmap-layer', 'visibility', heatmapVisible ? 'visible' : 'none'
    );
  }, [heatmapVisible, heatmapReady]);

  const toggleTraffic = () => setTrafficVisible((v) => !v);
  const toggleHeatmap = () => setHeatmapVisible((v) => !v);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id="map" ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

      {/* ── Selector de capas (bottom-right) ─────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '28px', right: '12px', zIndex: 10,
        display: 'flex', alignItems: 'flex-end', gap: '8px',
        padding: '10px 14px', borderRadius: '16px',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(10,12,20,0.80)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)',
      }}>

        {/* Tráfico */}
        <button onClick={toggleTraffic} title={trafficVisible ? 'Ocultar tráfico' : 'Mostrar tráfico'}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
            background:'none', border:'none', cursor:'pointer', padding:'0' }}>
          <div style={{
            width:'56px', height:'56px', borderRadius:'12px', background:'rgba(30,34,48,0.9)',
            border: trafficVisible ? '2.5px solid #00C853' : '2px solid rgba(255,255,255,0.1)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'3px',
            transition:'border 0.2s ease, box-shadow 0.2s ease', position:'relative',
            boxShadow: trafficVisible ? '0 0 12px rgba(0,200,83,0.3)' : 'none',
          }}>
            <Route size={20} color={trafficVisible ? '#00C853' : '#555'} />
            <div style={{ display:'flex', gap:'2px' }}>
              {['#00C853','#FFD600','#FF6D00','#D50000'].map((c) => (
                <span key={c} style={{ width:'8px', height:'3px', borderRadius:'1px',
                  background:c, opacity: trafficVisible ? 1 : 0.25, transition:'opacity 0.2s' }} />
              ))}
            </div>
            {trafficVisible && (
              <div style={{ position:'absolute', top:'-6px', right:'-6px',
                width:'18px', height:'18px', borderRadius:'50%',
                background:'#00C853', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 6px rgba(0,200,83,0.6)' }}>
                <Check size={11} color="#000" strokeWidth={3} />
              </div>
            )}
          </div>
          <span style={{ fontFamily:'Inter,sans-serif', fontSize:'11px',
            fontWeight: trafficVisible ? 700 : 400,
            color: trafficVisible ? '#00C853' : '#666',
            letterSpacing:'0.02em', transition:'color 0.2s' }}>Tráfico</span>
        </button>

        {/* Calor */}
        <button onClick={toggleHeatmap} title={heatmapVisible ? 'Ocultar mapa de calor' : 'Mostrar mapa de calor'}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
            background:'none', border:'none', cursor:'pointer', padding:'0' }}>
          <div style={{
            width:'56px', height:'56px', borderRadius:'12px', background:'rgba(30,34,48,0.9)',
            border: heatmapVisible ? '2.5px solid #FF5252' : '2px solid rgba(255,255,255,0.1)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'5px',
            transition:'border 0.2s ease, box-shadow 0.2s ease', position:'relative',
            boxShadow: heatmapVisible ? '0 0 12px rgba(213,0,0,0.35)' : 'none',
          }}>
            <Flame size={22} color={heatmapVisible ? '#FF5252' : '#555'} />
            <div style={{ width:'36px', height:'5px', borderRadius:'3px',
              background: heatmapVisible
                ? 'linear-gradient(to right, #4169E1, #00C8C8, #FFD600, #FF6400, #D50000)'
                : 'linear-gradient(to right, #2a2a2a, #444)',
              transition:'background 0.2s' }} />
            {heatmapVisible && (
              <div style={{ position:'absolute', top:'-6px', right:'-6px',
                width:'18px', height:'18px', borderRadius:'50%',
                background:'#FF5252', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 6px rgba(255,82,82,0.6)' }}>
                <Check size={11} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
          <span style={{ fontFamily:'Inter,sans-serif', fontSize:'11px',
            fontWeight: heatmapVisible ? 700 : 400,
            color: heatmapVisible ? '#FF5252' : '#666',
            letterSpacing:'0.02em', transition:'color 0.2s' }}>Calor</span>
        </button>
      </div>
    </div>
  );
};

export default MapboxExample;
