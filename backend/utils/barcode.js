import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const LABEL_PREFIXES = ["MEDX", "MEDSAFE", "MEDTRUST"];
const OBJECT_ID_REGEX = /^0x[0-9a-f]{32,64}$/;
const NONCE_REGEX = /^[A-Za-z0-9_-]{6,64}$/;
const SIGNATURE_REGEX = /^[A-Za-z0-9_-]{20,128}$/;
const SEPARATORS = ["|", ":", ","];

const SIGNING_SECRET =
  process.env.BARCODE_SIGNING_SECRET ?? process.env.SCAN_SIGNING_SECRET ?? null;

const REGISTER_PATH = path.resolve(
  process.cwd(),
  "backend",
  "data",
  "scan-register.json",
);

const ensureRegister = async () => {
  const dir = path.dirname(REGISTER_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    const raw = await fs.readFile(REGISTER_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Failed to read scan register:", error);
    }
    return {};
  }
};

const persistRegister = async (register) => {
  await fs.writeFile(
    REGISTER_PATH,
    JSON.stringify(register, null, 2),
    "utf8",
  );
};

export const parseBarcodePayload = (raw) => {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/\s+/g, "");

  for (const separator of SEPARATORS) {
    if (!normalized.includes(separator)) {
      continue;
    }

    const segments = normalized
      .split(separator)
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length < 4) {
      continue;
    }

    const [prefix, objectIdPart, nonce, signature] = segments;
    if (!LABEL_PREFIXES.includes(prefix.toUpperCase())) {
      continue;
    }

    const objectId = objectIdPart.startsWith("0x")
      ? objectIdPart.toLowerCase()
      : `0x${objectIdPart.toLowerCase()}`;

    if (!OBJECT_ID_REGEX.test(objectId)) {
      continue;
    }

    if (!NONCE_REGEX.test(nonce)) {
      continue;
    }

    if (!SIGNATURE_REGEX.test(signature)) {
      continue;
    }

    return {
      prefix: prefix.toUpperCase(),
      objectId,
      nonce,
      signature,
      raw: `${prefix.toUpperCase()}|${objectId}|${nonce}|${signature}`,
    };
  }

  if (OBJECT_ID_REGEX.test(normalized)) {
    return {
      prefix: null,
      objectId: normalized.toLowerCase(),
      nonce: null,
      signature: null,
      raw: normalized.toLowerCase(),
    };
  }

  return null;
};

export const verifyBarcodeSignature = (payload) => {
  if (!payload?.nonce || !payload?.signature) {
    return {
      valid: false,
      reason: "PAYLOAD_INCOMPLETE",
    };
  }

  if (!SIGNING_SECRET) {
    return {
      valid: false,
      reason: "SIGNING_SECRET_MISSING",
    };
  }

  let providedBuffer;
  try {
    providedBuffer = Buffer.from(payload.signature, "base64url");
  } catch (error) {
    return {
      valid: false,
      reason: "SIGNATURE_DECODE_FAILED",
    };
  }

  const expectedBuffer = createHmac("sha256", SIGNING_SECRET)
    .update(`${payload.objectId}:${payload.nonce}`)
    .digest();

  const valid =
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer);

  return {
    valid,
    reason: valid ? null : "SIGNATURE_MISMATCH",
  };
};

export const recordNonceUsage = async (objectId, nonce) => {
  const register = await ensureRegister();
  const key = `${objectId}|${nonce}`;
  const nowIso = new Date().toISOString();
  const previousEntry = register[key];
  const previousCount = previousEntry?.count ?? 0;

  register[key] = {
    count: previousCount + 1,
    firstSeen: previousEntry?.firstSeen ?? nowIso,
    lastSeen: nowIso,
  };

  await persistRegister(register);

  return {
    previousCount,
    currentCount: register[key].count,
    firstSeen: register[key].firstSeen,
    lastSeen: nowIso,
  };
};

export const hasSigningSecret = () => Boolean(SIGNING_SECRET);

export const generateBarcodeToken = (objectId, nonce = null) => {
  if (!SIGNING_SECRET) {
    throw new Error("BARCODE_SIGNING_SECRET is not configured.");
  }

  if (!objectId || !OBJECT_ID_REGEX.test(objectId.toLowerCase())) {
    throw new Error("Invalid object ID supplied for barcode token creation.");
  }

  const normalizedId = objectId.toLowerCase();
  const resolvedNonce = nonce && NONCE_REGEX.test(nonce)
    ? nonce
    : randomBytes(9).toString("base64url");

  const signature = createHmac("sha256", SIGNING_SECRET)
    .update(`${normalizedId}:${resolvedNonce}`)
    .digest("base64url");

  const token = `MEDX|${normalizedId}|${resolvedNonce}|${signature}`;

  return {
    prefix: "MEDX",
    objectId: normalizedId,
    nonce: resolvedNonce,
    signature,
    token,
  };
};
