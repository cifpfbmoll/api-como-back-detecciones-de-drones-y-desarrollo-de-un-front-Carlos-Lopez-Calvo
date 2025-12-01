const API_BASE = "http://localhost:8080/api/v1";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al llamar a ${url}`);
  }
  return res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "-";
}

async function loadStats() {
  try {
    const json = await fetchJson(`${API_BASE}/stats`);
    const data = json.data || {};
    setText("stat-total", data.total_detections ?? "-");
    setText("stat-known", data.known_drones_count ?? "-");
    setText("stat-unknown", data.unknown_devices_count ?? "-");
    setText("stat-top", data.top_manufacturer ?? "—");
  } catch (err) {
    console.error(err);
    setText("stat-total", "Error");
    setText("stat-known", "Error");
    setText("stat-unknown", "Error");
    setText("stat-top", "Error");
  }
}

function renderLatest(rows) {
  const tbody = document.getElementById("latest-body");
  if (!tbody) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="placeholder">Sin datos de detección todavía.</td></tr>';
    return;
  }

  tbody.innerHTML = rows
    .map(
      (d) => `
      <tr>
        <td>${d.id ?? ""}</td>
        <td><code>${d.mac_address ?? ""}</code></td>
        <td>${d.manufacturer_name ?? "N/D"}</td>
        <td>${d.rssi ?? ""}</td>
        <td>${d.sensor_location ?? ""}</td>
        <td>${d.detected_at ?? ""}</td>
      </tr>
    `
    )
    .join("");
}

async function loadLatest() {
  try {
    const json = await fetchJson(`${API_BASE}/detections/latest`);
    renderLatest(json.data || []);
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById("latest-body");
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="placeholder">Error cargando datos.</td></tr>';
    }
  }
}

async function loadManufacturers() {
  const ul = document.getElementById("manufacturers-list");
  if (!ul) return;

  try {
    const json = await fetchJson(`${API_BASE}/manufacturers`);
    const list = json.data || [];
    if (!list.length) {
      ul.innerHTML =
        '<li class="placeholder">Sin fabricantes cargados. Ejecuta el seeder.</li>';
      return;
    }

    ul.innerHTML = list
      .map(
        (m) => `
        <li>
          <span>${m.name}</span>
          <code>${m.oui}</code>
        </li>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    ul.innerHTML =
      '<li class="placeholder">Error cargando fabricantes.</li>';
  }
}

function init() {
  loadStats();
  loadLatest();
  loadManufacturers();

  const refresh = document.getElementById("refresh-btn");
  if (refresh) {
    refresh.addEventListener("click", () => {
      loadStats();
      loadLatest();
    });
  }
}

document.addEventListener("DOMContentLoaded", init);


