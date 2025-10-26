// services/suiService.mock.js
// Mocked blockchain storage for development

// This will simulate on-chain batch data.
// In a real setup, this would query the Sui testnet via the Sui SDK or RPC.
const blockchainBatches = new Map();

// Preload a sample batch for testing (so /verify/15631-0404 works immediately)
blockchainBatches.set("15631-0404", {
  batch_id: "15631-0404",
  ndc: "15631-0404",
  manufacturer: "Rxhomeo Inc.",
  expiry: "2027-09-18",
  hash: "c2d94e1f6a4b29c723ef6bdbe94a1ff0e7d930ca", // mock hash prefix
});

/**
 * Simulates retrieving a batch from the blockchain by its ID.
 */
export async function getBatchFromBlockchain(objectId) {
  // simulate small network delay
  await new Promise((r) => setTimeout(r, 100));
  return blockchainBatches.get(batchId) || null;
}

/**
 * Simulates writing a new batch to the blockchain.
 * Used by /mint route to “mint” a new drug batch on-chain.
 */
export async function mintBatchOnBlockchain(batchData) {
  if (!batchData.batch_id) {
    throw new Error("batch_id required to mint batch");
  }
  blockchainBatches.set(batchData.batch_id, batchData);
  return batchData;
}

/**
 * For testing and inspection — returns all mock on-chain batches.
 */
export async function listAllBatches() {
  return Array.from(blockchainBatches.values());
}