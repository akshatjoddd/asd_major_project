# MuseumX Frontend: PRD and TRD

Scope: React UI, chatbot interface, multilingual support and admin dashboard. Project: MuseumX, Smart Museum Ticket Booking System (NCSM, Ministry of Culture problem statement, 2024). Status: Draft v1.

## Part A: Product Requirements (PRD)

## 1. Overview

MuseumX is a chatbot-based museum ticket booking platform. This document covers the frontend share of the project: the visitor-facing React UI with a rule-based multilingual chatbot, and the admin dashboard used by museum staff. The Express APIs, booking logic and payment verification, the Prisma/PostgreSQL database and the Electron shell are owned by teammates and are treated here as dependencies.

## 2. Problem

Manual ticketing causes long queues, booking errors, double bookings and poor visibility for administrators. The frontend must let a visitor complete a booking in a few conversational steps, in their own language, and must give administrators the data they need to run the museum.

## 3. Goals and non-goals

**Goals**

- A visitor can book entry, an exhibition or a show, pay, and receive a QR ticket entirely through the chat.
- The chatbot works in English and Hindi, switchable at any time.
- Administrators can manage exhibitions, shows, slots and pricing, monitor bookings and payments, and view analytics.
- Gate staff can validate a QR ticket and see an immediate valid or invalid result.
- The same React app runs inside Electron and in a normal browser.

**Non-goals (future scope)**

- LLM-based free-text understanding, voice input, WhatsApp or phone channels.
- Languages beyond English and Hindi.
- Visitor accounts or login (visitors book with name, email or phone).
- Native mobile apps, offline mode, multi-museum support.

## 4. Users

| User | Description | Main needs |
| --- | --- | --- |
| Visitor | Member of the public planning a museum visit | Book fast, no queue, own language, get a ticket on screen |
| Museum administrator | Staff managing content and operations | Control pricing and slots, see bookings, payments and trends |
| Gate staff | Staff at the entrance | Scan or enter a code and get an instant verdict |

## 5. User stories

- As a visitor, I can start the chat and choose English or Hindi.
- As a visitor, I can ask about timings, exhibitions and shows without booking.
- As a visitor, I can pick a ticket type, date, slot and number of visitors, review a summary and pay.
- As a visitor, I see a clear message when a slot is sold out and can pick another one.
- As a visitor, I receive a digital ticket with a QR code and can download or print it.
- As a visitor, I can cancel a booking using my booking ID.
- As an administrator, I can log in, add or edit exhibitions, shows, slots and ticket prices.
- As an administrator, I can filter bookings and payments and see revenue and peak-hour charts.
- As gate staff, I can validate a QR code and see whether it is valid, already used or invalid.

## 6. Functional requirements

Priority: P0 is required for the demo, P1 is desirable, P2 is optional.

### 6.1 Chatbot

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-C1 | Chat window with message history, bot and user bubbles, typing indicator and auto-scroll | P0 |
| FR-C2 | Rule-based conversation driven by a state machine defined as data | P0 |
| FR-C3 | Quick-reply buttons at every step, plus typed input matched by keywords | P0 |
| FR-C4 | Intents: book ticket, museum info (timings, prices, exhibitions, shows), cancel booking, help | P0 |
| FR-C5 | Booking summary card with edit options before payment | P0 |
| FR-C6 | Fallback reply and menu when input is not understood; max two retries per step | P0 |
| FR-C7 | Restart or go back at any step | P1 |
| FR-C8 | Chat session and messages stored through the API | P2 |

### 6.2 Multilingual support

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-L1 | English and Hindi for all chatbot text, UI labels and errors | P0 |
| FR-L2 | Language selected at chat start and changeable from a header toggle at any time | P0 |
| FR-L3 | Switching language keeps the booking state and re-renders the current prompt | P1 |
| FR-L4 | Keyword matching works for English, Hindi script and common Hinglish words | P1 |
| FR-L5 | Dates, currency and numbers formatted per locale | P1 |
| FR-L6 | Adding a language requires only a new string file | P1 |

