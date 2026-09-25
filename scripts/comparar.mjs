#!/usr/bin/env node
// Entorno de comparación: levanta la versión original (worktree ../muzzaga-original,
// origin/master) y la rama de pulido (esta carpeta), y abre docs/comparar.html con
// las dos en iframes.
//
// next.config.js manda `X-Frame-Options: SAMEORIGIN`, así que un iframe desde otro
// puerto queda bloqueado. Por eso cada Next corre en un puerto interno (3100/3101)
// y se expone en el puerto público (3000/3001) a través de un proxy mínimo que quita
// esa cabecera y reescribe Host/Origin/Referer para que el dev server lo tome como
// mismo origen. El código del original no se toca.
//
//   npm run comparar
//
// Ctrl+C apaga todo.

import { spawn, execSync } from "node:child_process";
import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const dirPulido = path.resolve(aqui, "..");
const dirOriginal = path.resolve(dirPulido, "..", "muzzaga-original");
const SITIOS = [
  { tag: "original", dir: dirOriginal, publico: 3000, interno: 3100 },
  { tag: "pulido", dir: dirPulido, publico: 3001, interno: 3101 },
];
const PUERTO_COMPARAR = 3002;
const esWindows = process.platform === "win32";
const hijos = [];

const log = (tag, msg) => process.stdout.write(`[${tag}] ${msg}\n`);

if (!fs.existsSync(path.join(dirOriginal, "package.json"))) {
  console.error(
    `No existe ${dirOriginal}.\nCrealo con:\n  git worktree add --detach ../muzzaga-original origin/master`,
  );
  process.exit(1);
}
if (!fs.existsSync(path.join(dirOriginal, "node_modules"))) {
  log("original", "instalando dependencias (sólo la primera vez)…");
  execSync("npm install --no-audit --no-fund", { cwd: dirOriginal, stdio: "inherit", shell: true });
}

// --- Next dev -------------------------------------------------------------
function levantarNext({ tag, dir, interno }) {
  const hijo = spawn("npm", ["run", "dev", "--", "-p", String(interno)], {
    cwd: dir,
    shell: true,
    env: { ...process.env, PORT: String(interno), BROWSER: "none", FORCE_COLOR: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const conPrefijo = (stream) => {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      let i;
      while ((i = buffer.indexOf("\n")) >= 0) {
        const linea = buffer.slice(0, i).replace(/\r$/, "");
        buffer = buffer.slice(i + 1);
        if (linea.trim()) log(tag, linea);
      }
    });
  };
  conPrefijo(hijo.stdout);
  conPrefijo(hijo.stderr);
  hijo.on("exit", (codigo) => log(tag, `el dev server terminó (código ${codigo})`));
  hijos.push(hijo);
}

// --- Proxy que quita X-Frame-Options ---------------------------------------
function reescribirCabeceras(rawHeaders, interno) {
  const salida = [];
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const nombre = rawHeaders[i];
    let valor = rawHeaders[i + 1];
    const clave = nombre.toLowerCase();
    if (clave === "host") valor = `localhost:${interno}`;
    else if (clave === "origin") valor = `http://localhost:${interno}`;
    else if (clave === "referer") valor = valor.replace(/^https?:\/\/[^/]+/, `http://localhost:${interno}`);
    salida.push(nombre, valor);
  }
  return salida;
}

