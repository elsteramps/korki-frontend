import express from "express";
import Stripe from 'stripe';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import mysql from "mysql2/promise";
import crypto from "crypto";
import FormData from "form-data";
import mime from "mime-types";

const SECRET_KEY = "your-secret-key"; // Upewnij się, że jest taki sam, jak przy generowaniu tokenów

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sorokokorki.com.pl',
  ],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// 3) Webhook Stripe — musi przyjmować surowe body!
// Wymagane paczki:
// npm i form-data mime-types
// (Node 18+ ma globalny fetch; jeśli używasz starszego – doinstaluj node-fetch)

// Założenia: masz już w pliku zmienne/obiekty:
// - const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
// - const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
// - const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
// - const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
// - const TMP_DIR = ...; const ORDERS_DIR = ...;
// - const ORDERS = new Map(); // sessionId -> { tempIds, name, email, phone, level, variant, ... }
// UWAGA NA KOLEJNOŚĆ MIDDLEWARE: ten endpoint MUSI być zdefiniowany PRZED app.use('/api', express.json(...))


  // surowe body – wymagane do weryfikacji podpisu
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    console.log("[WEBHOOK] hit", new Date().toISOString());
    const sig = req.headers["stripe-signature"];    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("[WEBHOOK] signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("[WEBHOOK] event:", event.type, event.id);

    // Interesują nas potwierdzenia płatności
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const order = ORDERS.get(session.id);

      if (!order) {
        console.warn("[WEBHOOK] no order for session", session.id);
        return res.json({ received: true });
      }

      if (order.status === "paid" && order.notified) {
        console.log("[WEBHOOK] duplicate event, already processed", session.id);
        return res.json({ received: true });
      }

      order.status = "paid";

      // 1) Przenieś pliki z TMP do katalogu zamówienia
      const orderDir = path.join(ORDERS_DIR, session.id);
      if (!fs.existsSync(orderDir)) fs.mkdirSync(orderDir, { recursive: true });

      const movedPaths = [];
      for (const tempName of order.tempIds || []) {
        const src = path.join(TMP_DIR, tempName);
        const dest = path.join(orderDir, tempName);
        try { fs.renameSync(src, dest); movedPaths.push(dest); }
        catch (e) { console.error("[WEBHOOK] move file error:", e.message); }
      }
      console.log("[WEBHOOK] movedPaths:", movedPaths);

      // 2) Wyślij notyfikację tekstową do Telegrama
      const amount = (session.amount_total || 0) / 100;
      const text = [
        "✅ Nowe zamówienie (opłacone)",
        `Poziom: ${order.level}`,
        `Wariant: ${order.variant}`,
        `Kwota: ${amount.toFixed(2)} PLN`,
        `👤 ${order.name}`,
        `📧 ${order.email}`,
        `📞 ${order.phone}`,
        `📝 ${order.description || '-'}`,
        `Session: ${session.id}`,
      ].join("\n");

      try {
        const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
        });
        const j = await resp.json().catch(() => ({}));
        if (!resp.ok || j?.ok === false) console.error("[Telegram] sendMessage error:", resp.status, j);
        else console.log("[Telegram] message sent");
      } catch (e) {
        console.error("[Telegram] sendMessage exception:", e);
      }

      // 3) Wyślij załączniki (obrazy jako Photo; fallback do Document). Inne jako Document.
      async function tgPost(url, fd) {
        const resp = await fetch(url, { method: "POST", body: fd });
        const text = await resp.text();
        let parsed; try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
        if (!resp.ok || parsed?.ok === false) {
          console.error("[Telegram]", url, "status:", resp.status, "resp:", parsed);
          return false;
        }
        return true;
      }

      for (const p of movedPaths) {
        try {
          const ext = path.extname(p).toLowerCase();
          const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
          const filename = path.basename(p);
          const contentType = mime.lookup(p) || "application/octet-stream";

          if (isImage) {
            // najpierw spróbuj jako PHOTO
            const fd1 = new FormData();
            fd1.append("chat_id", TELEGRAM_CHAT_ID);
            fd1.append("photo", fs.createReadStream(p), { filename, contentType });
            const ok = await tgPost(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, fd1);
            if (!ok) {
              const fd2 = new FormData();
              fd2.append("chat_id", TELEGRAM_CHAT_ID);
              fd2.append("document", fs.createReadStream(p), { filename, contentType });
              await tgPost(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, fd2);
            }
          } else {
            // inne pliki jako DOCUMENT
            const fd = new FormData();
            fd.append("chat_id", TELEGRAM_CHAT_ID);
            fd.append("document", fs.createReadStream(p), { filename, contentType });
            await tgPost(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, fd);
          }
        } catch (e) {
          console.error("[Telegram] attach exception:", e);
        }
      }

      try {
  // nie wysyłaj ponownie, jeśli webhook się powtarza
  if (!order.emailed) {
    const toEmail =
      order.email ||
      session?.customer_details?.email ||
      ""; // jeśli pusto – nie wysyłamy

    if (toEmail) {
      const amount = (session.amount_total || 0) / 100;
      const friendlyLevel = order.level === "podstawowy" ? "Poziom podstawowy" : "Poziom rozszerzony";
      const friendlyVariant =
        order.variant === "z_wyjasnieniami"
          ? "Z wyjaśnieniami i pełnym omówieniem"
          : "Bez wyjaśnień (same odpowiedzi)";

      const subject = `Potwierdzenie zamówienia – SorokoKorki (${friendlyLevel}, ${friendlyVariant})`;
      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;color:#111827">
          <h2 style="margin:0 0 8px">Dziękujemy za zamówienie!</h2>
          <p style="margin:0 0 12px">Otrzymaliśmy Twoją płatność. Zlecenie zostało przyjęte do realizacji.</p>

          <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:12px;margin:12px 0">
            <div><strong>Poziom:</strong> ${friendlyLevel}</div>
            <div><strong>Wariant:</strong> ${friendlyVariant}</div>
            <div><strong>Kwota:</strong> ${amount.toFixed(2)} PLN</div>
            ${order.description ? `<div><strong>Opis:</strong> ${order.description}</div>` : ""}
            <div><strong>Identyfikator płatności:</strong> ${session.id}</div>
          </div>

          <p style="margin:12px 0">Materiały prześlemy na ten adres e-mail. Szacowany czas realizacji: do 12 godzin.</p>
          <p style="margin:12px 0;color:#6B7280">Jeżeli masz dodatkowe informacje lub pytania, po prostu odpowiedz na tę wiadomość lub napisz na <a href="mailto:kontakt@sorokokorki.com.pl">kontakt@sorokokorki.com.pl</a>.</p>

          <p style="margin:16px 0">
            <a href="https://sorokokorki.com.pl" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600">Przejdź na stronę główną</a>
          </p>

          <p style="margin:12px 0;color:#6B7280;font-size:12px">Ta usługa ma charakter edukacyjny (sprawdzenie/wyjaśnienie rozwiązań).</p>
        </div>
      `;

      const text = [
        "Dziękujemy za zamówienie!",
        "Otrzymaliśmy Twoją płatność. Zlecenie zostało przyjęte do realizacji.",
        `Poziom: ${friendlyLevel}`,
        `Wariant: ${friendlyVariant}`,
        `Kwota: ${amount.toFixed(2)} PLN`,
        order.description ? `Opis: ${order.description}` : "",
        `Session: ${session.id}`,
        "Materiały prześlemy na ten adres e-mail. Szacowany czas realizacji: do 12 godzin.",
        "W razie pytań: kontakt@sorokokorki.com.pl",
      ].filter(Boolean).join("\n");

      const sendRes = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.EMAIL_FROM,
        to: [toEmail],
        subject,
        html,
        text,
      });

      if (sendRes?.error) {
        console.error("[Resend] send error:", sendRes.error);
      } else {
        console.log("[Resend] email sent:", sendRes?.data?.id || "(no id)");
        order.emailed = true; // flaga idempotencji
      }
    } else {
      console.warn("[Resend] brak e-maila w zamówieniu – pomijam wysyłkę");
    }
  }
} catch (e) {
  console.error("[Resend] exception:", e);
}


      order.notified = true; // prosta idempotencja dla ponownych webhooków
    }

    // Zawsze odpowiadamy 200/JSON, żeby Stripe nie retryował bez potrzeby
    res.json({ received: true });
  });

// Użycie w server.mjs:
// import { registerStripeWebhook } from './webhook.js' (jeśli wydzielisz)
// registerStripeWebhook(app, stripe, STRIPE_WEBHOOK_SECRET, { TMP_DIR, ORDERS_DIR, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, ORDERS });


app.use(bodyParser.json());


dotenv.config();

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// server.js — Express + Stripe Checkout + Telegram, upload temp -> notify after payment
// Wymagania: Node 18+, npm i express multer stripe form-data dotenv
// .env: STRIPE_SECRET_KEY=...\nSTRIPE_WEBHOOK_SECRET=...\nTELEGRAM_TOKEN=...\nTELEGRAM_CHAT_ID=...\nBASE_URL=https://twoj-front.pl

// ====== ŚCIEŻKI ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(__dirname, 'uploads_tmp');
const ORDERS_DIR = path.join(__dirname, 'uploads_orders');
for (const d of [TMP_DIR, ORDERS_DIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

// ====== KONFIG ======
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
// Token bota Telegrama i ID czatu
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!process.env.STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn('[WARN] Brakuje zmiennych środowiskowych (.env): STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / TELEGRAM_TOKEN / TELEGRAM_CHAT_ID');
}

// ====== CENNIK (grosze) — DOPASUJ DO LEGALNEJ USŁUGI EDUKACYJNEJ ======
const PRICE_TABLE = {
  podstawowy: { z_wyjasnieniami: 200, bez_wyjasnien: 200 }, // 40.00 / 20.00 PLN
  rozszerzony: { z_wyjasnieniami: 200, bez_wyjasnien: 200 }, // 60.00 / 30.00 PLN
};

// ====== PAMIĘĆ ZAMÓWIEŃ (demo) ======
// Klucz: sessionId (Stripe) -> order
const ORDERS = new Map();

// ====== MULTER (upload do TMP) ======
const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'
]);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}_${crypto.randomUUID()}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true); else cb(new Error('Niedozwolony typ pliku'));
  },
  limits: { fileSize: 20 * 1024 * 1024, files: 10 }, // 20MB, max 10 plików
});

// JSON dla zwykłych endpointów (NIE dla webhooka Stripe)
app.use('/api', express.json({ limit: '2mb' }));

// Zdrowie
app.get('/health', (req, res) => res.json({ ok: true }));

// 1) Upload do bufora (TMP) — żadnych powiadomień przed płatnością
app.post('/api/uploads/temp', upload.array('files', 10), (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'Brak plików' });
  const tempIds = files.map(f => f.filename);
  return res.json({ tempIds });
});

// 2) Utwórz zamówienie + Checkout Session
app.post('/api/orders', async (req, res) => {
  try {
    const { level, variant, name, email, phone, description, tempIds } = req.body || {};
    if (!PRICE_TABLE[level]?.[variant]) return res.status(400).json({ error: 'Nieprawidłowy wariant' });
    if (!name || !email || !phone) return res.status(400).json({ error: 'Brak danych kontaktowych' });
    if (!Array.isArray(tempIds) || tempIds.length === 0) return res.status(400).json({ error: 'Brak plików' });

    // Wygeneruj wewnętrzne ID zamówienia
    const orderId = crypto.randomUUID();
    const amount = PRICE_TABLE[level][variant];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'pln',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'pln',
          unit_amount: amount,
          product_data: {
            name: `Usługa asynchroniczna – ${level}/${variant}`,
            description: 'Edukacyjna usługa asynchroniczna: sprawdzenie/wyjaśnienie materiałów (do 12h).'
          }
        }
      }],
      customer_creation: 'always',
      phone_number_collection: { enabled: true },
      success_url: `${BASE_URL}/thankyou?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/?status=cancelled`,
      metadata: { level, variant, orderId }
    });

    // Zachowaj dane zamówienia do wykorzystania po płatności
    ORDERS.set(session.id, {
      sessionId: session.id,
      orderId,
      level,
      variant,
      name,
      email,
      phone,
      description: description || '',
      tempIds,
      status: 'pending',
      createdAt: Date.now(),
    });

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('/api/orders error', err);
    res.status(500).json({ error: 'Błąd tworzenia płatności' });
  }
});

// publiczny, tylko do odczytu podstawowych danych zamówienia
app.get('/api/orders/:sessionId/summary', (req, res) => {
  const { sessionId } = req.params;
  const order = ORDERS.get(sessionId); // zapisywaliśmy przy tworzeniu sesji
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json({
    sessionId: order.sessionId,
    status: order.status,       // 'pending' lub 'paid'
    email: order.email,
    name: order.name,
    level: order.level,
    variant: order.variant,
  });
});



// ====== Sprzątanie starych wpisów i plików TMP (co 6h) ======
setInterval(() => {
  const now = Date.now();
  const TTL_MS = 24 * 60 * 60 * 1000; // 24h
  // Usuń pending >24h
  for (const [sid, o] of ORDERS.entries()) {
    if (o.status === 'pending' && now - o.createdAt > TTL_MS) ORDERS.delete(sid);
  }
  // Usuń pliki w TMP starsze niż 24h
  for (const name of fs.readdirSync(TMP_DIR)) {
    const p = path.join(TMP_DIR, name);
    try {
      const st = fs.statSync(p);
      if (now - st.mtimeMs > TTL_MS) fs.unlinkSync(p);
    } catch {}
  }
}, 6 * 60 * 60 * 1000);



const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.padEnd(32, 'x');
const IV_LENGTH = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

const decrypt = (data) => {
  const [ivHex, encryptedData] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
const newLocal = new Resend(process.env.RESEND_API_KEY);
// const SCOPES = ["https://www.googleapis.com/auth/calendar"];
// const credentials = JSON.parse(fs.readFileSync("soy-reporter-341221-68f28652be33.json", "utf-8"));

// const auth = new google.auth.JWT(
//   credentials.client_email,
//   null,
//   credentials.private_key,
//   SCOPES
// );

// const calendar = google.calendar({ version: "v3", auth });



const sendConfirmationEmail = async (to, name, date, time) => {
  try {
    const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Potwierdzenie rezerwacji lekcji",
      html: `
        <h2>Cześć ${name},</h2>
        <p>Dziękujemy za rezerwację lekcji!</p>
        <ul>
          <li><strong>📅 Data:</strong> ${date}</li>
          <li><strong>⏰ Godzina:</strong> ${time}</li>
        </ul>
        <p>W razie jakichkolwiek pytań proszę odpowiedzieć na tego maila. Jeśteśmy również do dyspozycji pod numerem telefonu <strong>573254629</strong></p>

        <p>Pozdrawiam,<br>Iwan z <strong>SorokoKorki</strong></p>
      `,
    });

    if (error) {
      console.error("❌ Błąd wysyłki Resend:", error);
    } else {
      console.log(`✔️ E-mail wysłany przez Resend do: ${to}`);
    }
  } catch (err) {
    console.error("❌ Błąd ogólny wysyłania e-maila:", err);
  }
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Pobierz nagłówek Authorization
  const token = authHeader && authHeader.split(" ")[1]; // Wyodrębnij token

  if (!token) {
    return res.status(403).json({ error: "Brak tokenu." }); // Brak tokenu - odmów dostępu
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Nieprawidłowy token." }); // Token nieważny
    }

    req.user = user; // Dodaj zweryfikowanego użytkownika do żądania
    next(); // Kontynuuj przetwarzanie żądania
  });
}

export default authenticateToken;

// const createGoogleMeet = async (name, date, time) => {
//   const eventStartTime = new Date(`${date}T${time}:00`);
//   const eventEndTime = new Date(eventStartTime.getTime() + 60 * 60 * 1000); // 1 godzina

//   const event = {
//     summary: `Korepetycje z fizyki - ${name}`,
//     description: "Automatycznie wygenerowane spotkanie Google Meet.",
//     start: {
//       dateTime: eventStartTime.toISOString(),
//       timeZone: "Europe/Warsaw",
//     },
//     end: {
//       dateTime: eventEndTime.toISOString(),
//       timeZone: "Europe/Warsaw",
//     },
//     conferenceData: {
//       createRequest: {
//         requestId: `${Date.now()}-${Math.random()}`,
//         conferenceSolutionKey: { type: "googleMeet" },
//       },
//     },
//   };

//   try {
//     const response = await calendar.events.insert({
//       calendarId: "elstermetalhead@gmail.com",
//       resource: event,
//       conferenceDataVersion: 1,
//     });
//     return response.data.conferenceData.entryPoints[0].uri; // Link do spotkania Google Meet
//   } catch (error) {
//     console.error("Błąd tworzenia spotkania:", error);
//     return null;
//   }
// };

const disabledDates = {
  fullDays: [], // Tablica pełnych dni, np. ["2025-01-15"]
  hours: {},    // Obiekt z godzinami dla każdego dnia, np. {"2025-01-16": ["10:00", "14:00"]}
};

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Jeśli dane są poprawne, wygeneruj token JWT
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ token });
  }

  res.status(401).json({ error: "Nieprawidłowy login lub hasło." });
});


// Endpoint: Pobierz niedostępne terminy
app.get("/disabled-dates", (req, res) => {
  res.json(disabledDates);
});

// Endpoint: Dodaj niedostępny termin
app.post("/admin/disable-date", (req, res) => {
  const { date, time } = req.body;

  console.log("Dodawanie terminu:", { date, time });

  if (!date) {
    return res.status(400).json({ error: "Data jest wymagana." });
  }

  if (time) {
    // Dodaj godzinę do konkretnego dnia
    if (!disabledDates.hours[date]) {
      disabledDates.hours[date] = [];
    }
    if (!disabledDates.hours[date].includes(time)) {
      disabledDates.hours[date].push(time);
    }
  } else {
    // Dodaj cały dzień jako niedostępny
    if (!disabledDates.fullDays.includes(date)) {
      disabledDates.fullDays.push(date);
    }
  }

  res.status(200).json({ message: "Termin został dodany jako niedostępny." });
});

app.get("/admin/clients", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM clients ORDER BY created_at DESC");
    const decrypted = rows.map((row) => ({
      id: row.id,
      name: decrypt(row.name),
      email: decrypt(row.email),
      phone: decrypt(row.phone),
      date: decrypt(row.date),
      message: decrypt(row.message),
      created_at: row.created_at,
    }));
    res.json(decrypted);
  } catch (err) {
    console.error("Błąd podczas pobierania danych:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});



// Endpoint: Usuń niedostępny termin
app.post("/admin/enable-date", (req, res) => {
  const { date, time } = req.body;

  if (time) {
    // Usuń godzinę z konkretnego dnia
    if (disabledDates.hours[date]) {
      disabledDates.hours[date] = disabledDates.hours[date].filter((t) => t !== time);
      if (disabledDates.hours[date].length === 0) {
        delete disabledDates.hours[date];
      }
    }
  } else {
    // Usuń cały dzień
    disabledDates.fullDays = disabledDates.fullDays.filter((d) => d !== date);
  }

  res.status(200).json({ message: "Termin został usunięty." });
});

app.get("/test-db-insert", async (req, res) => {
  try {
    await db.execute(
      `INSERT INTO clients (name, email, phone, date, message) VALUES (?, ?, ?, ?, ?)`,
      ["TEST", "test@test.pl", "123456789", "01-01-2025", "To jest test"]
    );
    res.send("✔️ Testowy wpis dodany");
  } catch (error) {
    console.error("❌ Błąd testowego INSERTA:", error.message);
    res.status(500).send("❌ Nie udało się dodać testowego wpisu");
  }
});




// Endpoint do obsługi formularza
app.post("/contact", async (req, res) => {
  const { name, email, phone, selectedDate, message } = req.body;

  if (!selectedDate) {
    return res.status(400).json({ error: "Data i godzina są wymagane." });
  }

  const date = new Date(selectedDate);

  // Lokalna data i godzina
  const localDate = date.toLocaleDateString("pl-PL"); // Polski format daty
  const localTime = date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  
  // const localDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  // const localTime = date.toISOString().split("T")[1].slice(0, 5); // HH:mm

  const text = `Nowa wiadomość z formularza kontaktowego:
Imię: ${name}
E-mail: ${email}
Telefon: ${phone}
Data lekcji: ${localDate}
Godzina lekcji: ${localTime}
Wiadomość:
${message}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    });

    // const meetLink = await createGoogleMeet(name, localDate, localTime);

    await sendConfirmationEmail(email, name, localDate, localTime);

    console.log("➡️ Próba zapisu do bazy...");

    await db.execute(
      `INSERT INTO clients (name, email, phone, date, message) VALUES (?, ?, ?, ?, ?)`,
      [
        encrypt(name),
        encrypt(email),
        encrypt(phone),
        encrypt(localDate + " " + localTime),
        encrypt(message),
      ]
    );
    
    console.log("✅ Dane zapisane!");

    res.status(200).json({ message: "Formularz został wysłany pomyślnie!" });
  } catch (error) {
    console.error("Błąd wysyłania wiadomości na Telegram:", error);
    res.status(500).json({ error: "Wystąpił problem z wysłaniem wiadomości." });
  }
});


// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
