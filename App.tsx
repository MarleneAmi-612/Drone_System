import React, { useState, useEffect, useRef } from 'react';
import { Drone, DroneStatus, Position } from './types';
import { CHARGING_STATIONS } from './constants';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import DetailPanel from './components/DetailPanel';
import AddDroneModal, { QueuedTask } from './components/AddDroneModal';
import RegisterDroneModal from './components/RegisterDroneModal';
import IncidentAlert from './components/IncidentAlert';
import DeliveryAlert from './components/DeliveryAlert';
import { findPathAStar, createGrid, simplifyPath, type Point } from './utils/pathfinding';

import { ThemeProvider, useTheme } from './components/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

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
    mission: 'Vigilancia de Trafico',
    client: 'Seguridad Publica Durango',
    waypointIndex: 0,
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
    waypointIndex: 0,
  },
  {
  id: 'DG-LOWBATTERY',
  model: 'Falcon-X',
  status: DroneStatus.WORKING,
  battery: 50,
  speed: 40,
  altitude: 110,
  position: { x: 250, y: 750 },
  destination: { x: 820, y: 180 },
  mission: 'Entrega de Paquete',
  client: 'Logistics MX',
  waypointIndex: 0,

},
{
  id: 'DG-INCIDENT',
  model: 'Falcon-X',
  status: DroneStatus.WORKING,
  battery: 80,
  speed: 40,
  altitude: 110,
  position: { x: 800, y: 200 },
  destination: { x: 479, y: 380 },
  mission: 'Paseando niños por los aires',
  client: 'Logistics MX',
  waypointIndex: 0,
  simulationType: "INCIDENT",
}
];

