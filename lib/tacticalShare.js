/**
 * Lógica pura para formatear mensajes de WhatsApp de la Pizarra Táctica de Muzzaga Pádel.
 */

export function buildTacticShareMessage(tactic) {
  if (!tactic) return "";

  const phasesText = (tactic.phases || [])
    .map((p) => `• *${p.phase}:* ${p.desc}`)
    .join("\n");

  return (
    `🎾 *Pizarra Táctica Muzzaga Pádel*\n` +
    `¡Mirá esta jugada para aplicar en el próximo partido!\n\n` +
    `🔥 *${tactic.title}* (${tactic.category || "Táctica"})\n` +
    `Dificultad: ${tactic.difficulty || "Media"} | Efectividad: ${tactic.effectiveness || "85%"}\n\n` +
    `📌 *Descripción:*\n${tactic.desc || ""}\n\n` +
    (phasesText ? `📋 *Secuencia paso a paso:*\n${phasesText}\n\n` : "") +
    (tactic.tip ? `💡 *Consejo pro:* ${tactic.tip}\n\n` : "") +
    `👉 Mirala interactiva en la pizarra táctica:\nhttps://muzzaga-padel-seven.vercel.app/#pizarra-tactica`
  );
}

export function buildTacticWhatsAppUrl(tactic) {
  const text = buildTacticShareMessage(tactic);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildRopeShareMessage(rope) {
  if (!rope) return "";

  return (
    `🎾 *Teoría de la Cuerda — Muzzaga Pádel*\n` +
    `¡Sincronización táctica de pareja para no dejar huecos!\n\n` +
    `🤝 *${rope.name}*\n` +
    `📌 *Cómo movernos juntos:*\n${rope.desc}\n\n` +
    `💡 *Regla de Oro:* Nunca te quedes mirando el tiro de tu compañero. Acompañá el movimiento para cerrar el centro.\n\n` +
    `👉 Practicar basculación en la cancha:\nhttps://muzzaga-padel-seven.vercel.app/#pizarra-tactica`
  );
}

export function buildRopeWhatsAppUrl(rope) {
  const text = buildRopeShareMessage(rope);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
