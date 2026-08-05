# 🏢 MaxInTec — Corporate Website & Client Portal

> Comprehensive corporate web platform, landing page ecosystem, and client management portal built for **MaxInTec**, a technology and security firm based in Santa Catarina, Brazil.

---

## 📌 Project Overview

This repository hosts MaxInTec's unified digital platform. Built as a multi-module architecture with **Next.js**, it bridges public-facing marketing channels with secure client management services under a single, scalable codebase.

The system is structured into three core domains:
1. **Landing Page System:** Dynamic, campaign-ready landing pages focused on high conversion and lead acquisition.
2. **Institutional Website:** Comprehensive company showcase covering services, security systems, and organizational identity.
3. **Client Area Portal:** Authenticated portal for managing residential and commercial access control data, including resident registration across managed condominiums.

---

## 🛠️ Tech Stack & Integrations

### **Core Stack**
- **Framework:** [Next.js](https://nextjs.org/) (App Router Architecture)
- **UI Library:** [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript

### **Backend & Database**
- **[Supabase](https://supabase.com/):** Handles user authentication, database management (PostgreSQL), and Row Level Security (RLS).

### **Analytics & Optimization**
- **Analytics & Tracking Tags:** Custom tag management and web analytics integration for conversion and traffic analysis on landing pages.
- **Search Engine Optimization (SEO):** Programmatic `robots.ts` and dynamic `sitemap.ts` generation, OpenGraph metadata, and structured data setup.
- **Direct Messaging:** Integrated WhatsApp conversion triggers and float actions.

---

## 🚀 System Architecture & Modules

### 🌐 **1. Landing Page Engine (`/(landing)`)**
- **Dynamic Routing:** Built with dynamic `[slug]` support to quickly deploy targeted offer pages.
- **Conversion-Driven UI:** Custom components (`LandingPageTemplate`, `Herosection`, `Soluctions`, `Testimonials`).
- **Tracking Ready:** Optimized for paid traffic campaigns with integrated analytics tracking tags.

### 🏢 **2. Institutional Website (`/(institutional)`)**
- **Corporate Presence:** Pages detailing the company history (`/about`), core values, and team.
- **System Showcase:** Dynamic system pages (`/systems/[slug]`) describing specialized security solutions (CFTV, fire prevention, access control, etc.).

### 🔑 **3. Client Area Portal (`/(client)`)**
- **Protected Environment:** Secure authentication workflows (`/login`, `/signup`) managed via custom `useAuth` hook and Supabase.
- **Condominium Resident Registration:** Dedicated tools (`/tools/condominio-registration`) for onboarding residents into MaxInTec's access control databases.

---

## 📂 Project Structure

```text
maxintec-corporate-website
├── docs/                        # Technical guides, setup manuals, and SQL queries
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── USEFUL_QUERIES.sql
│   ├── client-setup.md
│   └── supabase-setup.sql
├── public/                      # Static branding assets, logos, and media
├── src/
│   ├── app/
│   │   ├── (client)/            # Client portal, auth, and resident tools
│   │   ├── (institutional)/     # Institutional pages & dynamic system routes
│   │   ├── (landing)/           # Dynamic landing page campaign engine
│   │   ├── robots.ts            # Dynamic SEO robots configuration
│   │   └── sitemap.ts           # Automated sitemap generation
│   ├── components/              # Modular UI components (Institutional, Landing, UI)
│   ├── data/                    # Centralized content schema (Client, Institutional, Landing)
│   ├── hooks/                   # Custom hooks (e.g., useAuth)
│   └── lib/                     # Database client initialization (supabase.ts)
