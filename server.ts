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

  // --- M-Pesa Daraja Integration ---

  const getMpesaToken = async () => {
    // Refresh config to ensure we have the latest
    await getSystemPaymentConfig();

    const key = systemPaymentConfig?.mpesa?.consumerKey || process.env.MPESA_CONSUMER_KEY;
    const secret = systemPaymentConfig?.mpesa?.consumerSecret || process.env.MPESA_CONSUMER_SECRET;
    
    if (!key || !secret) {
      throw new Error("M-Pesa credentials not configured.");
    }

    const auth = Buffer.from(`${key}:${secret}`).toString("base64");

    try {
      const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error("M-Pesa Token Error:", error);
      throw error;
    }
  };

  app.post("/api/mpesa/stkpush", async (req, res) => {
    const { phoneNumber, amount, accountReference } = req.body;

    try {
      const token = await getMpesaToken();
      const shortCode = systemPaymentConfig?.mpesa?.shortcode || process.env.MPESA_SHORTCODE;
      const passkey = systemPaymentConfig?.mpesa?.passkey || process.env.MPESA_PASSKEY;
      
      if (!shortCode || !passkey) {
        throw new Error("M-Pesa shortcode or passkey not configured.");
      }

      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
      const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

      const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phoneNumber,
          PartyB: shortCode,
          PhoneNumber: phoneNumber,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: accountReference || "PastorJK",
          TransactionDesc: "Payment for PastorJK services",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("STK Push Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.message || "Payment initiation failed" });
    }
  });

  app.post("/api/mpesa/callback", (req, res) => {
    console.log("M-Pesa Callback Received:", JSON.stringify(req.body, null, 2));
    // In a real app, you'd update Firestore here based on the result
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  });

  // --- Stripe Integration ---
  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    const { amount, currency, metadata } = req.body;

    try {
      const stripe = await getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: currency.toLowerCase(),
        metadata: metadata || {},
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

  // --- Flutterwave Mock (Example of another system) ---
  app.post("/api/flutterwave/initiate", async (req, res) => {
    const { amount, currency, email, phoneNumber, name } = req.body;
    // This is a mock for Flutterwave's standard checkout
    res.json({
      status: "success",
      message: "Payment initiated",
      data: {
        link: "https://checkout.flutterwave.com/v3/hosted/pay/mock_link",
      },
    });
  });

  app.get("/api/payment/config-status", async (req, res) => {
    await getSystemPaymentConfig();
    res.json({
      mpesa: {
        consumerKey: !!(systemPaymentConfig?.mpesa?.consumerKey || process.env.MPESA_CONSUMER_KEY),
        consumerSecret: !!(systemPaymentConfig?.mpesa?.consumerSecret || process.env.MPESA_CONSUMER_SECRET),
        shortCode: !!(systemPaymentConfig?.mpesa?.shortcode || process.env.MPESA_SHORTCODE),
        passkey: !!(systemPaymentConfig?.mpesa?.passkey || process.env.MPESA_PASSKEY),
        callbackUrl: !!(process.env.MPESA_CALLBACK_URL),
      },
      stripe: {
        secretKey: !!(systemPaymentConfig?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY),
      },
      paypal: {
        clientId: !!(systemPaymentConfig?.paypal?.clientId || process.env.PAYPAL_CLIENT_ID),
        clientSecret: !!(systemPaymentConfig?.paypal?.clientSecret || process.env.PAYPAL_CLIENT_SECRET),
        webhookId: !!(systemPaymentConfig?.paypal?.webhookId || process.env.PAYPAL_WEBHOOK_ID),
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
