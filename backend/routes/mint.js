import express from "express";
import crypto from "crypto";
import QRCode from "qrcode";
import { mintBatchOnBlockchain } from "../services/suiService.mock.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { ndc, manufacturer, expiry } = req.body;
    if (!ndc || !manufacturer || !expiry) {
      return res.status(400).json({ error: "ndc, manufacturer, expiry required" });
    }

    const batchId = `${ndc}-${Math.floor(Math.random() * 10000)}`;
    const hash = crypto.createHash("sha256").update(ndc + manufacturer + expiry).digest("hex");

    const batchData = { batch_id: batchId, ndc, manufacturer, expiry, hash };

    // ✅ store to “blockchain”
    await mintBatchOnBlockchain(batchData);

    const qrUrl = `https://medtrustai.vercel.app/verify/${batchId}`;
    const qr_image = await QRCode.toDataURL(qrUrl);

    res.json({ success: true, batch_id: batchId, qr_url: qrUrl, qr_image });
  } catch (err) {
    console.error("Mint route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;