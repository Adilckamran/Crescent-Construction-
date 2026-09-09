# Crescent Construction — Production-Ready Full-Stack Website

Production-ready web application for **Crescent Construction** (Karachi, Pakistan). Built with a modern full-stack architecture:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, React Router, Lucide Icons.
- **Backend API**: Node.js, Express, TypeScript (`server/`).
- **Database**: Zero-dependency ACID-compliant atomic persistent store (`data/crescent_db.json`), automatically migrated and seeded with projects, services, testimonials, and administrator account.
- **Authentication**: JWT-based role-based access control (RBAC) with password encryption (`bcryptjs`), separating public users from administrators.
- **Direct Image Uploads**: Multi-image file uploader storing into `/uploads` (`public/uploads/`).
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

> **Security Note**: You can change this password at any time inside the Admin Panel under **Settings** (`/admin/settings`).

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
