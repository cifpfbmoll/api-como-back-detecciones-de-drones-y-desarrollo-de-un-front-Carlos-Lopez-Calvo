## API de Detección de Drones Wi‑Fi

Aplicación completa (backend + frontend) para registrar detecciones de dispositivos Wi‑Fi (drones) y mostrarlas en un dashboard web.

### ¿Qué hace el proyecto?

- **Backend (API REST – CodeIgniter 4)**:
  - Recibe detecciones desde scripts/sensores mediante `POST /api/v1/detections`.
  - Guarda las detecciones en una base de datos **SQLite** (`writable/database.sqlite`).
  - Enlaza cada MAC con un fabricante conocido según su OUI (`manufacturers`).
  - Expone endpoints para:
    - Listar detecciones (`GET /api/v1/detections`).
    - Ver las últimas 5 detecciones (`GET /api/v1/detections/latest`).
    - Listar fabricantes (`GET /api/v1/manufacturers`).
    - Obtener estadísticas de alto nivel (`GET /api/v1/stats`).

- **Frontend (dashboard – carpeta `frontend`)**:
  - Panel web oscuro y responsivo que consume la API.
  - Muestra:
    - Tarjetas con estadísticas globales.
    - Tabla con las últimas detecciones.
    - Lista de fabricantes conocidos.
  - Se sirve como sitio estático (HTML/CSS/JS) detrás de **nginx**.

- **Base de datos**:
  - `manufacturers`: fabricantes precargados mediante `ManufacturerSeeder`.
  - `detections`: registros de cada detección de MAC procedente de los sensores.

---

## Cómo levantar TODO con Docker (recomendado para la entrega)

### Requisitos

- Docker y Docker Compose funcionando en tu máquina.

### Pasos

1. Ir a la carpeta del proyecto:

```bash
cd "/Users/carloslopez/Desktop/carpeta sin título/apidron/drones-api"
```

2. Construir e iniciar los contenedores (API + frontend):

```bash
docker compose up --build
```

Esto levanta:

- **API (backend)** en `http://localhost:8080`
- **Frontend (dashboard)** en `http://localhost:3000`

3. Crear la base de datos SQLite dentro del contenedor de la API:

```bash
docker compose exec api touch writable/database.sqlite
```

4. Ejecutar las migraciones (crea tablas `manufacturers` y `detections`):

```bash
docker compose exec api php spark migrate --all
```

5. Ejecutar el seeder de fabricantes:

```bash
docker compose exec api php spark db:seed ManufacturerSeeder
```

6. Asegurar permisos de escritura sobre la base de datos (por si fuera necesario):

```bash
docker compose exec api chown www-data:www-data writable/database.sqlite
docker compose exec api chmod 664 writable/database.sqlite
```

Con esto, la API y el dashboard quedan listos para usar.

---

## Endpoints principales de la API

Base URL dentro de Docker: `http://localhost:8080/api/v1`

- **POST `/detections`**  
  Registra una nueva detección.

  **Body JSON de ejemplo:**

  ```json
  {
    "mac": "60:60:1F:AA:BB:CC",
    "rssi": -50,
    "sensor_location": "Edificio A - Planta 3",
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

- **GET `/detections`**  
  Lista paginada de detecciones.

  **Parámetros opcionales:**
  - `page` (int) – página (por defecto 1)
  - `limit` (int) – resultados por página (máx. 100, por defecto 20)
  - `manufacturer_id` (int) – filtrar por fabricante
  - `location` (string) – filtrar por ubicación del sensor

- **GET `/detections/latest`**  
  Devuelve las 5 detecciones más recientes (para el dashboard).

- **GET `/manufacturers`**  
  Lista todos los fabricantes precargados (resultado del seeder).

- **GET `/stats`**  
  Devuelve estadísticas para el dashboard:
  - `total_detections`
  - `known_drones_count`
  - `unknown_devices_count`
  - `top_manufacturer`

---

## Frontend (carpeta `frontend`)

El frontend es un dashboard estático (HTML/CSS/JS) que se conecta a la API:

- **`index.html`**: estructura de la página.
- **`style.css`**: estilos con tema oscuro tipo panel de control.
- **`main.js`**:
  - Hace `fetch` a:
    - `GET /api/v1/stats`
    - `GET /api/v1/detections/latest`
    - `GET /api/v1/manufacturers`
  - Actualiza en tiempo real las tarjetas, la tabla de últimas detecciones y la lista de fabricantes.

Al ejecutar `docker compose up --build`, nginx sirve este frontend en `http://localhost:3000`.

---

## Simular detecciones (para pruebas y capturas)

Con los contenedores ya levantados:

```bash
# Detección 1
curl -X POST "http://localhost:8080/api/v1/detections" \
  -H "Content-Type: application/json" \
  -d '{
    "mac": "60:60:1F:AA:BB:CC",
    "rssi": -50,
    "sensor_location": "Edificio A - Planta 3",
    "timestamp": "2024-01-15T10:30:00Z"
  }'

# Detección 2
curl -X POST "http://localhost:8080/api/v1/detections" \
  -H "Content-Type: application/json" \
  -d '{
    "mac": "60:60:1F:11:22:33",
    "rssi": -42,
    "sensor_location": "Edificio B - Azotea",
    "timestamp": "2024-01-15T10:31:00Z"
  }'
```

Tras enviar varias detecciones:

- `GET http://localhost:8080/api/v1/stats` mostrará estadísticas actualizadas.
- El dashboard en `http://localhost:3000` mostrará las nuevas filas en “Últimas detecciones” y actualizará las tarjetas de métricas.

---

## Tecnologías usadas

- **Backend**: CodeIgniter 4 (PHP 8.2 en Docker).
- **Base de datos**: SQLite3 (archivo `writable/database.sqlite`).
- **Frontend**: HTML + CSS + JavaScript (fetch API).
- **Infraestructura**: Docker + Docker Compose (Apache + PHP para la API, nginx para el frontend).

