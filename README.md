# Muzzaga Pádel

Landing y sistema de turnos del club de pádel Muzzaga (Catriel, Río Negro).

Next.js (App Router) + Firebase Realtime Database (Admin SDK, server-only) para la disponibilidad y las reservas.

## Desarrollo local

```bash
npm install
npm run dev
```

Necesitás un `.env.local` con las credenciales de Firebase (ver `.env.example`):

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_URL=
```

Estas variables salen de una cuenta de servicio de Firebase (Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada) y nunca se exponen al cliente: solo se usan en `lib/firebase.js`, importado desde el route handler de disponibilidad y el server action de reservas.

## Editar contenido

- Copy y estructura de la landing: `app/page.js`.
- Estilos: `app/globals.css` (mismo sistema de diseño que tenía el sitio estático original).
- Reglas de negocio del turnero (canchas, horarios, precios): `lib/booking.js`.

## Cómo funciona el turnero

- `app/api/availability/route.js` calcula, para una fecha dada, qué horarios de cada cancha están libres cruzando `lib/booking.js` contra `slotClaims/{fecha}` en Firebase.
- `app/actions.js` (`createBooking`, Server Action) confirma un turno: usa una transacción de Realtime Database sobre `slotClaims/{fecha}/{cancha}_{horario}` para evitar que dos personas reserven el mismo horario a la vez, guarda la reserva en `bookings/`, y devuelve los datos para armar el mensaje de WhatsApp (eso se arma en el cliente, en `components/BookingCalendar.jsx`).

## Deploy

Importado en Vercel desde este repo. Cualquier push a `master` dispara un deploy automático. Las variables de entorno de Firebase tienen que estar cargadas también en la configuración del proyecto de Vercel.
