// services/suiService.real.js
// This will replace suiService.mock.js in the real demo path.
// It talks directly to Sui fullnode RPC to read the on-chain DrugUnit object.

import fetch from "node-fetch"; // if you're using Node 18+, you might not need this import
// If you're using native fetch in Node, remove the import line.

const SUI_RPC = "https://fullnode.testnet.sui.io:443";

// helper: call sui_getObject RPC
async function fetchSuiObject(objectId) {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "sui_getObject",
    params: [
      objectId,
      {
        showContent: true,
        showOwner: true,
      },
    ],
  };

  const resp = await fetch(SUI_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(`Sui RPC error HTTP ${resp.status}`);
  }

  const data = await resp.json();
  // data.result.data.content.fields is where your Move struct lives

  if (
    !data?.result?.data?.content?.fields
  ) {
    return null;
  }

  // Extract the Move fields from your DrugUnit struct
  const f = data.result.data.content.fields;

  // Map on-chain fields -> backend "batch" shape
  // IMPORTANT: names here must match what verify.js expects later
  return {
    // this is what your backend called batch_id
    // we will use serial_id as batch_id because that's your physical unit code
    batch_id: f.serial_id,            // ex: "PFZ-2025-09A-UNIT-002"

    // this is what backend already calls ndc and uses to call FDA
    ndc: f.ndc,                       // ex: "15631-0404"

    // for human UX + labeling
    manufacturer: f.manufacturer,     // ex: "Rxhomeo Inc."
    expiry: f.expiry,                 // ex: "2027-09-18"

    // this "hash" is what backend compares to localHashPrefix
    // In your Move struct it's called data_hash
    hash: f.data_hash,

    // new fields we also want to surface to AI
    sold: f.sold,
    sold_at_ms: f.sold_at_ms,
    buyer: f.buyer, // may be Option<address> in Move; if it's an Option
                    // you might need to unwrap or handle null here
  };
}

// This is what verify.js uses
export async function getBatchFromBlockchain(objectId) {
  return fetchSuiObject(objectId);
}