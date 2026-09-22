// El botón "WhatsApp" del admin arma el link con el teléfono que cargó el
// cliente al reservar, tal cual lo tipeó. Todos los placeholders del sitio
// ("Ej. 299 597 4176") invitan a escribirlo en formato local, sin +54 ni el
// 9 de celular — así que un simple `replace(/\D/g, "")` genera un número de
// 10 dígitos que wa.me no reconoce. Esto normaliza al formato que wa.me
// espera para un celular argentino: 549 + código de área + número.
export function toWhatsappNumber(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("549")) return digits; // ya viene completo
  if (digits.startsWith("54")) return `549${digits.slice(2)}`; // falta el 9 de celular
  if (digits.startsWith("0")) return `549${digits.slice(1)}`; // 0299... con prefijo de larga distancia
  return `549${digits}`; // formato típico: código de área + número, sin 0 ni 15
}
