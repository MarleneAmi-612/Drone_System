
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Drone, DroneStatus, Position } from './types';
import { COLORS, CHARGING_STATIONS } from './constants';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import DetailPanel from './components/DetailPanel';
import AddDroneModal from './components/AddDroneModal';
import IncidentAlert from './components/IncidentAlert';
import DeliveryAlert from './components/DeliveryAlert';

const INITIAL_DRONES: Drone[] = [
  {
    id: 'DG-001',
    model: 'SkyScout X4',
    status: DroneStatus.WORKING,
    battery: 85,
    speed: 45,
    altitude: 120,
    position: { x: 480, y: 520 },
    destination: { x: 750, y: 300 },
    mission: 'Traffic Surveillance',
    client: 'Durango Public Safety',
  },
  {
    id: 'DG-002',
    model: 'EagleEye-Z',
    status: DroneStatus.BASE,
    battery: 100,
    speed: 0,
    altitude: 0,
    position: { x: 500, y: 500 },
    destination: null,
    mission: 'Standby',
    client: 'Logistics MX',
  },
  {
    id: 'DG-003',
    model: 'Raven-9',
    status: DroneStatus.INCIDENT,
    battery: 5,
    speed: 12,
    altitude: 15,
    position: { x: 250, y: 700 },
    destination: null,
    mission: 'Perimeter Check',
    client: 'Private Security Inc.',
    incidentType: 'Critical Battery / Signal Loss',
  }
];

