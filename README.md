# Crescent Construction

A modern full-stack website for **Crescent Construction**, a construction and waterproofing company based in Karachi, Pakistan.

The website provides information about our construction services, projects, waterproofing solutions, and customer inquiries, along with a secure administration panel for managing website content.
---
## Technology Stack
### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Lucide React

### Backend
- Node.js
- Express.js
- TypeScript

### Authentication & Security
- JWT-based authentication
- Role-based access control
- bcryptjs password hashing
- Protected administrator routes

### Database & Storage
- Persistent local data storage
- Project and service management
- Customer inquiry storage
- Local image uploads

### Email
- Nodemailer
- Gmail SMTP
- Customer inquiry email notifications

---

## Business Information

**Company:** Crescent Construction

**Phone / WhatsApp:** 03272834501

**Email:** crescentconstructionofficial@gmail.com

**Office:** Gulshan-e-Iqbal Block 13 D3, Panama Centre, Office No. M-07, Karachi, Pakistan

**Facebook:**  
https://web.facebook.com/crescent.construction/

**Instagram:**  
https://www.instagram.com/crescentconstruction11/

---

## Main Services

- Rooftop Waterproofing
- Basement Waterproofing
- Terrace Waterproofing
- Water Tank Waterproofing
- Foundation Waterproofing
- Concrete Waterproofing
- Structural Waterproofing
- Under-Construction Waterproofing
- Grey Structure Construction
- Complete Construction & Finishing

---

## Website Features

### Public Website

- Company information
- Construction services
- Waterproofing services
- Project portfolio
- Project details
- Contact and inquiry forms
- WhatsApp contact options
- Email inquiry submission
- Responsive design for desktop and mobile

### Admin Panel

The website includes a protected administrator panel for managing website content and customer inquiries.

Features include:

- Dashboard
- Project management
- Add, edit and delete projects
- Multiple project image uploads
- Featured project management
- Customer inquiry management
- Read/unread inquiry status
- Customer contact information
- WhatsApp reply option
- Email reply option
- Services management
- Testimonials management
- User account management
- Administrator role management
- Login activity and security logs
- Admin password management

---

## Project Structure

```text
crescent-construction-website/
│
├── public/
│   └── uploads/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── ...
│
├── server/
│   ├── routes/
│   ├── middleware/
│   └── ...
│
├── data/
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
Local Development
1. Install Dependencies
npm install
2. Configure Environment Variables

Create a local .env file using .env.example as a reference.

cp .env.example .env

Then configure the required environment variables in your local .env file.

3. Start the Development Server
npm run dev

The application runs the frontend and backend development servers with the configured development setup.

Environment Variables

The application uses environment variables for sensitive configuration.

Example:

PORT=5000
NODE_ENV=development

JWT_SECRET=your-secure-jwt-secret

ADMIN_EMAIL=your-admin-email
ADMIN_DEFAULT_PASSWORD=your-secure-admin-password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-gmail-app-password

CONTACT_RECEIVER_EMAIL=your-email
Security

The actual values must never be published in this repository.

Keep sensitive credentials inside:

.env

or configure them through the environment-variable settings provided by your hosting platform.

Administrator Access

The website contains a protected administrator panel.

Admin panel:

/admin

Administrator credentials are intentionally not included in this repository.

The administrator email and password are configured through environment variables.

Email Configuration

Customer inquiries can be delivered through Gmail SMTP using Nodemailer.

To configure email delivery:

Enable 2-Step Verification on the Gmail account.
Create a Gmail App Password.
Configure the SMTP environment variables.
Add the App Password to the local .env file.
Restart the application.

Example:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_RECEIVER_EMAIL=your-email@gmail.com

Never publish the actual Gmail App Password.

Production Deployment

Before deploying to production, configure the required environment variables on the hosting server.

Example:

NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-secret

ADMIN_EMAIL=your-admin-email
ADMIN_DEFAULT_PASSWORD=your-production-admin-password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-gmail-app-password

CONTACT_RECEIVER_EMAIL=your-email

Install dependencies:

npm install

Build the application:

npm run build

Start the production server:

npm start
Security Guidelines

The following information must never be committed to GitHub:

Administrator passwords
Gmail App Passwords
JWT secrets
API keys
Private authentication credentials
Production secrets
Other sensitive environment variables

The .env file should remain local and should be excluded through .gitignore.

The repository may contain:

.env.example

but it must contain placeholder values only, never real credentials.

Client Feedback

We believe our work speaks for itself.

Clients can request visits to selected completed or ongoing project sites to see our workmanship firsthand.

Client references and feedback may also be shared upon request, subject to client permission.

Contact

For construction, waterproofing, or project inquiries:

Crescent Construction

Phone / WhatsApp: 03272834501

Email: crescentconstructionofficial@gmail.com

Office: Gulshan-e-Iqbal Block 13 D3, Panama Centre, Office No. M-07, Karachi, Pakistan

License

This project is developed for Crescent Construction.

All rights reserved.
