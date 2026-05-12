Usuario Administrador:
Email: admin@poyos.com
Contraseña: admin123

Usuario Restaurante (Business):
Email: hansel2@gmail.com
Contraseña: 123456

Usuario Cliente:
Email: hansel3@gmail.com
Contraseña: 123456


# 🍗 PoYos - Portal de Delivery de Pollo Frito

**PoYos** es una plataforma web de delivery de comida especializada en pollo frito, donde múltiples negocios pueden registrarse, publicar su menú y recibir pedidos de clientes.

---

## 📋 Descripción del proyecto

- Plataforma multi-restaurante de pollo frito (tenders, pica pollo, sándwiches, alitas, etc.)
- Sistema de roles: **Cliente**, **Negocio** y **Admin**
- CRUD completo de restaurantes y menús
- Carrito de compras con confirmación de pedido y tiempo de entrega simulado
- Mapa interactivo con **Leaflet + OpenStreetMap** para ubicación del negocio y dirección de entrega
- Búsqueda y filtrado de restaurantes
- Desplegado en **Render** con base de datos **MySQL en Aiven**

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Node.js + Express + EJS + Bootstrap 5 |
| Backend | Node.js + Express (API REST) |
| Base de datos | MySQL (Aiven) + Sequelize ORM |
| Mapas | Leaflet.js + OpenStreetMap |
| Despliegue | Render |

---

## 📁 Estructura del proyecto

```
ProyectomanonP4/
├── package.json         ← Scripts render-* para desplegar desde la raíz en Render
├── backend/
│   ├── src/
│   │   ├── config/      ← Conexión a la base de datos
│   │   ├── controllers/ ← Lógica de negocio
│   │   ├── models/      ← Modelos Sequelize
│   │   ├── routes/      ← Rutas de la API
│   │   └── middleware/  ← Auth, logging, errores
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── css/         ← Estilos
│   │   ├── js/          ← Cart.js y scripts
│   │   └── images/      ← Imágenes por defecto
│   ├── views/
│   │   ├── partials/    ← Navbar, head, footer
│   │   ├── auth/        ← Login, Register
│   │   ├── client/      ← Home, Restaurantes, Detalle
│   │   ├── business/    ← Dashboard, Formularios
│   │   └── admin/       ← Panel admin
│   ├── .env.example
│   ├── app.js
│   └── package.json
├── render.yaml          ← Opcional: blueprint Render (dos Web Services)
└── README.md
```

---

## ⚙️ Cómo ejecutar en local

### Prerrequisitos
- Node.js v18+
- MySQL (local o Aiven)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/TokyoxRD/ProyectomanonP4.git
cd ProyectomanonP4
```

### 2. Configurar el Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL:

```env
PORT=3001
DB_HOST=tu_host
DB_PORT=3306
DB_NAME=poyos_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
FRONTEND_URL=http://localhost:3000
JWT_SECRET=poyos_jwt_secret_local
```

Iniciar el backend:
```bash
npm run dev
```

### 3. Configurar el Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edita `.env` si tu API local no está en el puerto 3001.

```env
PORT=3000
API_URL=http://localhost:3001
SESSION_SECRET=poyos_secret_local
```

Iniciar el frontend:
```bash
npm run dev
```

### 4. Acceder a la aplicación

Abre tu navegador en: **http://localhost:3000**

**Credenciales de administrador:**
- Email: `admin@poyos.com`
- Contraseña: `admin123`

---

## 🔗 API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/restaurants` | Listar restaurantes (con búsqueda `?q=`) |
| GET | `/api/restaurants/:id` | Detalle de restaurante |
| POST | `/api/restaurants` | Crear restaurante |
| PUT | `/api/restaurants/:id` | Actualizar restaurante |
| DELETE | `/api/restaurants/:id` | Eliminar restaurante |
| GET | `/api/menu/:restaurantId` | Menú de un restaurante |
| POST | `/api/menu` | Agregar plato |
| PUT | `/api/menu/:id` | Actualizar plato |
| DELETE | `/api/menu/:id` | Eliminar plato |
| POST | `/api/orders` | Crear pedido |
| GET | `/api/admin/users` | Listar usuarios (admin) |
| GET | `/api/admin/orders` | Listar todos los pedidos (admin) |

---

## 🌐 Aplicación desplegada

- **Frontend (Web):** `https://TU-APP-FRONTEND.onrender.com` (sustituye por tu URL de Render).
- **Backend (API):** `https://TU-APP-BACKEND.onrender.com` — comprueba con `GET /api/health`.

---

## ☁️ Despliegue en Render (checklist)

