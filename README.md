# 📌 Sistema de Autenticación y Manejo de Sesión

Este sistema de autenticación está diseñado para ofrecer una experiencia segura y fluida, utilizando **access tokens**, **refresh tokens** y un mecanismo de **persistencia de sesión** basado en cookies y almacenamiento local.

---

## 🔐 Flujo de Autenticación

1. **Inicio de sesión** (`POST /core/auth/login`)
   - El cliente envía `email` y `password`.
   - El backend responde con:
     - Un **access token** (válido por 15 minutos).
     - Un **refresh token** en **cookie httpOnly** (válido por 8 horas).
   - El estado del usuario autenticado se guarda mediante `useAuth()` en el frontend.

---

## 🔁 Renovación Automática de Token

- Cuando el `access token` expira y una petición devuelve `401 Unauthorized`:
  - Se realiza una llamada a `POST /core/auth/refresh-token` usando la cookie.
  - Si el `refresh token` sigue siendo válido, el backend responde con un nuevo `access token`.
  - El frontend actualiza automáticamente el estado de autenticación y reintenta la petición original.

---

## 🔄 Persistencia de la Sesión (`persist`)

- El usuario puede activar la opción **"Keep me logged in"** al iniciar sesión.
- Si `persist === true`:
  - Se guarda un flag `sessionStartedWithPersist = "true"` en `localStorage`.
  - Al recargar la página, si la cookie aún es válida, se reestablece la sesión sin pedir login.
- Si `persist === false`:
  - No se guarda información persistente.
  - Si el usuario recarga el navegador, será redirigido a `/signin`.
  - También se eliminan las cookies en el logout.

---

## 🧭 Comportamiento de Rutas

- `RedirectIfAuthenticated`:

  - Redirige a `/dashboard` si ya hay una sesión activa.
  - Utiliza `useAuth()` para verificar si el usuario está autenticado y si ya se inicializó el estado.

- `RequireAuth`:
  - Protege rutas privadas como `/dashboard`, asegurándose de que el usuario esté autenticado.
  - Si no está autenticado, redirige a `/signin`.

---

## 🛠 Código Clave

### Login

```tsx
const response = await api.post('/core/auth/login', data, {
	withCredentials: true, // Necesario para recibir la cookie del refreshToken
});

setAuth(response.data);

if (persist) {
	localStorage.setItem('sessionStartedWithPersist', 'true');
} else {
	localStorage.removeItem('sessionStartedWithPersist');
}
```
