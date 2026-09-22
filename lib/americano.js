/**
 * Algoritmo generador de fixtures para Torneo Americano de Pádel.
 * Asegura rotación balanceada para que cada jugador dispute la misma cantidad de partidos.
 */

export function generateFixtures(names) {
  const n = names.length;

  if (n === 4) {
    return [
      { round: 1, p1: names[0], p2: names[1], p3: names[2], p4: names[3], bye: null },
      { round: 2, p1: names[0], p2: names[2], p3: names[1], p4: names[3], bye: null },
      { round: 3, p1: names[0], p2: names[3], p3: names[1], p4: names[2], bye: null },
    ];
  }

  if (n === 5) {
    return [
      { round: 1, p1: names[0], p2: names[1], p3: names[2], p4: names[3], bye: names[4] },
      { round: 2, p1: names[0], p2: names[2], p3: names[3], p4: names[4], bye: names[1] },
      { round: 3, p1: names[0], p2: names[3], p3: names[1], p4: names[4], bye: names[2] },
      { round: 4, p1: names[0], p2: names[4], p3: names[1], p4: names[2], bye: names[3] },
      { round: 5, p1: names[1], p2: names[3], p3: names[2], p4: names[4], bye: names[0] },
    ];
  }

  if (n === 7) {
    // 7 rondas: en cada ronda juegan 4 y descansan 3.
    // Total de participaciones = 7 * 4 = 28.
    // 28 / 7 = exactamente 4 partidos jugados por cada jugador.
    const rounds = [];
    for (let r = 0; r < 7; r++) {
      const active = [
        names[r % 7],
        names[(r + 1) % 7],
        names[(r + 2) % 7],
        names[(r + 4) % 7],
      ];
      const byes = [
        names[(r + 3) % 7],
        names[(r + 5) % 7],
        names[(r + 6) % 7],
      ];
      rounds.push({
        round: r + 1,
        p1: active[0],
        p2: active[3],
        p3: active[1],
        p4: active[2],
        bye: byes.join(", "),
      });
    }
    return rounds;
  }

  // Generador cíclico balanceado para n jugadores
  const rounds = [];
  const totalRounds = n;
  for (let r = 0; r < totalRounds; r++) {
    const p1 = names[r % n];
    const p2 = names[(r + 1) % n];
    const p3 = names[(r + 2) % n];
    const p4 = names[(r + 3) % n];
    const byes = names.filter((_, idx) => {
      const p = [r % n, (r + 1) % n, (r + 2) % n, (r + 3) % n];
      return !p.includes(idx);
    });

    rounds.push({
      round: r + 1,
      p1,
      p2,
      p3,
      p4,
      bye: byes.length > 0 ? byes.join(", ") : null,
    });
  }

  return rounds;
}
