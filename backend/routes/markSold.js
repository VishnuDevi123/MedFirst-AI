// routes/markSold.js
import express from "express";

const router = express.Router();

// In-memory sale log
let soldRecords = [];

router.post("/", (req, res) => {
  const { batch_id } = req.body;

  if (!batch_id)
    return res.status(400).json({ error: "batch_id is required" });

  // Simulate a sale record
  const sale = {
    batch_id,
    sold_to: "Mock Pharmacy #001",
    sold_date: new Date().toISOString().split("T")[0],
    price: "$14.99",
  };

  soldRecords.push(sale);

  res.json({
    success: true,
    message: "Batch marked as sold",
    sale,
  });
});

export default router;