import test from "node:test";
import assert from "node:assert/strict";
import {
  generateFixtures,
  buildAmericanoShareMessage,
  buildAmericanoWhatsAppUrl,
} from "../lib/americano.js";

test("americano with 4 players: all players play 3 matches", () => {
  const players = ["Ana", "Beto", "Carlos", "Diana"];
  const fixtures = generateFixtures(players);

  assert.equal(fixtures.length, 3);
  const count = {};
  players.forEach((p) => (count[p] = 0));

  for (const f of fixtures) {
    count[f.p1]++;
    count[f.p2]++;
    count[f.p3]++;
    count[f.p4]++;
    assert.equal(f.bye, null);
  }

  for (const p of players) {
    assert.equal(count[p], 3, `Player ${p} should play exactly 3 matches`);
  }
});

test("americano with 5 players: all players play exactly 4 matches and rest 1", () => {
  const players = ["P1", "P2", "P3", "P4", "P5"];
  const fixtures = generateFixtures(players);

  assert.equal(fixtures.length, 5);
  const count = {};
  const byeCount = {};
  players.forEach((p) => {
    count[p] = 0;
    byeCount[p] = 0;
  });

  for (const f of fixtures) {
    count[f.p1]++;
    count[f.p2]++;
    count[f.p3]++;
    count[f.p4]++;
    assert.ok(f.bye);
    byeCount[f.bye]++;
  }

  for (const p of players) {
    assert.equal(count[p], 4, `Player ${p} must play exactly 4 matches`);
    assert.equal(byeCount[p], 1, `Player ${p} must rest exactly 1 match`);
  }
});

test("americano with 7 players: all players play exactly 4 matches and rest 3", () => {
  const players = ["A", "B", "C", "D", "E", "F", "G"];
  const fixtures = generateFixtures(players);

  assert.equal(fixtures.length, 7);
  const count = {};
  const byeCount = {};
  players.forEach((p) => {
    count[p] = 0;
    byeCount[p] = 0;
  });

  for (const f of fixtures) {
    count[f.p1]++;
    count[f.p2]++;
    count[f.p3]++;
    count[f.p4]++;
    assert.ok(f.bye);
    const byes = f.bye.split(", ");
    assert.equal(byes.length, 3);
    for (const b of byes) {
      byeCount[b]++;
    }
  }

  for (const p of players) {
    assert.equal(count[p], 4, `Player ${p} must play exactly 4 matches in 7-player americano`);
    assert.equal(byeCount[p], 3, `Player ${p} must rest exactly 3 matches in 7-player americano`);
  }
});

test("buildAmericanoShareMessage formats fixture and scores for WhatsApp", () => {
  const names = ["Ana", "Beto", "Carlos", "Diana"];
  const fixtures = generateFixtures(names);
  const msg = buildAmericanoShareMessage({
    names,
    fixtures,
    scores: { 1: { t1: 4, t2: 2 } },
  });

  assert.ok(msg.includes("TORNEO AMERICANO EXPRESS"));
  assert.ok(msg.includes("Participantes (4): Ana, Beto, Carlos, Diana"));
  assert.ok(msg.includes("[4 - 2]"));

  const url = buildAmericanoWhatsAppUrl({ names, fixtures });
  assert.ok(url.startsWith("https://wa.me/?text="));
});

