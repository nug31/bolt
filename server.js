import express from "express";
import cors from "cors";
import midtransClient from "midtrans-client";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://odhincy-p.vercel.app",
      "https://odhincy.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Rejected Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Midtrans with proper error handling
let snap;
try {
  const isSandbox = process.env.NODE_ENV !== "production";
  snap = new midtransClient.Snap({
    isProduction: !isSandbox,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  console.log("Midtrans initialized successfully");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Mode:", isSandbox ? "SANDBOX" : "PRODUCTION");

  if (isSandbox) {
    console.log("Using Sandbox Configuration");
    console.log("Client Key:", process.env.MIDTRANS_CLIENT_KEY);
  }
} catch (error) {
  console.error("Failed to initialize Midtrans:", error);
}

// Middleware to check if Midtrans is initialized
const checkMidtrans = (req, res, next) => {
  if (!snap) {
    return res.status(503).json({
      status: "error",
      message: "Payment service is not available",
    });
  }
  next();
};

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    payment_service: snap ? "available" : "unavailable",
    mode: process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX",
  });
});

// Get Midtrans client key
app.get("/api/payment/config", (req, res) => {
  res.json({
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    isProduction: process.env.NODE_ENV === "production",
    mode: process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX",
  });
});

app.post("/api/create-payment", checkMidtrans, async (req, res) => {
  try {
    const { orderId, amount, customerDetails } = req.body;
    console.log("Creating payment:", { orderId, amount, customerDetails });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: customerDetails,
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${
          process.env.NODE_ENV === "production"
            ? "https://odhincy-p.vercel.app"
            : "http://localhost:5175"
        }/payment/finish`,
      },
    });

    console.log("Transaction created:", {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      mode: process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX",
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      mode: process.env.NODE_ENV === "production" ? "PRODUCTION" : "SANDBOX",
    });
  }
});

app.get(
  "/api/check-payment-status/:orderId",
  checkMidtrans,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      console.log("Checking payment status for order:", orderId);
      const status = await snap.transaction.status(orderId);
      res.json(status);
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

app.post("/api/notification", checkMidtrans, async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);
    console.log("Received notification:", notification);

    // Here you would typically update your database with the payment status
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    res.json({
      status: "success",
      orderId,
      transactionStatus,
      fraudStatus,
    });
  } catch (error) {
    console.error("Error processing notification:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  // Handle all other routes by serving the index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// Start server with port handling
const startServer = () => {
  const server = app
    .listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log("Environment:", process.env.NODE_ENV);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is busy, trying port ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error("Server error:", err);
      }
    });
};

if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;
