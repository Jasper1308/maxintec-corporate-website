# 🌐 MaxInTec Corporate Website & Client Portal

A modern corporate platform and secure client portal built with **Next.js**, **TypeScript**, and **Tailwind CSS**. This repository centralizes the institutional presentation of MaxInTec alongside the application infrastructure for the remote concierge client portal, fully integrated with **Supabase**.

---

## 📐 Project Structure & Routing Architecture

The platform uses a unified Next.js architecture (utilizing dynamic `[slug]` routing) to cleanly isolate distinct corporate areas within the same codebase:

* **`(institutional)`**: The main corporate website showcasing company info, active clients, success cases, and the technical security ecosystems handled by MaxInTec.
* **`(landing)`**: Dedicated high-conversion pages optimized for specific marketing campaigns and B2B customer acquisition.
* **`(client)`**: The authenticated Client Portal housing specialized operational tools for active contracts.

---

## 🔒 Key Technical Highlights & Integrations

### ⚡ Supabase Cloud Infrastructure (BaaS)
The backend completely offloads user management and asset storage to **Supabase**, leveraging the following features:
* **Authentication & Membership**: Enforces secure signup and login flows for corporate clients accessing the portal.
* **Database Layer (PostgreSQL)**: Manages metadata, credentials, and application states for the portal utilities.
* **Storage Buckets**: Handles asset persistence, using dedicated buckets to store and serve administrative PDFs and system images securely.

### 🏢 Active Portal Feature: Remote Concierge (`internal tool`)
* **Condominium Ingestion System**: A production-ready module inside the client area designed for remote concierge management (*Portaria Remota*).
* **Functionality**: Allows authorized administrators and clients to register, update, and manage resident data (*condôminos*), streamlining access control synchronization.

---

## 🛠️ Technology Stack

* **Frontend Framework:** Next.js (React Lifecycle Router)
* **Language:** TypeScript (Strict Type Safety)
* **Styling Engine:** Tailwind CSS (Atomic Utility System)
* **Backend-as-a-Service (BaaS):** Supabase (Auth, PostgreSQL, and Storage Buckets)