### 6.3 Booking and payment UI

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-B1 | Load ticket types, exhibitions, shows and slot availability from the API | P0 |
| FR-B2 | Show remaining capacity per slot; disable or label sold-out slots | P0 |
| FR-B3 | Collect visitor name and email or phone | P0 |
| FR-B4 | Open Razorpay checkout for the booking amount; show success, failure and cancelled states | P0 |
| FR-B5 | Booking is confirmed only after the backend verifies the payment | P0 |
| FR-B6 | Retry payment for a pending booking without re-entering details | P1 |

### 6.4 Ticket display

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-T1 | Ticket card showing booking ID, visitor, date, slot, items, amount and QR code | P0 |
| FR-T2 | Download or print the ticket (PDF or print view) | P1 |
| FR-T3 | Look up an existing ticket by booking ID plus email or phone | P1 |

### 6.5 Admin dashboard

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-A1 | Admin login with protected routes and logout | P0 |
| FR-A2 | Bookings table with search, filters (date, status, type), pagination and detail view | P0 |
| FR-A3 | Analytics: total bookings, visitors, revenue; bookings per day; peak hours; popular exhibitions and shows | P0 |
| FR-A4 | CRUD for exhibitions, shows and time slots (including capacity) | P0 |
| FR-A5 | Ticket category and price management | P0 |
| FR-A6 | Payments table with status and transaction reference | P1 |
| FR-A7 | CSV export of bookings | P2 |
| FR-A8 | Chat language usage chart | P2 |

### 6.6 QR validation

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-Q1 | Validation page: paste or type a code, or scan with the camera, and show valid, already used or invalid | P0 |
| FR-Q2 | Show visitor name, slot and item count on a valid scan, with large colour-coded result | P0 |
| FR-Q3 | Recent validations list | P2 |

## 7. Conversation flows

**Main menu:** Book tickets, Museum information, Cancel booking, Change language.

**Booking flow**

1. Choose what to book: general entry, special exhibition or show.
2. If exhibition or show: choose which one.
3. Choose a date (quick options for today and tomorrow, plus a date picker).
4. Choose an available time slot.
5. Choose visitor counts per ticket category (for example adult, child, student).
6. Enter name and email or phone.
7. Review the summary card: items, date, slot, total. Options: Confirm, Edit, Cancel.
8. Pay through Razorpay checkout.
9. On success: show the ticket with QR. On failure: offer Retry or Cancel.

**Information flow:** timings, ticket prices, current exhibitions, upcoming shows. Each answer ends with a Book now button.

**Cancel flow:** ask for booking ID and email or phone, show the booking, confirm, call the cancel API, show the result.

## 8. Non-functional requirements

- Performance: chatbot reply under 300 ms for rule steps; dashboard pages load under 2 seconds on seeded demo data.
- Usability: every step is completable with buttons only; keyboard accessible; readable contrast; minimum 16 px text on the chat.
- Responsive: chat works from 360 px wide up to desktop; dashboard works from 1024 px up.
- Reliability: clear loading, empty and error states on every API call; no blank screens.
- Security: admin routes guarded; token kept in memory; no secrets in the client; payment amounts always taken from the server.
- Portability: runs in Electron and in a browser with no code changes.

## 9. Acceptance criteria and demo script

1. Open the chat, select Hindi, and book two adult tickets for a show tomorrow; pay in Razorpay test mode; receive a QR ticket.
2. Switch to English mid-flow; the booking state is preserved.
3. Try to book a sold-out slot; the bot offers alternatives.
4. Cancel the booking by ID; the slot capacity is restored.
5. Log in as admin; the new booking appears in the table; analytics charts update.
6. Add a new show and slot in the dashboard; it appears in the chatbot.
7. Open the validation page; the QR is valid once, then reported as already used.

## 10. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Backend endpoints are not ready when the UI is | Build against a mock API layer behind one switch; agree the contract on day 1 |
| Razorpay checkout blocked inside Electron | Test checkout in the packaged Electron build on day 1; adjust CSP and window options |
| Hindi strings and keyword matching are inconsistent | Keep all strings in one file per language; test the full flow in Hindi |
| Camera scan unreliable | Always provide a paste-the-code fallback on the validation page |
| Scope creep | Hold P1 and P2 items until every P0 passes |

## 11. Timeline (3 days)

