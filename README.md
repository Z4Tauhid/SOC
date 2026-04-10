# 🛡️ Real-Time Network Traffic Monitoring Dashboard (SOC Style)

A real-time **Security Operations Center (SOC) style dashboard** that captures, analyzes, and visualizes live network traffic on your local machine.

This project uses **TShark** for packet capture, a **Node.js + Socket.IO backend** for real-time data streaming, and a **Next.js frontend** for interactive visualization.

---

## 🚨 Important Note

⚠️ **This project does NOT have a live deployed link**

* This system relies on **local packet capture (TShark)**
* It **must run on your local machine** to monitor your own network traffic
* Because of this, it **cannot be hosted on platforms like Vercel or Netlify**

👉 In short:

> This is a **local-only project designed for real-time network monitoring**

---

## 🚀 Features

* 📡 **Live Packet Capture** using TShark
* 💻 **Connected Devices Monitoring**

  * IP Address
  * MAC Address
* 📊 **Real-Time Bandwidth Tracking**
* 📈 **Interactive Charts**

  * Traffic trend (Line Chart)
  * Bandwidth distribution (Pie Chart)
  * Top devices (Bar Chart)
* 🌐 **Protocol Detection**

  * HTTP, HTTPS, DNS, TCP, UDP
* 🧾 **Live Traffic Logs**
* 🚨 **High Traffic Alerts**
* ⚡ **Real-Time Updates via WebSockets**

---

## 🧠 Tech Stack

### Frontend

* Next.js
* React
* Recharts
* Tailwind CSS

### Backend

* Node.js
* Express
* Socket.IO

### Packet Capture

* TShark (Wireshark CLI)

---

## 🏗️ Architecture

```text
TShark (Packet Capture)
        ↓
Node.js Backend (Processing + Socket.IO)
        ↓
WebSocket Stream
        ↓
Next.js Frontend (Dashboard UI)
```

---

## 📂 Project Structure

```text
project-root/
│
├── backend/
│   ├── server.js
│
├── frontend/
│   ├── src/app/page.js
│   ├── src/app/lib/socket.js
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

### 2️⃣ Install TShark

Download and install Wireshark, which includes TShark:

👉 https://www.wireshark.org/download.html

Make sure TShark is accessible, e.g.:

```text
C:\Program Files\Wireshark\tshark.exe
```

---

### 3️⃣ Update Network Interface

In backend (`server.js`), set your correct interface:

```js
'-i', 'YOUR_INTERFACE_ID'
```

To find interface:

```bash
tshark -D
```

---

### 4️⃣ Run Backend

```bash
node server.js
```

---

### 5️⃣ Run Frontend

```bash
npm run dev
```

---

### 6️⃣ Open Dashboard

```text
http://localhost:3000
```

---

## 📸 What You’ll See

* Connected devices with IP & MAC
* Live bandwidth usage
* Real-time traffic charts
* Packet-level logs
* Protocol classification

---

## ⚠️ Limitations

* Works only on **local network traffic**
* Requires **admin privileges** for packet capture
* Cannot monitor encrypted payloads (only metadata)
* No cloud deployment (local-only architecture)

---

## 🎯 Future Improvements

* 🌍 Geo-location mapping of IPs
* 📱 App detection (YouTube, WhatsApp, etc.)
* 🔍 Advanced filtering & search
* 🧠 Anomaly detection / ML-based alerts
* 📁 Export logs (CSV/JSON)
* 🔐 Authentication system

---

## 💡 Use Cases

* Learning networking & packet analysis
* Cybersecurity projects
* SOC dashboard simulation
* Real-time data streaming systems

---

## 🤝 Contributing

Feel free to fork the repo and enhance it with new features!

---

## 📄 License

MIT License

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and share it!
