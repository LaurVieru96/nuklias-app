# 🏗️ Nuklias Dashboard - Project Documentation

## 📌 1. Overview General

**Nuklias** este o platformă completă (Full-Stack) pentru gestionarea lead-urilor, task-urilor și a activității echipei ("Digital Architects"). Aplicația centralizează fluxul de lucru, oferind un dashboard intuitiv pentru administrarea clienților și a proiectelor.

### 🎯 Scopul Proiectului
- **Centralizare**: Colectarea lead-urilor din diverse surse (site, manual).
- **Procesare**: Urmărirea statusului lead-urilor (New -> Won/Lost).
- **Productivitate**: Gestionarea task-urilor asociate membrilor echipei.

### 👥 Public Țintă
- Administratori (vizibilitate totală).
- Membrii echipei (gestionare task-uri și lead-uri asignate).

---

## 🧱 2. Arhitectură Generală

Proiectul este structurat ca o aplicație **Full-Stack** separată în două repozitorii/foldere principale (Monorepo-style workspace):

### 📂 Structura Workspace-ului (`saca/`)

1.  **`nuklias-app/` (Backend)**
    -   Servește API-ul RESTful.
    -   Gestionează baza de date și autentificarea.
    -   **Tehnologii**: Node.js, Express, PostgreSQL, Drizzle ORM.
2.  **`Modern-Spaces/` (Frontend)**
    -   Interfața utilizator (SPA).
    -   Consumă API-ul backend.
    -   **Tehnologii**: React, Vite, TailwindCSS, Radix UI.

### 🏗️ Arhitectura Backend (`nuklias-app`)

-   **`server/index.ts`**: Entry-point. Configurează Express, CORS, Session, și rutele.
-   **`server/db/`**: Schema bazei de date (`schema.ts`) și conexiunea.
-   **`server/routes/`**: Definirea endpoint-urilor API (`auth`, `leads`, `tasks`, `users`).
-   **`server/services/`**: (Opțional) Logică de business complexă separată de controllere.
-   **`shared/types.ts`**: **CRITIC**. Fișier care conține interfețele TypeScript partajate (contractul de date).

### 🖥️ Arhitectura Frontend (`Modern-Spaces`)

-   **`client/src/pages/`**: Paginile aplicației (Routing).
-   **`client/src/components/`**: Componente reutilizabile (UI).
-   **`client/src/lib/api.ts`**: Clientul HTTP (wrapper peste fetch/axios) care comunică cu Backend-ul.
-   **`client/src/hooks/`**: Custom hooks (ex: `useAuth`, `useLeads`) folosind TanStack Query.

---

## 🔗 3. Legături și Fluxuri

### 📡 Fluxul de Date (Data Flow)

1.  **User Action**: Utilizatorul apasă "Create Lead" în Frontend.
2.  **Frontend State**: React Hook Form colectează datele -> `useCreateLead` (TanStack Query) este apelat.
3.  **API Call**: `client/src/lib/api.ts` trimite un POST request către `http://localhost:3000/api/leads`.
    -   *Include cookie-ul de sesiune pentru autentificare.*
4.  **Backend Route**: `server/routes/leads.ts` interceptează cererea.
5.  **Auth Middleware**: Verifică dacă `req.user` există (Passport session).
6.  **Validation**: Zod validează body-ul request-ului.
7.  **Database**: Drizzle ORM execută `db.insert(leads)...`.
8.  **Response**: Backend returnează obiectul creat (JSON).
9.  **Frontend Update**: TanStack Query invalidează cache-ul `['leads']` -> Lista se actualizează automat.

---

## 🧠 4. Logică Importantă

### 🔐 Autentificare (Session-Based)
-   Folosește **Passport.js** cu strategia `Local`.
-   Sesiunile sunt stocate în baza de date PostgreSQL (`connect-pg-simple`) pentru persistență și scalabilitate.
-   **Fișier cheie**: `server/config/passport.ts` (strategia) și `server/index.ts` (configurarea sesiunii).

### 🛡️ Type Safety (Shared Types)
-   Fișierul `shared/types.ts` din `nuklias-app` este sursa adevărului.
-   Frontend-ul ar trebui să importe aceste tipuri (prin symlink sau copy-paste sincronizat) pentru a garanta că datele trimise corespund cu schema DB.

### 🗄️ ORM (Drizzle)
-   Folosește `drizzle-orm` pentru interogări SQL-like dar type-safe.
-   Schema este definită în `server/db/schema.ts`.
-   Migrările sunt gestionate prin `drizzle-kit push` (schema push).