- **Day 1:** project shell, routing, i18n setup, chat UI, state machine on mock data, API contract agreed, Razorpay checkout smoke test in Electron.
- **Day 2:** wire booking, payment and ticket steps to real APIs; admin login, bookings table; Hindi strings complete.
- **Day 3:** analytics charts, CRUD pages, QR validation page, seed data, edge cases, polish, demo run-through.

## Part B: Technical Requirements (TRD)

## 12. Runtime context

```
Electron main process  (owned by Electron/DB owner)
   |  preload bridge (contextBridge, optional features only)
React app in renderer / browser  (this document)
   |  fetch over HTTP, JSON
Express REST API  (owned by backend owner)
   |
Prisma ORM  ->  PostgreSQL        External: Razorpay
```

The React app talks to the backend only over HTTP, so it behaves the same inside Electron and in a plain browser. Electron-specific features such as saving or printing a ticket go through an optional bridge object, and the UI falls back to browser behaviour when it is absent.

## 13. Technology choices

| Concern | Choice | Reason |
| --- | --- | --- |
| Build tool | Vite with React | Fast dev server, simple Electron loading |
| Routing | react-router-dom with HashRouter | Works under file:// in packaged Electron |
| Server state | TanStack Query (or plain fetch hooks if time is short) | Caching, loading and error states |
| Client state | React Context plus useReducer for chat and auth | Small app, no extra library |
| i18n | react-i18next with en.json and hi.json | Simple, widely used, FOSS |
| Styling | Tailwind CSS or CSS Modules | Fast, consistent |
| Charts | Recharts | Already chosen in the project |
| QR display | qrcode.react | Renders QR from the code string |
| QR scan | html5-qrcode (camera) with manual entry fallback | FOSS, works in Chromium |
| Forms | React Hook Form, optional | Validation for CRUD forms |
| Payments | Razorpay checkout.js loaded in the client | Order is created and verified by the backend |

## 14. Folder structure (inside client/src)

```
src/
  main.jsx, App.jsx           routes, providers
  api/                       client.js (fetch wrapper), mockApi.js, endpoints.js
  i18n/                      index.js, en.json, hi.json
  chatbot/
    ChatWidget.jsx, MessageList.jsx, QuickReplies.jsx, SummaryCard.jsx
    engine/                  flow.js (state definitions), nlu.js (keyword matcher),
                             reducer.js (state transitions)
    useChat.js
  pages/                     Home, Chat, Ticket, LookupTicket
  components/                Header, LanguageToggle, Loader, ErrorBox, TicketCard
  admin/
    AdminLayout.jsx, Login.jsx, Dashboard.jsx, Bookings.jsx, Payments.jsx
    Exhibitions.jsx, Shows.jsx, Slots.jsx, Pricing.jsx, Validate.jsx
    auth/                    AuthContext.jsx, ProtectedRoute.jsx
    charts/                  BookingsPerDay, PeakHours, RevenueTrend, PopularItems
```

## 15. Routing

| Route | Page | Access |
| --- | --- | --- |
| / | Landing page with Start chat button | Public |
| /chat | Chatbot | Public |
| /ticket/:bookingId | Ticket view | Public with booking code |
| /lookup | Find ticket by ID plus email or phone | Public |
| /admin/login | Admin login | Public |
| /admin | Dashboard analytics | Admin |
| /admin/bookings, /admin/payments | Tables | Admin |
| /admin/exhibitions, /admin/shows, /admin/slots, /admin/pricing | CRUD | Admin |
| /admin/validate | QR validation | Admin or gate role |

HashRouter produces URLs like /#/chat. Keep all navigation through router links.

## 16. Chatbot engine design

**Principle:** the conversation is a finite state machine. States, prompts and transitions live in data; the React components only render the current state. The engine never talks to payments or databases directly; it calls the API layer through named actions.

**Chat state shape**

```js
{
  lang: 'en',
  step: 'ticketType',
  booking: { target: null, refId: null, date: null, slotId: null, counts: {}, visitor: {} },
  messages: [ { id, from: 'bot' | 'user', textKey, params, options } ],
  retries: 0
}
```

Messages store a text key and parameters, not translated text. They are translated at render time, which is what lets a language switch re-render the whole history correctly.

