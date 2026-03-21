import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Drone, DroneStatus, Position } from './types';
import { CHARGING_STATIONS } from './constants';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import DetailPanel from './components/DetailPanel';
import AddDroneModal, { QueuedTask } from './components/AddDroneModal';
import RegisterDroneModal from './components/RegisterDroneModal';
import IncidentAlert from './components/IncidentAlert';
import DeliveryAlert from './components/DeliveryAlert';
import MonitoringPanel from './components/MonitoringPanel';
import IncidentHistoryModal, { IncidentRecord } from './components/IncidentHistoryModal';
import { findPathAStar, createGrid, simplifyPath, type Point } from './utils/pathfinding';
import {
  fetchDrones,
  fetchIncidents,
  fetchTasks,
  registerDrone,
  updateDrone,
  deleteDrone,
  createIncident,
  resolveIncidentsByDrone,
  createTask,
  deleteTask,
  createAlarm,
  resolveAlarmsByDrone,
} from './utils/api';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

const MainAppContent: React.FC = () => {
  const { theme } = useTheme();
  const isCafe = theme === 'cafe';

  const [drones, setDrones] = useState<Drone[]>([]);
  const [taskQueue, setTaskQueue] = useState<QueuedTask[]>([]);
  const [taskToAssign, setTaskToAssign] = useState<QueuedTask | null>(null);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showMonitoringPanel, setShowMonitoringPanel] = useState(true);

  const [incidentHistory, setIncidentHistory] = useState<IncidentRecord[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [activeIncident, setActiveIncident] = useState<Drone | null>(null);
  const [droneToEdit, setDroneToEdit] = useState<Drone | null>(null);
  const [deliveryAlerts, setDeliveryAlerts] = useState<Drone[]>([]);
  const [deliveredDrones, setDeliveredDrones] = useState<Set<string>>(new Set());
  const [dronePaths, setDronePaths] = useState<Record<string, Position[]>>({});
  const [dismissedIncidents, setDismissedIncidents] = useState<Set<string>>(new Set());
  const [dbReady, setDbReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const dronePathsRef = useRef<Record<string, Position[]>>({});
  const dronesRef = useRef<Drone[]>([]);
  dronesRef.current = drones;

  const selectedDrone = drones.find(d => d.id === selectedDroneId) || null;
  const assignableDrones = drones.filter(d => d.status !== DroneStatus.INCIDENT && d.status !== DroneStatus.CHARGING);
  const activeAlarms = drones.filter(d =>
    [DroneStatus.INCIDENT, DroneStatus.LOW_BATTERY, DroneStatus.LOST_COMMUNICATION, DroneStatus.OFF_COURSE].includes(d.status)
  );

  useEffect(() => {
    async function loadFromDB() {
      try {
        const [dbDrones, dbIncidents, dbTasks] = await Promise.all([
          fetchDrones(),
          fetchIncidents(),
          fetchTasks(),
        ]);
        setDrones(dbDrones);
        if (dbIncidents.length > 0) setIncidentHistory(dbIncidents);
        if (dbTasks.length > 0) setTaskQueue(dbTasks);
      } catch {
        // backend no disponible
      } finally {
        setDbReady(true);
        setLoading(false);
      }
    }
    loadFromDB();
  }, []);

  const syncToDB = useCallback(async () => {
    if (!dbReady) return;
    await Promise.all(
      dronesRef.current.map(drone =>
        updateDrone(drone).catch(async (err: Error) => {
          if (err.message.includes('404') || err.message.includes('not found')) {
            return registerDrone(drone).catch(() => null);
          }
          return null;
        })
      )
    );
  }, [dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    const interval = setInterval(syncToDB, 10000);
    return () => clearInterval(interval);
  }, [dbReady, syncToDB]);

  const prevAlarmsLength = useRef(activeAlarms.length);
  useEffect(() => {
    if (activeAlarms.length > prevAlarmsLength.current) setShowMonitoringPanel(true);
    prevAlarmsLength.current = activeAlarms.length;
  }, [activeAlarms.length]);

  const prevStatuses = useRef<Record<string, DroneStatus>>({});
  useEffect(() => {
    const newEntries: IncidentRecord[] = [];
    const resolvedDrones: string[] = [];

    drones.forEach(drone => {
      const prevStatus = prevStatuses.current[drone.id];
      const isIncident = [DroneStatus.INCIDENT, DroneStatus.LOW_BATTERY, DroneStatus.LOST_COMMUNICATION, DroneStatus.OFF_COURSE].includes(drone.status);
      const wasIncident = prevStatus && [DroneStatus.INCIDENT, DroneStatus.LOW_BATTERY, DroneStatus.LOST_COMMUNICATION, DroneStatus.OFF_COURSE].includes(prevStatus);

      if (isIncident && prevStatus !== drone.status) {
        const record: IncidentRecord = {
          id: `INC-${Date.now()}-${drone.id}`,
          droneId: drone.id,
          type: drone.status,
          timestamp: Date.now(),
          status: 'ACTIVE',
          details: drone.mission,
        };
        newEntries.push(record);
        if (dbReady) {
          createIncident(record).catch(() => null);
          createAlarm(drone.id, drone.status, drone.mission).catch(() => null);
        }
      } else if (!isIncident && wasIncident) {
        resolvedDrones.push(drone.id);
        if (dbReady) {
          resolveIncidentsByDrone(drone.id).catch(() => null);
          resolveAlarmsByDrone(drone.id).catch(() => null);
        }
      }

      prevStatuses.current[drone.id] = drone.status;
    });

    if (newEntries.length > 0 || resolvedDrones.length > 0) {
      setIncidentHistory(prev => {
        const updated = prev.map(r =>
          resolvedDrones.includes(r.droneId) && r.status === 'ACTIVE'
            ? { ...r, status: 'RESOLVED' as const }
            : r
        );
        return [...newEntries, ...updated].sort((a, b) => b.timestamp - a.timestamp);
      });
    }
  }, [drones, dbReady]);

  useEffect(() => {
    if (drones.length === 0) return;
    const GRID_RESOLUTION = 20;
    const gridWidth = Math.ceil(1000 / GRID_RESOLUTION);
    const gridHeight = Math.ceil(1000 / GRID_RESOLUTION);
    const obstacles: Point[] = [];

    for (const station of CHARGING_STATIONS) {
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const x = Math.floor((station.pos.x + i) / GRID_RESOLUTION);
          const y = Math.floor((station.pos.y + j) / GRID_RESOLUTION);
          if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) obstacles.push({ x, y });
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
          const pathSim = pathGrid.map(p => ({
            x: p.x * GRID_RESOLUTION + GRID_RESOLUTION / 2,
            y: p.y * GRID_RESOLUTION + GRID_RESOLUTION / 2,
          }));
          newPaths[drone.id] = simplifyPath(pathSim, grid);
        } else {
          newPaths[drone.id] = [drone.position, drone.destination];
        }
      }
    }
    setDronePaths(newPaths);
    dronePathsRef.current = newPaths;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(drones.map(d => ({ id: d.id, dest: d.destination, status: d.status })))]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prevDrones =>
        prevDrones.map(drone => {
          if (drone.status === DroneStatus.CHARGING) {
            const time = drone.chargingTime ?? 0;
            if (time < 100) return { ...drone, chargingTime: time + 1, mission: 'Cargando batería...' };
            return {
              ...drone, battery: 100, status: DroneStatus.DEPLOYMENT,
              destination: drone.originalDestination ?? null,
              originalDestination: null, chargingTime: 0,
              speed: 40, mission: 'Retomando misión',
            };
          }

          if (drone.status === DroneStatus.LOST_COMMUNICATION) {
            return { ...drone, battery: Math.max(0, drone.battery - 0.08), mission: 'SIN COMUNICACIÓN - Búsqueda activa', altitude: Math.max(0, drone.altitude - 0.5) };
          }

          if (drone.status === DroneStatus.OFF_COURSE) {
            const angle = Math.random() * Math.PI * 2;
            return {
              ...drone,
              position: { x: drone.position.x + Math.cos(angle) * 3, y: drone.position.y + Math.sin(angle) * 3 },
              battery: Math.max(0, drone.battery - 0.07),
              mission: 'DESVIADO - Fuera de ruta',
            };
          }

          if (drone.status === DroneStatus.LOW_BATTERY) {
            const time = drone.lowBatteryTime ?? 0;
            if (time < 30) return { ...drone, lowBatteryTime: time + 1, mission: 'Batería baja - evaluando retorno' };
            let nearest = CHARGING_STATIONS[0];
            let minDist = Infinity;
            CHARGING_STATIONS.forEach(st => {
              const dist = Math.sqrt(Math.pow(st.pos.x - drone.position.x, 2) + Math.pow(st.pos.y - drone.position.y, 2));
              if (dist < minDist) { minDist = dist; nearest = st; }
            });
            return { ...drone, status: DroneStatus.RETURNING, destination: nearest.pos, waypointIndex: 0, mission: 'Regresando a centro de carga' };
          }

          if (drone.destination) {
            const path = dronePathsRef.current[drone.id];
            const currentWaypointIndex = drone.waypointIndex ?? 0;
            const targetWaypoint = path && currentWaypointIndex < path.length ? path[currentWaypointIndex] : drone.destination;
            const dx = targetWaypoint.x - drone.position.x;
            const dy = targetWaypoint.y - drone.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
              if (path && currentWaypointIndex < path.length - 1) {
                return { ...drone, waypointIndex: currentWaypointIndex + 1 };
              }
              if (drone.status === DroneStatus.RETURNING) {
                return { ...drone, status: DroneStatus.CHARGING, destination: null, speed: 0, altitude: 0, waypointIndex: 0, chargingTime: 0 };
              }
              return { ...drone, status: DroneStatus.ARRIVED, destination: null, speed: 0, altitude: 0, waypointIndex: 0 };
            }

            const moveSpeed = 2.5;
            const nx = drone.position.x + (dx / dist) * moveSpeed;
            const ny = drone.position.y + (dy / dist) * moveSpeed;
            const newBattery = Math.max(0, drone.battery - 0.05);

            if (newBattery < 20 && drone.status !== DroneStatus.RETURNING && drone.status !== DroneStatus.CHARGING && drone.status !== DroneStatus.LOW_BATTERY) {
              return {
                ...drone, battery: newBattery, status: DroneStatus.LOW_BATTERY, speed: 0,
                destination: null, originalDestination: drone.destination,
                lowBatteryTime: 0, mission: 'Batería baja detectada', incidentType: 'Batería crítica',
              };
            }

            return { ...drone, position: { x: nx, y: ny }, battery: newBattery };
          }

          return drone;
        })
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const incident = drones.find(d =>
      (d.status === DroneStatus.INCIDENT || d.status === DroneStatus.LOW_BATTERY ||
        d.status === DroneStatus.OFF_COURSE || d.status === DroneStatus.LOST_COMMUNICATION) &&
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

  const handleRemoveDeliveryAlert = (droneId: string) =>
    setDeliveryAlerts(prev => prev.filter(d => d.id !== droneId));

  const handleRegisterNewDrone = async (newDrone: Drone) => {
    try {
      await registerDrone(newDrone);
      setDrones(prev => [...prev, newDrone]);
    } catch (err) {
      console.error('[API] registerDrone failed:', err);
    }
    setIsRegisterModalOpen(false);
  };

  const handleAddDrone = async (newDrone: Drone, taskIdToRemove?: string) => {
    const exists = drones.some(d => d.id === newDrone.id);
    if (exists) {
      setDrones(prev => prev.map(d => d.id === newDrone.id ? { ...d, ...newDrone } : d));
      await updateDrone(newDrone).catch(() => null);
    } else {
      setDrones(prev => [...prev, newDrone]);
      await registerDrone(newDrone).catch(() => null);
    }
    if (taskIdToRemove) {
      setTaskQueue(prev => prev.filter(t => t.id !== taskIdToRemove));
      await deleteTask(taskIdToRemove).catch(() => null);
    } else if (newDrone.destination) {
      const missionTask = {
        id: `TSK-${Date.now()}-${newDrone.id}`,
        mission: newDrone.mission,
        destination: newDrone.destination,
        priority: 'Media' as const,
        client: newDrone.client,
        timestamp: Date.now(),
      };
      try {
        await createTask(missionTask);
      } catch (err) {
        console.error('[API] createTask failed:', err);
      }
    }
    setIsAddModalOpen(false);
    setDroneToEdit(null);
    setTaskToAssign(null);
  };

  const handleAddTaskToQueue = async (task: QueuedTask) => {
    setTaskQueue(prev => [...prev, task]);
    try {
      await createTask(task);
    } catch (err) {
      console.error('[API] createTask failed:', err);
    }
    setIsAddModalOpen(false);
  };

  const openAssignTaskModal = (task: QueuedTask) => { setTaskToAssign(task); setIsAddModalOpen(true); };

  const cancelMission = (id: string) => {
    setDrones(prev => prev.map(d => {
      if (d.id !== id) return d;
      return { ...d, status: DroneStatus.RETURNING, destination: { x: 500, y: 500 }, mission: 'Retornando a Base', waypointIndex: 0 };
    }));
  };

  const sendToCharge = (id: string) => {
    setDrones(prev => prev.map(d => {
      if (d.id !== id) return d;
      let nearest = CHARGING_STATIONS[0];
      let minDist = Infinity;
      CHARGING_STATIONS.forEach(st => {
        const dist = Math.sqrt(Math.pow(st.pos.x - d.position.x, 2) + Math.pow(st.pos.y - d.position.y, 2));
        if (dist < minDist) { minDist = dist; nearest = st; }
      });
      setDismissedIncidents(prevSet => { const s = new Set(prevSet); s.delete(id); return s; });
      return { ...d, status: DroneStatus.DEPLOYMENT, destination: nearest.pos, mission: `Cargando en ${nearest.name}`, waypointIndex: 0, originalDestination: d.originalDestination ?? d.destination };
    }));
  };

  if (loading) {
    return (
      <div className={`flex h-screen w-screen items-center justify-center ${isCafe ? 'bg-[#1a0f09]' : 'bg-[#f4efe1]'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${isCafe ? 'border-[#d4a373]' : 'border-[#bc8a5f]'}`} />
          <p className={`text-sm font-bold tracking-widest uppercase ${isCafe ? 'text-[#d4a373]' : 'text-[#bc8a5f]'}`}>Conectando con el sistema...</p>
        </div>
      </div>
    );
  }

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

        {showMonitoringPanel && (
          <MonitoringPanel
            alarms={activeAlarms}
            onSelectAlarm={setSelectedDroneId}
            onClose={() => setShowMonitoringPanel(false)}
          />
        )}

        <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-10">
          <div className="flex items-center gap-4">
            {!showMonitoringPanel && (
              <button
                onClick={() => setShowMonitoringPanel(true)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border shadow-lg transition-all active:scale-95 ${
                  activeAlarms.length > 0
                    ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                    : isCafe ? 'bg-[#1a0f09]/80 border-[#5c4033] text-[#d4a373] hover:bg-white/10' : 'bg-white/80 border-[#d4c3a3] text-[#bc8a5f] hover:bg-black/5'
                }`}
              >
                <svg className={`w-4 h-4 ${activeAlarms.length > 0 ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                VER ALARMAS
                {activeAlarms.length > 0 && (
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] leading-none ml-1">
                    {activeAlarms.length}
                  </span>
                )}
              </button>
            )}

            <div className={`p-1.5 rounded-full border shadow-md backdrop-blur-md ${isCafe ? 'bg-[#2b1a10]/80 border-[#5c4033]' : 'bg-white/80 border-[#d4c3a3]'}`}>
              <ThemeToggle />
            </div>

            <div className={`p-3 rounded-xl border shadow-xl backdrop-blur-md bg-opacity-90 ${isCafe ? 'bg-[#2b1a10] border-[#3d2b1f]' : 'bg-white border-[#e5dcc5]'}`}>
              <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isCafe ? 'text-white/60' : 'text-[#5c4033]/70'}`}>Unidades Activas</div>
              <div className={`text-2xl font-extrabold leading-none ${isCafe ? 'text-[#fefae0]' : 'text-[#2b1a10]'}`}>
                {drones.filter(d => d.status !== DroneStatus.BASE).length}{" "}
                <span className="text-sm font-medium opacity-50">/ {drones.length}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border shadow-lg transition-all active:scale-95 ${isCafe ? 'bg-[#d4a373]/10 border-[#d4a373] text-[#d4a373] hover:bg-[#d4a373] hover:text-black' : 'bg-[#bc8a5f]/10 border-[#bc8a5f] text-[#bc8a5f] hover:bg-[#bc8a5f] hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            ALTA DE UNIDAD
          </button>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border shadow-lg transition-all active:scale-95 ${isCafe ? 'bg-black/20 border-[#5c4033] text-white/60 hover:text-white hover:border-[#d4a373]' : 'bg-white/50 border-[#d4c3a3] text-[#5c4033]/70 hover:text-[#5c4033] hover:border-[#bc8a5f]'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            HISTORIAL
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
          onEdit={(drone) => { setDroneToEdit(drone); setIsAddModalOpen(true); }}
        />
      )}

      {deliveryAlerts.map(drone => (
        <DeliveryAlert key={drone.id} drone={drone} onClose={() => handleRemoveDeliveryAlert(drone.id)} />
      ))}

      {isAddModalOpen && (
        <AddDroneModal
          onClose={() => { setIsAddModalOpen(false); setDroneToEdit(null); setTaskToAssign(null); }}
          onAdd={handleAddDrone}
          onAddTask={handleAddTaskToQueue}
          drone={droneToEdit || undefined}
          taskToAssign={taskToAssign}
          availableDrones={assignableDrones}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterDroneModal onClose={() => setIsRegisterModalOpen(false)} onRegister={handleRegisterNewDrone} />
      )}

      {isHistoryModalOpen && (
        <IncidentHistoryModal history={incidentHistory} onClose={() => setIsHistoryModalOpen(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <MainAppContent />
  </ThemeProvider>
);

export default App;