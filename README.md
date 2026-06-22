# 🌐 MaxInTec Corporate Website & Client Portal

A modern, highly optimized corporate platform and secure client portal built with **Next.js**, **TypeScript**, and **Tailwind CSS**. This system bridges user-centric marketing interfaces with an authenticated client space integrated into a cloud Backend-as-a-Service (BaaS) architecture.

---

## 📐 Decoupled Architectural Strategy

The platform is engineered with a strict operational separation between public content distribution and secure application features:

* **High-Conversion Landing Page**: Fully optimized for search engine indexing (SEO), web vitals (Largest Contentful Paint, First Input Delay), and lightning-fast asset loading to capture potential B2B automation clients.
* **Authenticated Client Portal**: A secure, dynamic single-page dashboard experience allowing active clients to monitor active systems, infrastructure health, and access support channels.

---

## 🔒 Key Technical Highlights & Integrations

### ⚡ Supabase Cloud Infrastructure (BaaS)
The platform offloads infrastructure management to **Supabase**, leveraging its enterprise-grade cloud capabilities:
* **Robust Authentication (Auth)**: Implements JWT-based secure session handling, protecting client data and limiting administrative actions to verified company operators.
* **PostgreSQL Data Layer**: Manages client metadata, portal settings, and permission tracking with strict security policies.
* **Real-Time Subscriptions**: Built on top of PostgreSQL's replication stream, allowing instant updates on the client UI when security or operational metrics shift.

### 🛠️ Modern Frontend Architecture
* **Next.js (App Router)**: Leverages hybrid rendering strategies, using Server-Side Rendering (SSR) for initial SEO-critical pages and Client-Side rendering for interactive dashboard modules.
* **TypeScript**: Strict typing across all components, API wrappers, and data contracts to catch bugs at compile-time and enforce predictable UI states.
* **Tailwind CSS**: Fully customized atomic design system ensuring utility-first, responsive, and lightweight CSS payloads across both mobile and wide monitoring screens.

---

## 🛠️ Technology Stack

* **Frontend Framework:** Next.js (React Framework)
* **Language:** TypeScript
* **Styling Engine:** Tailwind CSS
* **Backend-as-a-Service (BaaS):** Supabase (Auth, Database, Storage)
* **State & Data Management:** React Hooks & Supabase Real-Time Client
