// index.js
import express from "express";
import cors from "cors";
import verifyRoute from "./routes/verify.js";
import mintRoute from "./routes/mint.js";
import markSoldRoute from "./routes/markSold.js";
import 'dotenv/config';
const app = express();
const PORT = 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/verify", verifyRoute);
app.use("/mintBatch", mintRoute);
app.use("/markSold", markSoldRoute);

// Root route for sanity check
app.get("/", (req, res) => {
  res.send("✅ MedTrust AI backend is running...");
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);