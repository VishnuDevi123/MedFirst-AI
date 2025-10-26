// routes/verify.js
import express from "express";
import { createHash } from "crypto";
import { getBatchFromBlockchain } from "../services/suiService.Real.js";
import { fetchOpenFDA } from "../services/fdaService.js";
import { computeDrugHash } from "../services/hashService.js";
import { drugSummaryAgent } from "../my-mastra-app/src/mastra/agents/drugSummaryAgent.ts";

const router = express.Router();

router.get("/:objectId", async (req, res) => {
  try {
    const { objectId } = req.params;

    // 1️⃣ Fetch from blockchain
    const batch = await getBatchFromBlockchain(objectId);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    // 2️⃣ Fetch FDA info
    const fdaRaw = await fetchOpenFDA(batch.ndc);
    const normalizeText = (value) =>
      typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
    const fdaData = fdaRaw
      ? Object.fromEntries(
          Object.entries(fdaRaw).map(([key, value]) => [
            key,
            normalizeText(value),
          ])
        )
      : null;
    if (!fdaData)
      return res.status(404).json({ error: "No FDA data found for this drug" });

    // 3️⃣ Compute & compare hashes
    const onChainHash =
      typeof batch.hash === "string" ? batch.hash.replace(/^0x/, "") : null;
    const localHashFda = computeDrugHash(fdaData);
    const localHashIdentity = createHash("sha256")
      .update(
        [
          normalizeText(batch.ndc),
          normalizeText(batch.manufacturer),
          normalizeText(batch.expiry),
        ]
          .filter(Boolean)
          .join("|")
      )
      .digest("hex");
    const hashCandidates = [localHashFda, localHashIdentity];
    const hashMatch =
      !!onChainHash &&
      hashCandidates.some(
        (candidate) =>
          candidate.slice(0, 10) === onChainHash.slice(0, 10)
      );

    // 4️⃣ Determine availability status
    const parseBoolean = (value) =>
      value === true ||
      value === "true" ||
      value === 1 ||
      value === "1" ||
      value === "True";
    const isSold = parseBoolean(batch.sold);
    const soldTimestamp = Number(batch.sold_at_ms);
    const soldDate =
      Number.isFinite(soldTimestamp) && soldTimestamp > 0
        ? new Date(soldTimestamp).toISOString().split("T")[0]
        : null;
    const availabilityLabel = isSold
      ? `SOLD${soldDate ? ` on ${soldDate}` : ""}${
          batch.buyer ? ` to ${batch.buyer}` : ""
        }`
      : "Available for purchase";

    // 5️⃣ Build natural-language prompt for the AI
    const prompt = `
You are a medically aware AI assistant that summarizes verified drug data.

Here is the drug information to summarize:
- Brand Name: ${fdaData.brand_name}
- Manufacturer: ${batch.manufacturer}
- Purpose: ${fdaData.purpose}
- Dosage: ${fdaData.dosage}
- Warnings: ${fdaData.warnings}
- Expiry Date: ${batch.expiry}
- Verified: ${hashMatch ? "true" : "false"}
- Availability: ${availabilityLabel}

Please generate a short, clear, user-friendly summary (3–5 lines max) describing this medicine for a general audience. If "Verified" is false, advise the user to be cautious. If the availability indicates SOLD, make it clear the unit was already sold so the user avoids repurchasing it.
    `;

    // 6️⃣ Call the Mastra agent
    let aiSummary = "Summary unavailable.";
    try {
      const generation = await drugSummaryAgent.generate([
        { role: "user", content: prompt.trim() },
      ]);
      const generatedText = await generation.text;
      aiSummary = generatedText?.trim() || "No AI summary generated.";
    } catch (agentErr) {
      console.error("Mastra agent error:", agentErr);
      if (isSold) {
        aiSummary =
          "This unit shows as sold already. Avoid repurchasing it and confirm details with the dispensing pharmacy.";
      } else if (hashMatch) {
        aiSummary =
          "This medicine appears authentic based on the verification hash. Refer to the label for dosage and warnings.";
      } else {
        aiSummary =
          "This medicine could not be verified. Please consult a pharmacist before use.";
      }
    }

    // 7️⃣ Return structured JSON response
    res.json({
      object_id: objectId,
      batch_id: batch.batch_id,
      ndc: batch.ndc,
      manufacturer: batch.manufacturer,
      expiry: batch.expiry,
      sold: isSold,
      sold_at: soldDate,
      buyer: batch.buyer ?? null,
      availability: availabilityLabel,
      verified: hashMatch,
      verification_details: {
        local_hash_prefix: hashCandidates[0]?.slice(0, 10) ?? null,
        identity_hash_prefix: hashCandidates[1]?.slice(0, 10) ?? null,
        hash_candidates: hashCandidates.map((h) => h.slice(0, 10)),
        onchain_hash_prefix: onChainHash ? onChainHash.slice(0, 10) : null,
        method:
          "sha256(JSON(OpenFDA fields)) + sha256(ndc|manufacturer|expiry) prefix compare",
      },
      openfda: fdaData,
      ai_summary: aiSummary,
    });
  } catch (err) {
    console.error("Verify route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
