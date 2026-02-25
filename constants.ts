
import { ChargingStation, MapDistrict } from './types';

export const COLORS = {
  bg: 'bg-[#2b1a10]', // Deep dark brown
  panel: 'bg-[#3d2b1f]', // Medium brown
  border: 'border-[#5c4033]', // Bronze brown
  accent: 'text-[#d4a373]', // Tan/Gold
  accentBg: 'bg-[#d4a373]',
  text: 'text-[#fefae0]', // Cream
  warning: 'text-[#9c4a1a]', // Burnt orange/brown for warnings
  danger: 'bg-[#632a0d]', // Dark reddish brown
};

export const CHARGING_STATIONS: ChargingStation[] = [
  { id: 'CS1', name: 'Plaza de Armas', pos: { x: 500, y: 500 } },
  { id: 'CS2', name: 'Parque Guadiana', pos: { x: 300, y: 450 } },
  { id: 'CS3', name: 'Teleférico Base', pos: { x: 550, y: 400 } },
  { id: 'CS4', name: 'Ciudad Industrial', pos: { x: 800, y: 300 } },
  { id: 'CS5', name: 'Paseo Durango', pos: { x: 700, y: 600 } },
];

export const DURANGO_DISTRICTS: MapDistrict[] = [
  { id: 'D1', name: 'Centro Histórico', points: '450,450 550,450 550,550 450,550' },
  { id: 'D2', name: 'Lomas del Parque', points: '200,400 400,350 400,500 250,550' },
  { id: 'D3', name: 'Colonia Esperanza', points: '600,200 800,250 750,450 600,400' },
  { id: 'D4', name: 'Feria Nacional', points: '100,700 300,750 250,900 100,850' },
  { id: 'D5', name: 'Villas del Poniente', points: '100,100 300,150 250,300 100,250' },
];
