import { useEffect, useState } from 'react';
import {
    API_URL,
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
} from './api';

const FORM_VACIO = { nombre: '', precio: '', stock: '' };

// Convierte el formulario (strings) al cuerpo que espera la API (números)
const aCuerpo = (form) => ({
    nombre: form.nombre.trim(),
    precio: form.precio === '' ? 0 : Number(form.precio),
    stock: form.stock === '' ? 0 : Number(form.stock),
});

function App() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [form, setForm] = useState(FORM_VACIO);
    const [editandoId, setEditandoId] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const avisar = (tipo, texto) => setMensaje({ tipo, texto });

    const cargar = async (nombre = busqueda) => {
        setCargando(true);
        try {
            setProductos(await listarProductos(nombre.trim()));
        } catch (err) {
            avisar('error', err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar('');
    }, []);

    const buscar = (e) => {
        e.preventDefault();
        cargar();
    };

    const limpiarBusqueda = () => {
        setBusqueda('');
        cargar('');
    };

    const guardar = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await actualizarProducto(editandoId, aCuerpo(form));
                avisar('ok', `Producto ${editandoId} actualizado`);
            } else {
                const nuevo = await crearProducto(aCuerpo(form));
                avisar('ok', `Producto "${nuevo.nombre}" creado con id ${nuevo.id}`);
            }
            cancelarEdicion();
            cargar();
        } catch (err) {
            avisar('error', err.message);
        }
    };

    const editar = (p) => {
        setEditandoId(p.id);
        setForm({ nombre: p.nombre, precio: String(p.precio), stock: String(p.stock) });
        setMensaje(null);
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setForm(FORM_VACIO);
    };

    const verDetalle = async (id) => {
        try {
            setDetalle(await obtenerProducto(id));
        } catch (err) {
            avisar('error', err.message);
        }
    };

    const eliminar = async (p) => {
        if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
        try {
            await eliminarProducto(p.id);
            avisar('ok', `Producto "${p.nombre}" eliminado`);
            if (detalle?.id === p.id) setDetalle(null);
            if (editandoId === p.id) cancelarEdicion();
            cargar();
        } catch (err) {
            avisar('error', err.message);
        }
    };

    return (
        <main className="contenedor">
            <header>
                <h1>Productos UPB</h1>
                <p className="sub">
                    Conectado a <code>{API_URL}</code>
                </p>
            </header>

            {mensaje && (
                <div className={`aviso ${mensaje.tipo}`} role="status">
                    {mensaje.texto}
                    <button className="cerrar" onClick={() => setMensaje(null)} aria-label="Cerrar">
                        ×
                    </button>
                </div>
            )}

            <section className="tarjeta">
                <h2>{editandoId ? `Editar producto #${editandoId}` : 'Nuevo producto'}</h2>
                <form className="formulario" onSubmit={guardar}>
                    <label>
                        Nombre
                        <input
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            maxLength={100}
                            required
                        />
                    </label>
                    <label>
                        Precio
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.precio}
                            onChange={(e) => setForm({ ...form, precio: e.target.value })}
                        />
                    </label>
                    <label>
                        Stock
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        />
                    </label>
                    <div className="acciones">
                        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
                        {editandoId && (
                            <button type="button" className="secundario" onClick={cancelarEdicion}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="tarjeta">
                <div className="cabecera-lista">
                    <h2>Listado</h2>
                    <form className="buscador" onSubmit={buscar}>
                        <input
                            placeholder="Buscar por nombre…"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <button type="submit">Buscar</button>
                        {busqueda && (
                            <button type="button" className="secundario" onClick={limpiarBusqueda}>
                                Limpiar
                            </button>
                        )}
                    </form>
                </div>

                {cargando ? (
                    <p className="vacio">Cargando… (si el servidor estaba dormido puede tardar ~50 s)</p>
                ) : productos.length === 0 ? (
                    <p className="vacio">No hay productos.</p>
                ) : (
                    <div className="tabla-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th className="num">Precio</th>
                                    <th className="num">Stock</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.nombre}</td>
                                        <td className="num">{p.precio.toFixed(2)}</td>
                                        <td className="num">{p.stock}</td>
                                        <td className="fila-acciones">
                                            <button className="secundario" onClick={() => verDetalle(p.id)}>
                                                Ver
                                            </button>
                                            <button className="secundario" onClick={() => editar(p)}>
                                                Editar
                                            </button>
                                            <button className="peligro" onClick={() => eliminar(p)}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {detalle && (
                <section className="tarjeta">
                    <div className="cabecera-lista">
                        <h2>Detalle del producto #{detalle.id}</h2>
                        <button className="secundario" onClick={() => setDetalle(null)}>
                            Cerrar
                        </button>
                    </div>
                    <dl className="detalle">
                        <dt>Nombre</dt>
                        <dd>{detalle.nombre}</dd>
                        <dt>Precio</dt>
                        <dd>{detalle.precio.toFixed(2)}</dd>
                        <dt>Stock</dt>
                        <dd>{detalle.stock}</dd>
                        <dt>Creado</dt>
                        <dd>{new Date(detalle.createdAt).toLocaleString()}</dd>
                    </dl>
                </section>
            )}
        </main>
    );
}

export default App;