const MainAppContent: React.FC = () => {
  const { theme } = useTheme();
  const isCafe = theme === 'cafe';

  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES);
  const [taskQueue, setTaskQueue] = useState<QueuedTask[]>([]);
  const [taskToAssign, setTaskToAssign] = useState<QueuedTask | null>(null);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  const [activeIncident, setActiveIncident] = useState<Drone | null>(null);
  const [droneToEdit, setDroneToEdit] = useState<Drone | null>(null);
  const [deliveryAlerts, setDeliveryAlerts] = useState<Drone[]>([]);
  const [deliveredDrones, setDeliveredDrones] = useState<Set<string>>(new Set());
  const [dronePaths, setDronePaths] = useState<Record<string, Position[]>>({});
  const [dismissedIncidents, setDismissedIncidents] = useState<Set<string>>(new Set());
  
  const dronePathsRef = useRef<Record<string, Position[]>>({});
  const selectedDrone = drones.find(d => d.id === selectedDroneId) || null;
  const assignableDrones = drones.filter(d => d.status !== DroneStatus.INCIDENT && d.status !== DroneStatus.CHARGING);

  useEffect(() => {
    const GRID_RESOLUTION = 20;
    const gridWidth = Math.ceil(1000 / GRID_RESOLUTION);
    const gridHeight = Math.ceil(1000 / GRID_RESOLUTION);

    const obstacles: Point[] = [];
    for (const station of CHARGING_STATIONS) {
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const x = Math.floor((station.pos.x + i) / GRID_RESOLUTION);
          const y = Math.floor((station.pos.y + j) / GRID_RESOLUTION);
          if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            obstacles.push({ x, y });
          }
        }
      }
    }

    const grid = createGrid(gridWidth, gridHeight, obstacles);
    const newPaths: Record<string, Position[]> = {};

    for (const drone of drones) {
      if (drone.destination) {
        const startGrid: Point = {
          x: Math.floor(drone.position.x / GRID_RESOLUTION),
          y: Math.floor(drone.position.y / GRID_RESOLUTION),
        };
        const goalGrid: Point = {
          x: Math.floor(drone.destination.x / GRID_RESOLUTION),
          y: Math.floor(drone.destination.y / GRID_RESOLUTION),
        };

        const pathGrid = findPathAStar(startGrid, goalGrid, grid, false);
        if (pathGrid.length > 0) {
          const pathSimulation = pathGrid.map(p => ({
            x: p.x * GRID_RESOLUTION + GRID_RESOLUTION / 2,
            y: p.y * GRID_RESOLUTION + GRID_RESOLUTION / 2,
          }));
          newPaths[drone.id] = simplifyPath(pathSimulation, grid);
        } else {
          newPaths[drone.id] = [drone.position, drone.destination];
        }
      }
    }
    setDronePaths(newPaths);
    dronePathsRef.current = newPaths;
  }, [drones]);

  //CASOS DE SIMULACION

  useEffect(() => {
  const interval = setInterval(() => {
    setDrones(prevDrones =>
      prevDrones.map(drone => {

        //CHARGING
        if (drone.status === DroneStatus.CHARGING) {
          const time = drone.chargingTime ?? 0;

          if (time < 100) {
            return {
              ...drone,
              chargingTime: time + 1,
              mission: 'Cargando batería...'
            };
          }

          return {
            ...drone,
            battery: 100,
            status: DroneStatus.DEPLOYMENT,
            destination: drone.originalDestination ?? null,
            originalDestination: null,
            chargingTime: 0,
            speed: 40,
            mission: 'Retomando misión'
          };
        }

        // INCIDENT
        if (drone.status === DroneStatus.INCIDENT) {
          return {
            ...drone,
            battery: Math.max(0, drone.battery - 0.05)
          };
        }

        // LOW BATTERY espera y regresa
        if (drone.status === DroneStatus.LOW_BATTERY) {
          const time = drone.lowBatteryTime ?? 0;

          //espera 3 segundos
          if (time < 30) {
            return {
              ...drone,
              lowBatteryTime: time + 1,
              mission: ' Batería baja - evaluando retorno'
            };
          }

          // buscar estación más cercana
          let nearest = CHARGING_STATIONS[0];
          let minDist = Infinity;

          CHARGING_STATIONS.forEach(st => {
            const dist = Math.sqrt(
              Math.pow(st.pos.x - drone.position.x, 2) +
              Math.pow(st.pos.y - drone.position.y, 2)
            );
            if (dist < minDist) {
              minDist = dist;
              nearest = st;
            }
          });

          return {
            ...drone,
            status: DroneStatus.RETURNING,
            destination: nearest.pos,
            waypointIndex: 0,
            mission: 'Regresando a centro de carga'
          };
        }

        // MOVIMIENTO
        if (drone.destination) {
          const path = dronePathsRef.current[drone.id];
          const currentWaypointIndex = drone.waypointIndex ?? 0;

          let targetWaypoint =
            path && currentWaypointIndex < path.length
              ? path[currentWaypointIndex]
              : drone.destination;

          const dx = targetWaypoint.x - drone.position.x;
          const dy = targetWaypoint.y - drone.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 5) {
            if (path && currentWaypointIndex < path.length - 1) {
              return { ...drone, waypointIndex: currentWaypointIndex + 1 };
            } else {
              // LLEGADA A ESTACIÓN DE CARGA
              if (drone.status === DroneStatus.RETURNING) {
                return {
                  ...drone,
                  status: DroneStatus.CHARGING,
                  destination: null,
                  speed: 0,
                  altitude: 0,
                  waypointIndex: 0,
                  chargingTime: 0
                };
              }

              // ENTREGA NORMAL
              return {
                ...drone,
                status: DroneStatus.ARRIVED,
                destination: null,
                speed: 0,
                altitude: 0,
                waypointIndex: 0
              };
            }
          }

          const moveSpeed = 2.5;
          const nx = drone.position.x + (dx / dist) * moveSpeed;
          const ny = drone.position.y + (dy / dist) * moveSpeed;
          const newBattery = Math.max(0, drone.battery - 0.05);

          // SIMULACIÓN INCIDENTE
          if (
            drone.simulationType === 'INCIDENT' &&
            drone.battery < 35 &&
            drone.status !== DroneStatus.INCIDENT
          ) {
            return {
              ...drone,
              status: DroneStatus.INCIDENT,
              destination: null,
              speed: 0,
              incidentType: 'Pérdida de Comunicación'
            };
          }

          // DETECCIÓN BATERÍA BAJA 
          if (
            newBattery < 40 &&
            drone.status !== DroneStatus.RETURNING &&
            drone.status !== DroneStatus.CHARGING &&
            drone.status !== DroneStatus.LOW_BATTERY
          ) {
            return {
              ...drone,
              battery: newBattery,
              status: DroneStatus.LOW_BATTERY,
              speed: 0,
              destination: null,
              originalDestination: drone.destination,
              lowBatteryTime: 0,
              mission: 'Batería baja detectada',
              incidentType: 'Batería crítica'
            };
          }

          return {
            ...drone,
            position: { x: nx, y: ny },
            battery: newBattery
          };
        }

        return drone;
      })
    );
  }, 100);

  return () => clearInterval(interval);
}, []);

