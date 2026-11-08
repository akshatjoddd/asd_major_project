# 🏛️ MuseumX – Smart Museum Ticket Booking System

**An intelligent, multilingual chatbot-based museum ticket booking and management platform.**

MuseumX is a desktop-based museum management and ticket booking application designed to simplify the visitor experience through a conversational chatbot, online payments, digital ticketing and centralized administration.

The platform aims to eliminate the limitations of traditional manual ticket booking systems by providing a faster, more accessible and efficient digital solution.

---

## 📌 Problem Statement

Traditional museum ticket booking systems often involve long queues, manual record management, booking errors and inefficient handling of visitors during peak hours.

These limitations negatively affect visitor satisfaction and create additional operational challenges for museum administrators.

MuseumX addresses these problems through an integrated digital ticketing platform that automates the booking process and provides better management of museum operations.

## 🎯 Project Objectives

- Eliminate long queues through online ticket booking.
- Provide an interactive multilingual chatbot.
- Automate ticket reservations and payment processing.
- Support bookings for museum entry, exhibitions and special shows.
- Generate digital tickets with QR codes.
- Reduce manual errors and duplicate bookings.
- Provide administrators with meaningful booking and revenue analytics.

---

## ✨ Key Features

### 1. Conversational Chatbot
- Rule-based intelligent chatbot.
- Interactive ticket booking through conversations.
- English and Hindi language support.
- Information about exhibitions, shows and museum timings.
- Booking assistance and cancellation support.

### 2. Ticket Booking System
- General museum entry bookings.
- Special exhibition bookings.
- Scheduled show bookings.
- Date and time-slot selection.
- Real-time availability checking.
- Booking confirmation.

### 3. Online Payment Integration
- Secure payment gateway integration.
- Online transaction verification.
- Payment status tracking.
- Automated booking confirmation after successful payment.

### 4. Digital QR Tickets
- Unique QR code generation.
- Digital ticket display.
- QR-based visitor verification.
- Prevention of duplicate ticket usage.

### 5. Admin Dashboard
- Manage ticket categories and pricing.
- Manage exhibitions and shows.
- Monitor visitor bookings.
- Track payment records.
- View booking and revenue statistics.

### 6. Analytics and Reporting
- Total bookings and visitors.
- Revenue statistics.
- Popular exhibitions and shows.
- Peak visitor periods.
- Booking trends and operational insights.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Electron | Desktop application framework |
| React.js | Frontend development |
| Node.js | Backend runtime |
| Express.js | REST API development |
| PostgreSQL | Relational database |
| Prisma ORM | Database management |
| JavaScript | Application logic |
| Razorpay | Payment gateway |
| QR Code | Digital ticket generation |
| Recharts | Analytics visualization |

---

## 🏗️ System Architecture

MuseumX follows a modular architecture that separates the desktop application, frontend, backend and database.

```text
                 MUSEUMX
                    |
          Electron Desktop App
                    |
              React Frontend
                    |
          Express REST API
                    |
       +------------+------------+
       |            |            |
    Chatbot      Booking      Admin
     Logic       Services     Services
       |            |            |
       +------------+------------+
                    |
              Prisma ORM
                    |
             PostgreSQL
                    |
          External Integrations
                    |
             Razorpay Gateway
```

### Electron Architecture

Electron provides the desktop environment and secure communication between the renderer and main processes using IPC (Inter-Process Communication).

### Backend Architecture

Express handles API requests, booking operations, payment verification, authentication and database interactions.

### Database Architecture

PostgreSQL stores visitors, administrators, tickets, exhibitions, bookings, payments and chatbot conversations.

---

## 📂 Project Structure

```text
MuseumX/
│
├── electron/
│   ├── main.cjs
│   └── preload.cjs
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── chatbot/
│       ├── admin/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── db.js
│       └── index.js
│
├── package.json
└── README.md
```

*The structure may evolve as development progresses.*

---

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL or a Neon PostgreSQL database
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd MuseumX
```

### 2. Install dependencies

Install the dependencies in the root, client and server directories according to their respective `package.json` files.

### 3. Configure environment variables

Create the required `.env` files.

Example server configuration:

```env
DATABASE_URL="your_database_connection_url"
DIRECT_URL="your_direct_database_connection_url"
PORT=4000

RAZORPAY_KEY_ID="your_razorpay_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
```

Never commit actual database credentials or payment secrets to GitHub.

### 4. Configure Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

Run these commands from the directory containing the relevant Prisma configuration.

### 5. Start the application

Start the Express backend and React frontend using the configured npm scripts.

Launch the Electron desktop application using the root development script.

---

## 🗄️ Database Modules

The planned database consists of the following entities:

| Entity | Description |
|---|---|
| Admin | Administrator accounts |
| User | Museum visitors |
| Ticket | Ticket categories and pricing |
| Exhibition | Museum exhibitions |
| Show | Special museum shows |
| TimeSlot | Scheduled entry and show timings |
| Booking | Visitor reservations |
| BookingItem | Individual items in a booking |
| Payment | Transaction records |
| QRCode | Digital ticket references |
| TicketValidation | Entry validation records |
| ChatSession | Chatbot sessions |
| ChatMessage | Conversation history |

---

## 🔐 Security Considerations

- Electron context isolation.
- Disabled Node.js integration in the renderer.
- Secure IPC communication through preload scripts.
- Hashed administrator passwords.
- Backend-side payment verification.
- Environment-based secret management.
- Booking validation and duplicate-entry prevention.

---

## 👥 Team Members and Responsibilities

| Member | Responsibilities |
|---|---|
| Akshat Rane | Electron development, database architecture, Prisma schema and desktop integration |
| Arnav | Backend development, APIs, booking logic and payment integration |
| Pallav | React frontend, chatbot interface and admin dashboard |



## 🚀 Future Scope

- Support for additional Indian languages.
- Advanced visitor behaviour analytics.
- Personalized exhibition recommendations.
- Integration with museum membership systems.
- Automated email and SMS notifications.
- Multi-museum support.
- Advanced reporting and operational forecasting.

---

## 📊 Project Status

**Currently under development.**

The project is being developed incrementally, with Electron architecture, database design, backend services and frontend functionality being implemented in separate modules.

---

## 🏛️ Project Context

**Domain:** Travel & Tourism  
**Category:** Software  
**Year:** 2024  
**Organization:** Ministry of Culture  
**Department:** National Council of Science Museums

---

## 📄 License

This project is developed for educational and demonstration purposes. Licensing and third-party technology terms apply to their respective components.

---

**MuseumX – Making Museum Visits Smarter, Simpler and More Accessible.**
