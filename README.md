# Crescent Construction — Production-Ready Full-Stack Website

Production-ready web application for **Crescent Construction** (Karachi, Pakistan). Built with a modern full-stack architecture:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, React Router, Lucide Icons.
- **Backend API**: Node.js, Express, TypeScript (`server/`).
- **Database Architecture**: 
  - **Production Mode**: Supabase PostgreSQL cloud database with automated Row Level Security (RLS) policies and indexes.
  - **Local Development Fallback**: Zero-dependency ACID-compliant atomic persistent store (`data/crescent_db.json`), automatically keeping the website 100% functional even offline or before cloud credentials are added.
- **Storage Architecture**: 
  - **Production Mode**: Supabase Storage bucket (`projects`) for permanent, cloud-persisted CDN-backed project photography that survives server restarts, redeployments, and hosting changes.
  - **Local Development Fallback**: Local `/uploads` directory (`public/uploads/`).
- **Authentication**: JWT-based role-based access control (RBAC) with password encryption (`bcryptjs`), separating public users from administrators.
- **Direct Image Uploads**: Multi-image file uploader storing directly into Supabase Storage or local fallback.
- **Inquiry Delivery**: Real email dispatch using `Nodemailer` with fallback to persistent database storage.

---

## Business Information

- **Company Name**: Crescent Construction
- **Phone / WhatsApp**: 03272834501
- **Official Email**: crescentconstructionofficial@gmail.com
- **Office**: Gulshan-e-Iqbal Block 13 D3, Panama Centre, Office No. M-07, Karachi, Pakistan
- **Facebook**: https://web.facebook.com/crescent.construction/
- **Instagram**: https://www.instagram.com/crescentconstruction11?stkn=b2RqM3d3MmtsYzZw

---

## Quick Start (Local Development)

1. **Clone or open project folder**:
   ```bash
   cd crescent-construction-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` (already done by default):
   ```bash
   cp .env.example .env
   ```

4. **Start Development Servers** (Runs Express API on port 5000 & Vite Client on port 5173 with auto-proxy):
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Initial Administrator Account

On first launch, the database automatically seeds the primary administrator account:

- **Email**: `crescentconstructionofficial@gmail.com`
- **Default Password**: `CrescentAdmin2026!` (configured in `.env`)
- **Admin Panel URL**: `/admin` or via the "Admin Panel" button after logging in at `/login`.

---

## Supabase Production Cloud Setup (PostgreSQL + Supabase Storage)

The backend features a **Dual-Engine Architecture**:
- When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided in `.env`, the system automatically routes all database queries to Supabase PostgreSQL and stores all project photos in Supabase Storage with permanent public CDN URLs.
- If Supabase environment variables are omitted or blank, the system automatically falls back to the local ACID JSON store (`data/crescent_db.json`) and local disk uploads (`public/uploads/`), ensuring zero downtime or crash during development or setup.

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a project (e.g. `crescent-construction`).
2. Set a secure database password and choose your nearest region (e.g., Singapore or Frankfurt).

### Step 2: Run the Database Schema Migration
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository.
3. Copy its entire content, paste it into the Supabase SQL Editor, and click **Run**.
4. This will instantly create:
   - `users` table
   - `projects` table
   - `inquiries` table
   - `services` table
   - `testimonials` table
   - `login_activity` table
   - Performance indexes on slugs, categories, created timestamps, and email lookups
   - Row Level Security (RLS) policies allowing public read of published projects/services and admin-only mutations
   - Public Supabase Storage bucket named `projects` with public image read access policies

### Step 3: Verify the Storage Bucket
1. In your Supabase Dashboard, click on **Storage** in the left sidebar.
2. Confirm the `projects` bucket is listed and marked as **Public**.
   *(If not present, simply click "New bucket", name it `projects`, toggle **Public bucket** ON, and click Save).*

### Step 4: Add Supabase Credentials to `.env`
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Copy:
   - **Project URL**
   - **service_role key** (under Project API keys; click reveal)