**Flow definition example**

```js
export const flow = {
  start:      { say: 'welcome',      options: ['book', 'info', 'cancel', 'language'], next: { book: 'target', info: 'infoMenu', cancel: 'cancelAsk' } },
  target:     { say: 'askTarget',    options: ['entry', 'exhibition', 'show'],        next: { entry: 'date', exhibition: 'pickExhibition', show: 'pickShow' } },
  date:       { say: 'askDate',      input: 'date',  save: 'booking.date',         next: 'slot' },
  slot:       { say: 'askSlot',      options: 'api:slots',  save: 'booking.slotId', next: 'counts' },
  counts:     { say: 'askCounts',    input: 'counts', save: 'booking.counts',      next: 'visitor' },
  visitor:    { say: 'askVisitor',   input: 'visitor', save: 'booking.visitor',    next: 'summary' },
  summary:    { say: 'showSummary',  options: ['confirm', 'edit', 'cancel'],         next: { confirm: 'pay', edit: 'target', cancel: 'start' } },
  pay:        { action: 'startPayment', onSuccess: 'ticket', onFail: 'payFailed' }
};
```

**Input handling**

1. A button click sends a structured option id and moves to the next state directly.
2. Typed text goes through nlu.js: normalise (lowercase, strip punctuation), then match against keyword lists per intent and per option in the active language, plus English as a shared fallback and a small Hinglish list.
3. Free-input states (date, counts, visitor) validate with simple parsers and show an inline error key on failure.
4. No match: increment retries, show the fallback prompt with the current options; after two failures show the main menu.

**Actions** are async functions in the engine (loadSlots, createBooking, startPayment, cancelBooking). Each returns data or an error key, and the reducer turns that into the next message.

**Global commands** recognised in any state: menu, back, restart, language, help (and their Hindi equivalents).

## 17. Multilingual design

- Two resource files, en.json and hi.json, with identical keys. Namespaces: chat, ui, admin, errors.
- Keys, not sentences, in code. Parameters use i18next interpolation, for example a summary line with the date and amount placeholders.
- Language is stored in React context and mirrored to memory only; the header toggle calls i18n.changeLanguage.
- Use a Devanagari-capable font stack (for example Noto Sans Devanagari with a system fallback) and test line heights.
- Dates and money through Intl.DateTimeFormat and Intl.NumberFormat with en-IN and hi-IN.
- Content that comes from the database (exhibition names, descriptions) needs translated fields. Proposal: the API returns name and nameHi, description and descriptionHi. Raise this with the schema owner early; the fallback is to show the English text.
- A CI-free check: a small script that compares keys between en.json and hi.json and fails if any are missing.

## 18. API contract (proposed, to be agreed with the backend owner)

The UI is written against these shapes. All responses are JSON; errors use a consistent body of the form code and message.

**Public**

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/ticket-types | Categories and prices |
| GET | /api/exhibitions, /api/shows | Active items with descriptions |
| GET | /api/slots?date=&type=&refId= | Slots with remaining capacity |
| POST | /api/bookings | Create a pending booking and hold capacity; returns booking and amount |
| POST | /api/payments/order | Create a Razorpay order for a booking; returns orderId, amount, key |
| POST | /api/payments/verify | Send payment id and signature; returns confirmed booking and QR code string |
| GET | /api/bookings/:id?contact= | Fetch a booking and ticket for a visitor |
| POST | /api/bookings/:id/cancel | Cancel with contact check |

**Admin (bearer token)**

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/admin/login | Returns token and role |
| GET | /api/admin/bookings | Filters and pagination |
| GET | /api/admin/payments | Payment records |
| GET | /api/admin/analytics/summary | Totals for bookings, visitors, revenue |
| GET | /api/admin/analytics/bookings-by-day | Series for line or bar chart |
| GET | /api/admin/analytics/peak-hours | Visitors per slot or hour |
| GET | /api/admin/analytics/popular | Top exhibitions and shows |
| GET/POST/PUT/DELETE | /api/admin/exhibitions, /shows, /slots, /ticket-types | CRUD |
| POST | /api/tickets/validate | Body with QR code; returns valid, used or invalid plus booking summary; marks as used on first success |

