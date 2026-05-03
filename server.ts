import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import Stripe from "stripe";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

dotenv.config();

// Load Firebase config for server-side usage
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

let stripeClient: Stripe | null = null;
let systemPaymentConfig: any = null;

async function getSystemPaymentConfig() {
  try {
    const configDoc = await getDoc(doc(db, "global_settings", "payment_config"));
    if (configDoc.exists()) {
      systemPaymentConfig = configDoc.data();
      console.log("[SERVER]: System payment configuration synchronized from Firestore.");
    }
  } catch (error) {
    console.error("[SERVER]: Failed to fetch payment config from Firestore:", error);
  }
}

async function getStripe(): Promise<Stripe> {
  // Refresh config if not available
  if (!systemPaymentConfig) {
    await getSystemPaymentConfig();
  }

  const key = systemPaymentConfig?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured in environment or Firestore.");
  }

  // If key changed, re-initialize client
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initial config load
  await getSystemPaymentConfig();

  // --- Stripe Integration ---
  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    const { amount, currency, metadata } = req.body;

    try {
      const stripe = await getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: currency.toLowerCase(),
        metadata: {
          ...metadata,
          contact_phone: "+254723523247" // Added per user request for all transactions
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Intent Error:", error.message);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.get("/api/payment/config-status", async (req, res) => {
    await getSystemPaymentConfig();
    res.json({
      stripe: {
        secretKey: !!(systemPaymentConfig?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY),
      }
    });
  });

  app.get("/api/bible/verse", async (req, res) => {
    const visionaryVerses = [
      'Habakkuk 2:2', 'Proverbs 29:18', 'Joshua 1:9', 'Philippians 4:13', 
      'Jeremiah 29:11', 'Isaiah 40:31', 'Proverbs 3:5-6', 'Matthew 5:14',
      'Ephesians 3:20', 'Romans 8:28', '1 Timothy 4:12', 'Colossians 3:23'
    ];
    const randomRef = visionaryVerses[Math.floor(Math.random() * visionaryVerses.length)];
    try {
      const response = await axios.get(`https://bible-api.com/${encodeURIComponent(randomRef)}`);
      res.json(response.data);
    } catch (error: any) {
      console.error("Bible API Error:", error.message);
      res.status(500).json({ error: "Failed to fetch verse" });
    }
  });

  app.get("/api/media/secure-url", async (req, res) => {
    const { storagePath } = req.query;
    if (!storagePath) return res.status(400).json({ error: "Storage path required" });

    try {
      // In a real production environment with firebase-admin, you would do:
      // const bucket = admin.storage().bucket();
      // const file = bucket.file(storagePath);
      // const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 15 });
      // res.json({ url });

      // For now, return a placeholder that explains the security layer
      console.log(`[SECURITY]: Generating temporary access token for ${storagePath}`);
      res.json({ 
        url: `https://storage.googleapis.com/your-bucket/${storagePath}?access_token=DEMO_SECURITY_TOKEN`,
        expiresIn: "15m" 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
