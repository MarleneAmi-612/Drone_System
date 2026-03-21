#  Backend

API REST con FastAPI + MongoDB para el sistema de gestión de drones.

## Requisitos

- Python 3.11+
- MongoDB Atlas (ya configurado en .env)

## Instalación

### Windows
```powershell
.\setup.ps1
.\start.ps1
```

### Linux / macOS
```bash
bash setup.sh
bash start.sh
```

## Endpoints

- `GET  /api/health` - Estado del servidor
- `GET  /api/drones` - Listar todos los drones
- `POST /api/drones` - Registrar dron
- `PUT  /api/drones/{id}` - Reemplazar dron
- `PATCH /api/drones/{id}` - Actualizar campos
- `DELETE /api/drones/{id}` - Eliminar dron
- `GET  /api/incidents` - Historial de incidentes
- `POST /api/incidents` - Crear incidente
- `PATCH /api/incidents/{id}/resolve` - Resolver incidente
- `PATCH /api/incidents/resolve-by-drone/{droneId}` - Resolver por dron
- `GET  /api/tasks` - Cola de tareas
- `POST /api/tasks` - Crear tarea
- `DELETE /api/tasks/{id}` - Eliminar tarea
- `GET  /api/alarms` - Alarmas activas
- `POST /api/alarms` - Crear alarma
- `PATCH /api/alarms/{id}/resolve` - Resolver alarma
- `PATCH /api/alarms/resolve-by-drone/{droneId}` - Resolver por dron

El servidor corre en `http://localhost:8001`
