// services/hashService.js
import crypto from "crypto";

export function computeDrugHash(drugData) {
  const json = JSON.stringify(drugData, Object.keys(drugData).sort());
  console.log(crypto.createHash("sha256").update(json).digest("hex"))
  return crypto.createHash("sha256").update(json).digest("hex");
}