The API layer in the client has one file per resource and one switch (environment variable) to use mockApi.js, so the whole UI can run without a backend.

## 19. Payment integration (client side)

1. Chat calls POST /api/bookings, then POST /api/payments/order.
2. The client loads checkout.js from Razorpay once, opens checkout with the order id and key returned by the server, and sets the visitor name and contact as prefill.
3. On the success callback the client sends the payment id, order id and signature to POST /api/payments/verify. Only a successful verify response moves the chat to the ticket step.
4. On dismiss or failure the chat offers Retry (reuse the same booking) or Cancel.
5. The client never decides the amount and never stores the Razorpay secret.
6. Electron note: confirm that the Content Security Policy allows the Razorpay script and frame hosts, and that popups and iframes open correctly in the packaged app. A test-mode order must complete inside the packaged build before day 2 ends.

## 20. Authentication (admin)

- Login form posts credentials; the API returns a JWT and role.
- Token is held in React state (memory) and attached as a bearer header by the fetch wrapper. A page refresh requires a new login, which is acceptable for the demo.
- ProtectedRoute redirects to /admin/login if there is no token; a 401 from any call clears the token and redirects.
- Roles: admin (everything) and gate (validation page only), if the backend supports it.

## 21. Admin dashboard design

**Dashboard page:** four stat cards (bookings, visitors, revenue, today), a bookings per day line chart, a peak hours bar chart, and a popular items bar chart, all from the analytics endpoints. Date range selector (7 days, 30 days, custom).

**Tables:** a shared DataTable component with server-side filters and pagination, row click opens a detail drawer.

**CRUD pages:** a list plus a modal form per resource. Validate in the client (required fields, capacity greater than zero, price not negative) and show server errors inline. Deleting an item that has bookings should be blocked or turned into deactivate; follow the API behaviour.

**Seed data:** the backend seed script should generate around 300 bookings over 30 days with a realistic peak pattern so the charts are meaningful. Agree with the backend owner who writes it.

## 22. Ticket and QR

- TicketCard renders the booking data and a QR code using the code string returned by the API. The QR contains only an opaque code, never personal data.
- Download or print: use the browser print stylesheet for a clean ticket page. If the Electron bridge exposes a save-as-PDF function, use it; otherwise fall back to window.print.
- Validation page: html5-qrcode for the camera, an input for manual entry, and a result panel (green valid, amber already used, red invalid) with a short sound or flash optional.

## 23. Electron integration points

- The renderer is loaded from the Vite dev server in development and from the built files in production; use relative asset paths (Vite base set to './').
- Use HashRouter so routes work from file://.
- API base URL comes from an environment variable at build time, defaulting to http://localhost:4000.
- Optional bridge: window.museumx with saveTicket and print. Components must check that it exists before calling it so the same build works in a browser.
- Do not use Node APIs in the React code; context isolation is on.

## 24. Error handling and UX states

- Every data hook returns loading, error and data; each page renders a loader, an error box with Retry, and an empty state.
- Network failure in the chat produces a bot message with Retry rather than breaking the flow.
- Slot conflicts returned by the API (409 sold out) send the chat back to the slot step with a message and fresh availability.
- A global error boundary prevents a blank screen.

## 25. Testing

- Unit tests (Vitest) for the nlu matcher, the flow reducer and the i18n key parity script.
- Manual end-to-end pass of the demo script in section 9, in English and Hindi, in both browser and packaged Electron.
- Smoke test the mock API mode so the UI can be demoed if the backend or network fails.

## 26. Build and run

- Scripts in client: dev, build, preview, test.
- Environment: VITE\_API\_URL, VITE\_USE\_MOCK, VITE\_RAZORPAY\_KEY\_ID (public key only).
- Never commit .env files or secrets.

## 27. Open questions to settle with the team

1. Final API paths and response shapes in section 18, and who writes the seed data.
2. Translated content fields for exhibitions and shows (nameHi, descriptionHi).
3. Whether ticket PDF generation happens on the server or in the client.
4. Whether the web version for visitors will be deployed, or only the Electron build is demonstrated.
5. Whether a separate gate role exists in the Admin model.
