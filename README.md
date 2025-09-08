# Tamagochi App – Cloudflare-Powered Virtual Pet

**Tamagochi App** is a playful, experimental project built with **Next.js** and  
deployed on **Cloudflare Pages** + **Workers**.  

The goal is to reimagine the classic Tamagotchi experience as a modern,  
serverless web application – where users can raise, interact with, and care  
for a virtual pet directly in the browser.

---

## ✨ Key Features (Planned)

- 🐣 **Virtual Pet Simulation** – feed, play, and interact with your Tamagochi  
- 🕹️ **Mini-Games** – earn points and rewards to keep your pet happy  
- 🗂️ **Persistent Data** – Cloudflare KV / D1 integration for saving progress  
- 🎨 **Custom Skins** – personalize your pet with different looks  
- 🌐 **Cloudflare-Native Hosting** – fast, reliable, and globally distributed  

---

## 🛠️ Technology Stack

- **Frontend:** Next.js (React + TailwindCSS)  
- **Platform:** Cloudflare Pages + Workers  
- **Database:** D1 (planned)  
- **Storage:** R2 (for images & assets, planned)  
- **KV:** Session and pet state persistence  

---

## 🚀 Development

Run the development server:

```bash
pnpm dev
````

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

Build and deploy with Wrangler:

```bash
pnpm run deploy
```

Before deployment, make sure to configure secrets and bindings (KV, D1, R2)
via the [Cloudflare Dashboard](https://dash.cloudflare.com).

---

## 📅 Current Status

🚧 **Prototype Stage** – basic setup with Next.js and Cloudflare integration.
The gameplay logic (pet simulation, state persistence) is under development.

---

## 📌 Roadmap

* [ ] Core pet simulation (feed, sleep, play)
* [ ] Persistent storage with KV or D1
* [ ] Mini-games integration
* [ ] Custom skins / themes
* [ ] Leaderboards & community features

---

## 🌍 Part of the HSWLP Ecosystem

Tamagochi App is one of several experimental projects within
the **HSWLP (Hybrid Service Workflow Launch Platform)** initiative,
exploring how Cloudflare-native applications can power creative SaaS tools.

Other projects include:

* **Yume** – music & image sharing
* **IdeaBoard** – idea voting & collaboration
* **HSWLP\:Talk** – video conferencing
* **PlayCore** – game server hosting dashboard

---

## 📜 License

Released under the **MIT License**.

---

**Tamagochi App** reimagines the nostalgic virtual pet as a
**modern, serverless web experience** for the Cloudflare era.