const App: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeIncident, setActiveIncident] = useState<Drone | null>(null);
  const [droneToEdit, setDroneToEdit] = useState<Drone | null>(null);
  const [deliveryAlerts, setDeliveryAlerts] = useState<Drone[]>([]);
  const [deliveredDrones, setDeliveredDrones] = useState<Set<string>>(new Set());

  const selectedDrone = drones.find(d => d.id === selectedDroneId) || null;

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prevDrones => prevDrones.map(drone => {
        if (drone.status === DroneStatus.BASE || drone.status === DroneStatus.CHARGING) {
          if (drone.status === DroneStatus.CHARGING) {
             const newBattery = Math.min(100, drone.battery + 0.5);
             return { ...drone, battery: newBattery, status: newBattery === 100 ? DroneStatus.BASE : DroneStatus.CHARGING };
          }
          return drone;
        }

        if (drone.status === DroneStatus.INCIDENT) {
           return { ...drone, battery: Math.max(0, drone.battery - 0.05) };
        }

        // Logic for movement towards destination
        if (drone.destination) {
          const dx = drone.destination.x - drone.position.x;
          const dy = drone.destination.y - drone.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 5) {
            // Arrived
            if (drone.status === DroneStatus.RETURNING) {
              return { ...drone, status: DroneStatus.BASE, destination: null, speed: 0, altitude: 0, position: drone.destination };
            }
            return { ...drone, status: DroneStatus.ARRIVED, destination: null, speed: 0, altitude: 0, position: drone.destination };
          }

          // Move
          const moveSpeed = 2.5;
          const nx = drone.position.x + (dx / dist) * moveSpeed;
          const ny = drone.position.y + (dy / dist) * moveSpeed;
          const newBattery = Math.max(0, drone.battery - 0.05);
          
          // Fix: Explicitly type nextStatus as DroneStatus to prevent TypeScript from narrowing its type 
          // based on previous if checks, which would otherwise exclude DroneStatus.INCIDENT.
          let nextStatus: DroneStatus = drone.status;
          if (newBattery < 10) nextStatus = DroneStatus.INCIDENT;

          return {
            ...drone,
            position: { x: nx, y: ny },
            battery: newBattery,
            status: nextStatus,
            incidentType: newBattery < 10 ? 'Critical Battery' : drone.incidentType
          };
        }

        return drone;
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Monitor incidents
  useEffect(() => {
    const incident = drones.find(d => d.status === DroneStatus.INCIDENT);
    if (incident && (!activeIncident || activeIncident.id !== incident.id)) {
      setActiveIncident(incident);
    } else if (!incident) {
      setActiveIncident(null);
    }
  }, [drones, activeIncident]);

  // Monitor deliveries
  useEffect(() => {
    drones.forEach(drone => {
      if (drone.status === DroneStatus.ARRIVED && !deliveredDrones.has(drone.id)) {
        setDeliveryAlerts(prev => [...prev, drone]);
        setDeliveredDrones(prev => new Set([...prev, drone.id]));
      }
    });
  }, [drones, deliveredDrones]);

  const handleRemoveDeliveryAlert = (droneId: string) => {
    setDeliveryAlerts(prev => prev.filter(d => d.id !== droneId));
  };

  const handleAddDrone = (newDrone: Drone) => {
    if (droneToEdit) {
      // Update existing drone
      setDrones(prev => prev.map(d => d.id === newDrone.id ? newDrone : d));
      setDroneToEdit(null);
    } else {
      // Add new drone
      setDrones(prev => [...prev, newDrone]);
    }
    setIsAddModalOpen(false);
  };

  const cancelMission = (id: string) => {
    setDrones(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: DroneStatus.RETURNING,
          destination: { x: 500, y: 500 }, // Return to base (Plaza de Armas)
          mission: 'Returning to Base'
        };
      }
      return d;
    }));
  };

  const sendToCharge = (id: string) => {
    setDrones(prev => prev.map(d => {
      if (d.id === id) {
        // Find nearest station
        let nearest = CHARGING_STATIONS[0];
        let minDist = Infinity;
        CHARGING_STATIONS.forEach(st => {
          const dist = Math.sqrt(Math.pow(st.pos.x - d.position.x, 2) + Math.pow(st.pos.y - d.position.y, 2));
          if (dist < minDist) {
            minDist = dist;
            nearest = st;
          }
        });
        
        return {
          ...d,
          status: DroneStatus.DEPLOYMENT,
          destination: nearest.pos,
          mission: `Charging at ${nearest.name}`
        };
      }
      return d;
    }));
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${COLORS.bg} selection:bg-[#d4a373] selection:text-black`}>
      {/* Sidebar Control Panel */}
      <ControlPanel 
        drones={drones} 
        onSelect={setSelectedDroneId} 
        selectedId={selectedDroneId} 
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* Main Map View */}
      <div className="flex-1 relative border-l border-[#5c4033]">
        <MapView 
          drones={drones} 
          onDroneClick={setSelectedDroneId} 
          selectedDrone={selectedDrone}
          deliveredDrones={deliveredDrones}
        />
        
        {/* Global Stats Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
          <div className={`${COLORS.panel} p-3 rounded border border-[#5c4033] shadow-xl backdrop-blur-sm bg-opacity-80`}>
             <div className="text-xs opacity-60 uppercase tracking-widest mb-1">Active Drones</div>
             <div className="text-2xl font-bold">{drones.filter(d => d.status !== DroneStatus.BASE).length} / {drones.length}</div>
          </div>
        </div>

        {/* Floating Incident Alert */}
        {activeIncident && (
          <IncidentAlert incident={activeIncident} onClose={() => setActiveIncident(null)} />
        )}
      </div>

      {/* Detail Panel Popup-style or Slide-in */}
      {selectedDrone && (
        <DetailPanel 
          drone={selectedDrone} 
          onClose={() => setSelectedDroneId(null)}
          onCancel={() => cancelMission(selectedDrone.id)}
          onCharge={() => sendToCharge(selectedDrone.id)}
          onEdit={(drone) => {
            setDroneToEdit(drone);
            setIsAddModalOpen(true);
          }}
        />
      )}

      {/* Delivery Alerts */}
      {deliveryAlerts.map(drone => (
        <DeliveryAlert 
          key={drone.id} 
          drone={drone} 
          onClose={() => handleRemoveDeliveryAlert(drone.id)}
        />
      ))}

      {/* Modals */}
      {isAddModalOpen && (
        <AddDroneModal 
          onClose={() => {
            setIsAddModalOpen(false);
            setDroneToEdit(null);
          }} 
          onAdd={handleAddDrone}
          drone={droneToEdit || undefined}
        />
      )}
    </div>
  );
};

export default App;