//........................

  useEffect(() => {
   const incident = drones.find(d => 
  (d.status === DroneStatus.INCIDENT || d.status === DroneStatus.LOW_BATTERY) &&
  !dismissedIncidents.has(d.id)
);
    if (incident && (!activeIncident || activeIncident.id !== incident.id)) {
      setActiveIncident(incident);
    } else if (!incident) {
      setActiveIncident(null);
    }
  }, [drones, activeIncident, dismissedIncidents]);

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

  const handleRegisterNewDrone = (newDrone: Drone) => {
    setDrones(prev => [...prev, newDrone]);
    setIsRegisterModalOpen(false);
  };

  const handleAddDrone = (newDrone: Drone, taskIdToRemove?: string) => {
    const exists = drones.some(d => d.id === newDrone.id);
    if (exists) {
      setDrones(prev => prev.map(d => d.id === newDrone.id ? { ...d, ...newDrone } : d));
    } else {
      setDrones(prev => [...prev, newDrone]);
    }
    
    if (taskIdToRemove) {
      setTaskQueue(prev => prev.filter(t => t.id !== taskIdToRemove));
    }
    
    setIsAddModalOpen(false);
    setDroneToEdit(null);
    setTaskToAssign(null);
  };

  const handleAddTaskToQueue = (task: QueuedTask) => {
    setTaskQueue(prev => [...prev, task]);
    setIsAddModalOpen(false);
  };

  const openAssignTaskModal = (task: QueuedTask) => {
    setTaskToAssign(task);
    setIsAddModalOpen(true);
  };

  const cancelMission = (id: string) => {
    setDrones(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: DroneStatus.RETURNING,
          destination: { x: 500, y: 500 },
          mission: 'Retornando a Base',
          waypointIndex: 0
        };
      }
      return d;
    }));
  };

  const sendToCharge = (id: string) => {
    
    setDrones(prev => prev.map(d => {
      if (d.id === id) {
        let nearest = CHARGING_STATIONS[0];
        let minDist = Infinity;
        CHARGING_STATIONS.forEach(st => {
          const dist = Math.sqrt(Math.pow(st.pos.x - d.position.x, 2) + Math.pow(st.pos.y - d.position.y, 2));
          if (dist < minDist) {
            minDist = dist;
            nearest = st;
          }
        });
        
        setDismissedIncidents(prevSet => {
          const newSet = new Set(prevSet);
          newSet.delete(id);
          return newSet;
        });

        return {
          ...d,
          status: DroneStatus.DEPLOYMENT,
          destination: nearest.pos,
          mission: `Cargando en ${nearest.name}`,
          waypointIndex: 0,
          originalDestination: d.originalDestination ?? d.destination,
        };
      }
      return d;
    }));
  };

  return (
    <div className={`flex h-screen w-screen min-h-0 min-w-0 overflow-hidden transition-colors duration-500 ease-in-out selection:bg-[#d4a373] selection:text-black ${isCafe ? 'bg-[#1a0f09]' : 'bg-[#f4efe1]'}`}>
      <ControlPanel 
        drones={drones}
        tasks={taskQueue} 
        onSelect={setSelectedDroneId} 
        selectedId={selectedDroneId} 
        onAddClick={() => setIsAddModalOpen(true)}
        onAssignTask={openAssignTaskModal}
      />

      <div className={`flex-1 relative border-l min-h-0 min-w-0 h-full ${isCafe ? 'border-[#5c4033]' : 'border-[#d4c3a3]'}`}>
        <MapView 
          drones={drones} 
          tasks={taskQueue}
          onDroneClick={setSelectedDroneId} 
          selectedDrone={selectedDrone}
          deliveredDrones={deliveredDrones}
          dronePaths={dronePaths}
        />
        
        <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-10">
          <div className="flex items-center gap-4">
            <div className={`p-1.5 rounded-full border shadow-md backdrop-blur-md ${isCafe ? 'bg-[#2b1a10]/80 border-[#5c4033]' : 'bg-white/80 border-[#d4c3a3]'}`}>
               <ThemeToggle />
            </div>

            <div className={`p-3 rounded-xl border shadow-xl backdrop-blur-md bg-opacity-90 ${isCafe ? 'bg-[#2b1a10] border-[#3d2b1f]' : 'bg-white border-[#e5dcc5]'}`}>
               <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isCafe ? 'text-white/60' : 'text-[#5c4033]/70'}`}>Unidades Activas</div>
               <div className={`text-2xl font-extrabold leading-none ${isCafe ? 'text-[#fefae0]' : 'text-[#2b1a10]'}`}>
                 {drones.filter(d => d.status !== DroneStatus.BASE).length} <span className="text-sm font-medium opacity-50">/ {drones.length}</span>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border shadow-lg transition-all active:scale-95 ${isCafe ? 'bg-[#d4a373]/10 border-[#d4a373] text-[#d4a373] hover:bg-[#d4a373] hover:text-black' : 'bg-[#bc8a5f]/10 border-[#bc8a5f] text-[#bc8a5f] hover:bg-[#bc8a5f] hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            ALTA DE UNIDAD
          </button>
        </div>

        {activeIncident && (
          <IncidentAlert 
            incident={activeIncident} 
            onClose={() => {
              setDismissedIncidents(prev => new Set([...prev, activeIncident.id]));
              setActiveIncident(null);
            }} 
          />
        )}
      </div>

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

      {deliveryAlerts.map(drone => (
        <DeliveryAlert key={drone.id} drone={drone} onClose={() => handleRemoveDeliveryAlert(drone.id)} />
      ))}

      {isAddModalOpen && (
        <AddDroneModal 
          onClose={() => {
            setIsAddModalOpen(false);
            setDroneToEdit(null);
            setTaskToAssign(null);
          }} 
          onAdd={handleAddDrone}
          onAddTask={handleAddTaskToQueue}
          drone={droneToEdit || undefined}
          taskToAssign={taskToAssign}
          availableDrones={assignableDrones}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterDroneModal 
          onClose={() => setIsRegisterModalOpen(false)}
          onRegister={handleRegisterNewDrone}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
};

export default App;