# frontendUpbTest

Frontend en React + Vite para la API de productos de [backendUpbtest](https://github.com/camifue81/backendUpbtest).

Permite listar, buscar por nombre, ver detalle, crear, editar y eliminar productos.

## Correr en local

```bash
npm install
cp .env.example .env   # opcional: cambia VITE_API_URL para usar otro backend
npm run dev
```

## Despliegue en Render (Static Site)

- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Variable de entorno: `VITE_API_URL=https://backendupbtest-qfbd.onrender.com`
