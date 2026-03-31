import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Puerto Montt, Chile
const PUERTO_MONTT = { lng: -72.9376, lat: -41.4693 };

const MapboxExample = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [trafficReady, setTrafficReady] = useState(false);

  useEffect(() => {

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          theme: 'faded',
          lightPreset: 'night',
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
    });

    return () => mapRef.current.remove();
  }, []);

  // Sincroniza visibilidad cada vez que cambia trafficVisible
  useEffect(() => {
    if (!trafficReady || !mapRef.current) return;
    mapRef.current.setLayoutProperty(
      'traffic-layer',
      'visibility',
      trafficVisible ? 'visible' : 'none'
    );
  }, [trafficVisible, trafficReady]);

  const toggleTraffic = () => setTrafficVisible((v) => !v);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id="map" ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

      {/* Botón toggle tráfico */}
      <button
        onClick={toggleTraffic}
        title={trafficVisible ? 'Ocultar tráfico' : 'Mostrar tráfico'}
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.03em',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: trafficVisible
            ? 'rgba(0, 200, 83, 0.18)'
            : 'rgba(30, 30, 40, 0.65)',
          color: trafficVisible ? '#00C853' : '#aaaaaa',
          boxShadow: trafficVisible
            ? '0 0 0 1.5px #00C85380, 0 4px 16px rgba(0,200,83,0.2)'
            : '0 0 0 1.5px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.3)',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Indicador de color */}
        <span style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {['#00C853', '#FFD600', '#FF6D00', '#D50000'].map((c) => (
            <span key={c} style={{
              width: '18px',
              height: '3px',
              borderRadius: '2px',
              background: c,
              opacity: trafficVisible ? 1 : 0.35,
              transition: 'opacity 0.25s ease',
            }} />
          ))}
        </span>
        {trafficVisible ? 'Tráfico ON' : 'Tráfico OFF'}
      </button>
    </div>
  );
};

export default MapboxExample;
