# flix

Login de prueba con Node.js + Express + PostgreSQL, pensado para desplegar en Railway.

> ⚠️ **Versión de prueba:** las contraseñas se guardan en **texto plano** y `/api/users`
> muestra todo el contenido de la tabla. No usar con datos reales. Siguiente paso: cifrado con bcrypt.

## Endpoints

| Método | Ruta            | Body                         | Descripción                    |
|--------|-----------------|------------------------------|--------------------------------|
| GET    | `/`             | –                            | Página de login / registro     |
| POST   | `/api/register` | `{ "username", "password" }` | Crea un usuario                |
| POST   | `/api/login`    | `{ "username", "password" }` | Comprueba usuario y contraseña |
| GET    | `/api/users`    | –                            | Lista la tabla `users` (debug) |

La tabla `users` se crea automáticamente al arrancar.

## Desplegar en Railway

1. En Railway: **New Project → Deploy from GitHub repo** y elige este repositorio.
2. En el mismo proyecto: **+ New → Database → PostgreSQL**.
3. En el servicio de la app → **Variables** → añade
   `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (referencia a la base de datos).
4. En **Settings → Networking → Generate Domain** para obtener la URL pública.
5. Abre la URL, regístrate, inicia sesión y mira `/api/users` para ver los datos guardados.

## Ejecutar en local

```bash
npm install
DATABASE_URL=postgres://usuario:password@localhost:5432/basedatos npm start
```
