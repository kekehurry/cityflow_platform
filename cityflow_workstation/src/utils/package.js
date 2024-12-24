import useSWR from 'swr';

export const mapPackages = {
  react: () => import('react'),
  '@mui/material': () => import('@mui/material'),
  '@mui/icons-material': () => import('@mui/icons-material'),
  '@mui/lab': () => import('@mui/lab'),
  '@mui/x-data-grid': () => import('@mui/x-data-grid'),
  'mui-color-input': () => import('mui-color-input'),
  nanoid: () => import('nanoid'),
  lodash: () => import('lodash'),
  '@turf/turf': () => import('@turf/turf'),
  'deck.gl': () => import('deck.gl'),
  '@deck.gl/react': () => import('@deck.gl/react'),
  '@deck.gl/core': () => import('@deck.gl/core'),
  '@deck.gl/layers': () => import('@deck.gl/layers'),
  '@deck.gl/geo-layers': () => import('@deck.gl/geo-layers'),
  'mapbox-gl/dist/mapbox-gl.css': () => import('mapbox-gl/dist/mapbox-gl.css'),
  'mapbox-gl': () => import('mapbox-gl'),
  'react-map-gl': () => import('react-map-gl'),
  d3: () => import('d3'),
  // '@d3/color-legend': () => import('@/utils/@d3/color-legend'),
  three: () => import('three'),
  '@react-three/cannon': () => import('@react-three/cannon'),
  '@react-three/drei': () => import('@react-three/drei'),
  '@react-three/fiber': () => import('@react-three/fiber'),
  '@react-three/rapier': () => import('@react-three/rapier'),
  constants: () => ({ mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN }),
};

export const preloadModules = async () => {
  const preloadedModules = {};
  for (const key in mapPackages) {
    if (mapPackages.hasOwnProperty(key)) {
      const module = await mapPackages[key]();
      preloadedModules[key] = module.default || module;
    }
  }
  return preloadedModules;
};

export const usePreloadedModules = () => {
  const { data, error } = useSWR('preloadModules', preloadModules);

  return {
    modules: data,
    isLoading: !error && !data,
    error: error,
  };
};
