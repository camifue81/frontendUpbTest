// Cliente de la API de productos. La URL sale de VITE_API_URL (ver .env.example)
const API_URL = (import.meta.env.VITE_API_URL || 'https://backendupbtest-qfbd.onrender.com').replace(/\/$/, '');

const request = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
    return data;
};

export const listarProductos = (nombre) =>
    request(nombre ? `/api/productos?nombre=${encodeURIComponent(nombre)}` : '/api/productos');

export const obtenerProducto = (id) => request(`/api/productos/${id}`);

export const crearProducto = (producto) =>
    request('/api/productos', { method: 'POST', body: JSON.stringify(producto) });

export const actualizarProducto = (id, producto) =>
    request(`/api/productos/${id}`, { method: 'PUT', body: JSON.stringify(producto) });

export const eliminarProducto = (id) => request(`/api/productos/${id}`, { method: 'DELETE' });

export { API_URL };