---

## 🌐 5. Frontend (`Modern-Spaces`) details

-   **Framework**: React 18 + Vite.
-   **Styling**: TailwindCSS + `tailwindcss-animate`. Componente UI din **Shadcn/UI** (bazate pe Radix UI).
-   **State Management**:
    -   Server State: **TanStack Query** (React Query).
    -   Local State: `useState`, `useContext`.
    -   Forms: `react-hook-form` + `zod` resolver.
-   **Routing**: `wouter` (lightweight router) sau implementare custom de routing.
-   **Internationalization**: `i18next` (suport pentru EN, RO, DE).

---

## ⚙️ 6. Backend (`nuklias-app`) details

-   **Runtime**: Node.js.
-   **Framework**: Express.js.
-   **API Structure**:
    -   `GET /api/leads` (List)
    -   `POST /api/leads` (Create)
    -   `PATCH /api/leads/:id` (Update)
-   **Validation**: `zod` middleware pentru validarea input-urilor.
-   **Security**: `cors` (configurat pentru frontend URL), `helmet` (recomandat), cookie-uri `httpOnly`.

---

## 🗄️ 7. Baza de Date

-   **Tip**: PostgreSQL (Hosting: Neon Tech serverless).
-   **Tabele Principale**:
    1.  **Users**: `id`, `email`, `password` (hashed), `role` (admin/member).
    2.  **Leads**: Entități de vânzări. `status` (new, won...), `priority`. Relatie: User (assignedTo).
    3.  **Tasks**: Sarcini de lucru. Legate de Users și opțional de Leads.

---

## 🔐 8. Configurări & Env

### Backend (`nuklias-app/.env`)
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
SESSION_SECRET="complex_secret_string"
CLIENT_URL="http://localhost:5000"  # URL-ul frontend-ului pentru CORS
PORT=3000
NODE_ENV="development"
```

### Frontend (`Modern-Spaces/.env` sau `.env.local`)
```env
VITE_API_URL="http://localhost:3000/api" # Sau proxy în vite.config.ts
```

---

## 🚀 9. Run & Development

### Pornire Backend
1.  Navighează în `nuklias-app/`.
2.  `npm install`
3.  `npm run db:push` (Sincronizează schema cu DB).
4.  `npm run db:seed` (Populează cu useri default).
5.  `npm run dev` (Pornește serverul pe port 3000).

### Pornire Frontend
1.  Navighează în `Modern-Spaces/`.
2.  `npm install`
3.  `npm run dev` (Pornește clientul pe port 5000).

### Credențiale Default (Seed)
-   **Admin**: `admin@nuklias.com` / `Admin123!`
-   **Member**: `member@nuklias.com` / `Member123!`

---

## 🧩 10. Extensibility

-   **Adăugare Rută Nouă**:
    1.  Creează `server/routes/newEntity.ts`.
    2.  Importă și folosește în `server/index.ts`: `app.use('/api/new', newEntityRoutes)`.
-   **Modificare DB**:
    1.  Editează `server/db/schema.ts`.
    2.  Rulează `npm run db:push`.
    3.  Actualizează `shared/types.ts`.
-   **Adăugare Pagină în Frontend**:
    1.  Creează componenta în `client/src/pages/`.
    2.  Adaugă ruta în `App.tsx` (sau routerul principal).

---

## 🤖 11. NOTE PENTRU ALT CHATBOT AI

Dacă preiei acest proiect, citește cu atenție:

1.  **Shared Types**: Orice modificare a structurii datelor (DB schema) **TREBUIE** reflectată în `shared/types.ts`. Frontend-ul și Backend-ul depind de aceste interfețe. Dacă le modifici, verifică impactul în ambele proiecte.
2.  **Auth Flow**: Nu încerca să implementezi JWT over headers decât dacă este cerut explicit. Proiectul este configurat pentru **Session Cookies**. Asigură-te că `credentials: true` este setat în cererile Frontend (CORS).
3.  **TanStack Query**: Frontend-ul folosește React Query. Nu folosi `useEffect` pentru data fetching simplu. Folosește `useQuery` și `useMutation`. Invalidează cheile corecte (`queryClient.invalidateQueries`) după mutații.
4.  **Tailwind**: Nu scrie CSS manual. Folosește clasele utilitare Tailwind.
5.  **Deployment**: Proiectul este pregătit pentru Render (backend) și Netlify/Vercel (frontend). `trust proxy` este activat în Express pentru asta.

---
*Generated by Antigravity Agent*