Necesitas **dos servicios Web** en Render (uno para `backend/`, otro para `frontend/`) y una base **MySQL** (por ejemplo [Aiven](https://aiven.io/) como indica el proyecto). Opcional: en la raíz del repo hay un `render.yaml` para crear el esqueleto de ambos servicios al usar **Blueprint**; las variables sensibles las sigues configurando en el panel.

### Si Render marca “failed deploy” con solo `npm install` / `npm start`

Ese repo **no tiene** la app en la raíz: está en `backend/` y `frontend/`. Sin configurar eso, el build o el start fallan.

Tienes **dos formas** (elige una):

| Opción | Root Directory (en Render) | Build Command | Start Command |
|--------|------------------------------|---------------|---------------|
| **A (recomendada)** | `backend` o `frontend` | `npm install` | `npm start` |
| **B (raíz vacía)** | *(déjalo vacío)* | Ver tabla abajo | Ver tabla abajo |

**Opción B — dejando la raíz del repo como carpeta del servicio**

| Servicio que creas | Build Command | Start Command |
|--------------------|---------------|---------------|
| API (backend) | `npm run render-backend-install` | `npm run render-backend-start` |
| Web (frontend) | `npm run render-frontend-install` | `npm run render-frontend-start` |

Esos comandos están en el `package.json` de la **raíz** del repositorio.

Si el **build** pasa pero el **deploy** falla al arrancar, casi siempre es la **base de datos**: revisa en los logs `Error al conectar con la base de datos` y confirma `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y (en Aiven) `NODE_ENV=production` o `DB_SSL=true`.

### 1. Base de datos MySQL (Aiven u otro)

Crea la base y un usuario con permisos. Anota:

| Campo | Ejemplo |
|--------|---------|
| Host | `mysql-xxxxx.a.aivencloud.com` |
| Puerto | `3306` (o el que te indiquen) |
| Base de datos | `defaultdb` o la que crees |
| Usuario / contraseña | los de Aiven |

En Aiven suele hacer falta **SSL**: en el backend ya se usa SSL si `NODE_ENV=production` o si defines `DB_SSL=true`.

### 2. Servicio Web — **Backend** (`backend/`)

En Render: **New +** → **Web Service** → conecta el mismo repositorio.

| Campo en Render | Valor |
|------------------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance type** | Free o la que prefieras |

**Environment → Environment Variables** (añade cada fila):

| Key | Valor / notas |
|-----|----------------|
| `NODE_ENV` | `production` |
| `PORT` | No hace falta definirla: Render inyecta `PORT` automáticamente. |
| `DB_HOST` | Host de MySQL |
| `DB_PORT` | `3306` (o el de tu proveedor) |
| `DB_NAME` | Nombre de la base |
| `DB_USER` | Usuario |
| `DB_PASSWORD` | Contraseña (marca **Secret**) |
| `DB_SSL` | `true` si usas Aiven y por algún motivo no pones `NODE_ENV=production` |
| `JWT_SECRET` | Cadena larga y aleatoria (**Secret**) |
| `FRONTEND_URL` | URL **pública HTTPS** del frontend, **sin** barra al final. Ejemplo: `https://poyos-frontend.onrender.com` |

Después del primer despliegue, copia la URL del backend (por ejemplo `https://poyos-backend.onrender.com`). La usarás en el frontend como `API_URL`.

### 3. Servicio Web — **Frontend** (`frontend/`)

**New +** → **Web Service** → mismo repo.

| Campo en Render | Valor |
|------------------|--------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

**Environment Variables:**

| Key | Valor / notas |
|-----|----------------|
| `NODE_ENV` | `production` |
| `API_URL` | URL **HTTPS** del backend, **sin** barra final. Ejemplo: `https://poyos-backend.onrender.com` |
| `SESSION_SECRET` | Otra cadena larga y aleatoria, distinta de `JWT_SECRET` (**Secret**) |

`PORT` la asigna Render; no la fijes a mano salvo que sepas lo que haces.

### 4. CORS

El backend solo acepta peticiones desde el origen `FRONTEND_URL`. Debe coincidir **exactamente** con la URL con la que los usuarios abren la web (mismo protocolo `https`, mismo subdominio). Si cambias el nombre del servicio en Render, actualiza `FRONTEND_URL` en el backend y vuelve a desplegar.

### 5. Archivos subidos (imágenes)

En el plan gratuito de Render el disco del contenedor es **efímero**: las fotos guardadas en `public/uploads` pueden perderse al reiniciar. Para producción seria conviene un almacén externo (S3, Cloudinary, etc.) o un **Persistent Disk** en Render. Para la entrega académica suele bastar con saber esta limitación.

### 6. Verificación rápida

1. Abre en el navegador: `https://TU-BACKEND.onrender.com/api/health` → debe responder JSON `status: ok`.
2. Abre el frontend, registro/login y una página que llame a la API.

---

## 👥 Autores

- **Hansel Polanco **