3. Paste them into your `.env` file:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJh...your-service-role-key...
   SUPABASE_STORAGE_BUCKET=projects
   ```
   *(Note: The service_role key is kept strictly on the Node.js backend server and is never sent or exposed to client browsers).*

### Step 5: Push Existing Local Data & Photos to Supabase
Run the built-in 1-click migration script:
```bash
npm run db:push-to-supabase
```
This script will:
- Connect securely to your Supabase project.
- Upload all photos from `public/uploads/` to the Supabase Storage bucket `projects`.
- Upsert all initial projects, users, inquiries, services, and testimonials from `data/crescent_db.json` into Supabase PostgreSQL.
- Replace all local `/uploads/...` paths with permanent Supabase Storage CDN URLs.

### Step 6: Verify Admin Project Flow in Production
1. Start the server (`npm run dev` or `npm start`).
2. Log into the Admin Panel at `/login` with your admin credentials.
3. Go to **Projects** (`/admin/projects`) -> Click **Add New Project**.
4. Upload images and fill in details.
5. Click **Save Project**.
6. The project will now be permanently saved in Supabase PostgreSQL and images stored in Supabase Storage. Even if you redeploy, restart the server, or rebuild containers, all your project photos and data will remain intact!

---

## Production Deployment

### Option 1: VPS / Dedicated Server / Node.js Host (Render, Railway, DigitalOcean, Ubuntu VPS)

1. Set environment variables on your host:
   ```env
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your-secure-random-jwt-secret-string
   ADMIN_EMAIL=crescentconstructionofficial@gmail.com
   ADMIN_DEFAULT_PASSWORD=YourStrongAdminPassword123!
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=crescentconstructionofficial@gmail.com
   SMTP_PASS=your-gmail-app-password
   CONTACT_RECEIVER_EMAIL=crescentconstructionofficial@gmail.com
   ```

2. Build and start:
   ```bash
   npm install
   npm run build
   npm start
   ```
   The production Express server automatically serves both the API routes (`/api/*`), image uploads (`/uploads/*`), and the compiled Vite frontend (`dist/`) on port 5000 with SPA catch-all routing!

### Option 2: PM2 Process Manager (for VPS)

```bash
npm run build
pm2 start "npm start" --name "crescent-website"
pm2 save
```

---

## Admin Panel Features

- **Dashboard (`/admin`)**: Key statistics (Total Projects, Inquiries, Unread inquiries, Registered Users, Login Activity), recent leads, and quick actions.
- **Projects (`/admin/projects`)**: Add, edit, delete projects; direct drag-and-drop / multiple image upload; toggle featured status; manage descriptions and completion years.
- **Inquiries (`/admin/inquiries`)**: View all customer quote requests; filter by Read/Unread; view full customer message, budget, and location; direct one-click "Reply on WhatsApp" and "Reply via Email" buttons; toggle status and delete records.
- **Services (`/admin/services`)**: Edit service titles, descriptions, icons, and CTA text.
- **Testimonials (`/admin/testimonials`)**: Manage client feedback, ratings, and sample reviews.
- **User Accounts (`/admin/users`)**: View registered accounts, toggle active/inactive status, grant/revoke administrator privileges.
- **Login Activity (`/admin/activity`)**: Security audit trail of user and admin logins with timestamps, success/failure status, and IP addresses.
- **Settings (`/admin/settings`)**: Secure admin password reset form.

---

## Email Configuration (Gmail SMTP)

To enable live email delivery to `crescentconstructionofficial@gmail.com`:
1. Log in to the Google Account `crescentconstructionofficial@gmail.com`.
2. Enable 2-Step Verification in Google Account Security.
3. Generate an **App Password**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Select "Mail" and generate a 16-character code.
4. Paste the 16-character code into `.env`:
   ```env
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```
5. Restart the server. Now, whenever any visitor submits the contact form, an email will arrive in your Gmail inbox!
