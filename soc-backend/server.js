const express = require('express');
const { spawn } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require("axios");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// GLOBAL STATE
const devices = {};
const packetHistory = [];

// 🔹 NEW GLOBALS
const geoCache = {};

const deviceNames = {
  "192.168.137.77": "My Phone",
  "192.168.137.45": "Laptop"
};

const macVendors = {
  "00:1A:2B": "Apple",
  "3C:5A:B4": "Samsung"
};

// 🔹 GEO LOOKUP
async function getGeo(ip) {
  if (geoCache[ip]) return geoCache[ip];

  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`);
    geoCache[ip] = res.data;
    return res.data;
  } catch {
    return null;
  }
}

// 🔹 APP DETECTION
function detectApp(domain) {
  if (!domain) return "Unknown";
  if (domain.includes("youtube")) return "YouTube";
  if (domain.includes("whatsapp")) return "WhatsApp";
  if (domain.includes("instagram")) return "Instagram";
  if (domain.includes("netflix")) return "Netflix";
  if (domain.includes("google")) return "Google";
  return "Other";
}

// START TSHARK
const tshark = spawn('C:\\Program Files\\Wireshark\\tshark.exe', [
  '-i', '6',
  '-T', 'fields',
  '-e', 'ip.src',
  '-e', 'ip.dst',
  '-e', 'eth.src',
  '-e', 'frame.len',
  '-e', 'dns.qry.name',
  '-e', 'ip.proto',
  '-e', 'tcp.port',
  '-e', 'udp.port',
  '-E', 'separator=,'
]);

tshark.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');

  lines.forEach(line => {
    if (!line.trim()) return;

    const [
      srcIP,
      destIP,
      mac,
      length,
      domain,
      ipProto,
      tcpPort,
      udpPort
    ] = line.split(',').map(f => f.trim());

    if (!srcIP || !destIP) return;
    if (!srcIP.startsWith("192.168.137.")) return;
    if (srcIP === "192.168.137.1") return;

    const size = parseInt(length) || 0;
    const port = tcpPort || udpPort;

    // PROTOCOL DETECTION
    let protocol = "UNKNOWN";
    if (domain) protocol = "DNS";
    else if (tcpPort === "80") protocol = "HTTP";
    else if (tcpPort === "443") protocol = "HTTPS";
    else if (ipProto === "6") protocol = "TCP";
    else if (ipProto === "17") protocol = "UDP";

    // INIT DEVICE (extended only)
    if (!devices[srcIP]) {
      devices[srcIP] = {
        mac: mac || "unknown",
        name: deviceNames[srcIP] || srcIP,
        vendor: macVendors[mac?.slice(0, 8)] || "Unknown",
        totalBytes: 0,
        bandwidth: 0,
        domains: new Set(),
        domainCount: {},
        ports: {},
        protocols: {},
        apps: {},
        locations: {},
        alerts: [],
        lastSeen: Date.now()
      };
    }

    // update MAC safely
    if (mac && mac !== "00:00:00:00:00:00") {
      devices[srcIP].mac = mac;
    }

    const d = devices[srcIP];

    d.totalBytes += size;
    d.lastSeen = Date.now();

    // EXISTING DOMAIN TRACK
    if (domain) {
      d.domains.add(domain);
      d.domainCount[domain] = (d.domainCount[domain] || 0) + 1;
    }

    // 🔹 NEW TRACKING
    if (port) {
      d.ports[port] = (d.ports[port] || 0) + 1;
    }

    d.protocols[protocol] = (d.protocols[protocol] || 0) + 1;

    const app = detectApp(domain);
    d.apps[app] = (d.apps[app] || 0) + 1;

    // GEO (async)
    getGeo(destIP).then(geo => {
      if (geo && geo.country) {
        d.locations[geo.country] =
          (d.locations[geo.country] || 0) + 1;
      }
    });

    // PACKET HISTORY
    packetHistory.unshift({
      srcIP,
      destIP,
      mac,
      length: size,
      domain: domain || null,
      protocol,
      port,
      time: Date.now()
    });

    if (packetHistory.length > 100) {
      packetHistory.pop();
    }
  });
});

// BANDWIDTH CALCULATION
setInterval(() => {

  Object.keys(devices).forEach(ip => {

    const d = devices[ip];

    d.bandwidth = Math.floor((d.bandwidth * 0.7) + (d.totalBytes * 0.3));
    d.totalBytes = 0;

    // 🔴 ALERTS
    d.alerts = [];

    if (d.bandwidth > 100000) {
      d.alerts.push("High traffic spike");
    }

    if (Object.keys(d.domainCount).length > 50) {
      d.alerts.push("Too many domains");
    }

    if ((d.protocols["DNS"] || 0) > 100) {
      d.alerts.push("Excessive DNS queries");
    }

    if (Date.now() - d.lastSeen > 10000) {
      delete devices[ip];
    }
  });

  const formattedDevices = {};

  Object.keys(devices).forEach(ip => {
    formattedDevices[ip] = {
      ...devices[ip],
      domains: Array.from(devices[ip].domains),
      domainCount: devices[ip].domainCount,
      ports: devices[ip].ports,
      protocols: devices[ip].protocols,
      apps: devices[ip].apps,
      locations: devices[ip].locations,
      alerts: devices[ip].alerts
    };
  });

  io.emit("dashboard", {
    devices: formattedDevices,
    packets: packetHistory
  });

}, 1000);

// ERROR HANDLING
tshark.stderr.on('data', (data) => {
  const msg = data.toString();
  if (msg.includes("Capturing on")) {
    console.log("📡", msg.trim());
  } else {
    console.error("❌ TShark Error:", msg);
  }
});

server.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});