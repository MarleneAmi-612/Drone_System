import { Drone } from '../types';
import { QueuedTask } from '../components/AddDroneModal';
import { IncidentRecord } from '../components/IncidentHistoryModal';

const BASE_URL = 'http://localhost:8001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail || `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchDrones(): Promise<Drone[]> {
  return request<Drone[]>('/drones');
}

export async function registerDrone(drone: Drone): Promise<Drone> {
  return request<Drone>('/drones', {
    method: 'POST',
    body: JSON.stringify(drone),
  });
}

export async function updateDrone(drone: Drone): Promise<Drone> {
  return request<Drone>(`/drones/${drone.id}`, {
    method: 'PUT',
    body: JSON.stringify(drone),
  });
}

export async function deleteDrone(id: string): Promise<void> {
  await request<{ message: string }>(`/drones/${id}`, { method: 'DELETE' });
}

export async function fetchIncidents(): Promise<IncidentRecord[]> {
  return request<IncidentRecord[]>('/incidents');
}

export async function createIncident(record: IncidentRecord): Promise<IncidentRecord> {
  return request<IncidentRecord>('/incidents', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export async function resolveIncidentsByDrone(droneId: string): Promise<void> {
  await request<{ message: string }>(`/incidents/resolve-by-drone/${droneId}`, {
    method: 'PATCH',
  });
}

export async function fetchTasks(): Promise<QueuedTask[]> {
  return request<QueuedTask[]>('/tasks');
}

export async function createTask(task: QueuedTask): Promise<QueuedTask> {
  return request<QueuedTask>('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await request<{ message: string }>(`/tasks/${taskId}`, { method: 'DELETE' });
}

export async function createAlarm(droneId: string, type: string, details: string): Promise<void> {
  await request('/alarms', {
    method: 'POST',
    body: JSON.stringify({
      droneId,
      type,
      timestamp: Date.now(),
      status: 'ACTIVE',
      details,
    }),
  });
}

export async function resolveAlarmsByDrone(droneId: string): Promise<void> {
  await request(`/alarms/resolve-by-drone/${droneId}`, { method: 'PATCH' });
}