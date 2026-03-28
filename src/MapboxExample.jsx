import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Puerto Montt, Chile
const PUERTO_MONTT = { lng: -72.9376, lat: -41.4693 };

const MapboxExample = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          theme: 'faded',
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
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    });

    return () => mapRef.current.remove();
  }, []);

  return <div id="map" ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapboxExample;