function levantarProxy({ tag, publico, interno }) {
  const servidor = http.createServer((req, res) => {
    const subida = http.request(
      { host: "127.0.0.1", port: interno, method: req.method, path: req.url, headers: reescribirCabeceras(req.rawHeaders, interno) },
      (respuesta) => {
        const cabeceras = { ...respuesta.headers };
        delete cabeceras["x-frame-options"];
        delete cabeceras["content-security-policy"];
        res.writeHead(respuesta.statusCode, cabeceras);
        respuesta.pipe(res);
      },
    );
    subida.on("error", (e) => {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
      res.end(`El servidor "${tag}" (puerto interno ${interno}) todavía no responde: ${e.message}\nEsperá unos segundos y recargá.`);
    });
    req.pipe(subida);
  });

  // WebSocket de recarga en caliente de Next.
  servidor.on("upgrade", (req, socket, head) => {
    const destino = net.connect(interno, "127.0.0.1", () => {
      const cabeceras = reescribirCabeceras(req.rawHeaders, interno);
      const lineas = [`${req.method} ${req.url} HTTP/${req.httpVersion}`];
      for (let i = 0; i < cabeceras.length; i += 2) lineas.push(`${cabeceras[i]}: ${cabeceras[i + 1]}`);
      destino.write(lineas.join("\r\n") + "\r\n\r\n");
      if (head && head.length) destino.write(head);
      socket.pipe(destino);
      destino.pipe(socket);
    });
    destino.on("error", () => socket.destroy());
    socket.on("error", () => destino.destroy());
  });

  servidor.on("error", (e) => {
    console.error(`[${tag}] no pude escuchar en :${publico}: ${e.message}`);
    apagar(1);
  });
  servidor.listen(publico, () => log(tag, `http://localhost:${publico}  →  Next en :${interno}`));
}

// --- Servidor estático para docs/ ------------------------------------------
function levantarComparador(puerto) {
  const dirDocs = path.join(dirPulido, "docs");
  const tipos = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".md": "text/plain; charset=utf-8",
  };
  const servidor = http.createServer((req, res) => {
    const ruta = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const archivo = path.normalize(path.join(dirDocs, ruta === "/" ? "comparar.html" : ruta));
    if (!archivo.startsWith(dirDocs) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("No encontrado");
      return;
    }
    res.writeHead(200, { "content-type": tipos[path.extname(archivo).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(archivo).pipe(res);
  });
  servidor.on("error", (e) => {
    console.error(`[comparar] no pude escuchar en :${puerto}: ${e.message}`);
    apagar(1);
  });
  servidor.listen(puerto, () => log("comparar", `http://localhost:${puerto}/comparar.html`));
}

// --- Utilidades ---------------------------------------------------------------
function esperarPuerto(puerto, tag, timeoutMs = 240000) {
  const inicio = Date.now();
  return new Promise((resolver, rechazar) => {
    const intentar = () => {
      const req = http.get({ host: "127.0.0.1", port: puerto, path: "/", timeout: 5000 }, (res) => {
        res.resume();
        resolver();
      });
      req.on("error", reintentar);
      req.on("timeout", () => { req.destroy(); reintentar(); });
    };
    const reintentar = () => {
      if (Date.now() - inicio > timeoutMs) return rechazar(new Error(`${tag} no respondió en ${timeoutMs / 1000} s`));
      setTimeout(intentar, 1000);
    };
    intentar();
  });
}

function abrirNavegador(url) {
  const opciones = { detached: true, stdio: "ignore" };
  const proceso = esWindows
    ? spawn("cmd", ["/c", "start", "", url], opciones)
    : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], opciones);
  proceso.on("error", () => log("comparar", `abrí a mano: ${url}`));
  proceso.unref();
}

let apagando = false;
function apagar(codigo = 0) {
  if (apagando) return;
  apagando = true;
  log("comparar", "apagando…");
  for (const hijo of hijos) {
    try {
      if (esWindows) execSync(`taskkill /pid ${hijo.pid} /T /F`, { stdio: "ignore" });
      else hijo.kill("SIGTERM");
    } catch {}
  }
  process.exit(codigo);
}
process.on("SIGINT", () => apagar(0));
process.on("SIGTERM", () => apagar(0));

// --- Arranque -------------------------------------------------------------------
for (const sitio of SITIOS) levantarNext(sitio);
for (const sitio of SITIOS) levantarProxy(sitio);
levantarComparador(PUERTO_COMPARAR);

Promise.all(SITIOS.map((s) => esperarPuerto(s.interno, s.tag)))
  .then(() => {
    const url = `http://localhost:${PUERTO_COMPARAR}/comparar.html`;
    log("comparar", `listo: original en http://localhost:3000, pulido en http://localhost:3001`);
    log("comparar", `abriendo ${url}`);
    abrirNavegador(url);
  })
  .catch((e) => {
    console.error(`[comparar] ${e.message}`);
    apagar(1);
  });
