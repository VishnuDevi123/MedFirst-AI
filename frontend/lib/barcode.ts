const HEX_PATTERN = /0x[0-9a-fA-F]{10,}/g
const LABEL_PREFIXES = ['MEDX', 'MEDSAFE', 'MEDTRUST']
const SEPARATORS = ['|', ':', ',']

export interface PreparedScanPayload {
  raw: string
  objectId: string
  nonce?: string
  signature?: string
  isSigned: boolean
}

const normalizeObjectId = (value: string): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const prefixed = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed
  const lowered = prefixed.toLowerCase()
  if (!/^[0-9a-f]{32,64}$/.test(lowered)) {
    return null
  }

  return `0x${lowered}`
}

const parseStructuredPayload = (value: string) => {
  if (!value) return null
  const compact = value.replace(/\s+/g, '')
  const candidate = compact.length >= value.length ? compact : value

  for (const sep of SEPARATORS) {
    if (!candidate.includes(sep)) {
      continue
    }

    const segments = candidate.split(sep).map((segment) => segment.trim()).filter(Boolean)
    if (segments.length < 4) {
      continue
    }

    const [prefix, objectIdPart, nonce, signature] = segments
    if (!LABEL_PREFIXES.includes(prefix.toUpperCase())) {
      continue
    }

    const normalizedObjectId = normalizeObjectId(objectIdPart)
    if (!normalizedObjectId) {
      continue
    }

    if (!nonce || !/^[A-Za-z0-9_-]{6,64}$/.test(nonce)) {
      continue
    }

    if (!signature || !/^[A-Za-z0-9_-]{20,128}$/.test(signature)) {
      continue
    }

    return {
      prefix: prefix.toUpperCase(),
      objectId: normalizedObjectId,
      nonce,
      signature,
      raw: segments.join('|'),
    }
  }

  return null
}

const extractLooseObjectId = (value: string): string | null => {
  if (!value) return null
  const matches = value.match(HEX_PATTERN)
  if (!matches || matches.length === 0) {
    return null
  }

  const longest = matches.reduce((prev, current) =>
    current.length > prev.length ? current : prev
  )

  return normalizeObjectId(longest)
}

export const prepareVerificationPayload = (rawValue: string | null | undefined): PreparedScanPayload | null => {
  if (!rawValue) {
    return null
  }

  const trimmed = rawValue.trim()
  if (!trimmed) {
    return null
  }

  const structured = parseStructuredPayload(trimmed)
  if (structured) {
    return {
      raw: structured.raw,
      objectId: structured.objectId,
      nonce: structured.nonce,
      signature: structured.signature,
      isSigned: true,
    }
  }

  const fallbackObjectId = extractLooseObjectId(trimmed)
  if (!fallbackObjectId) {
    return null
  }

  return {
    raw: fallbackObjectId,
    objectId: fallbackObjectId,
    isSigned: false,
  }
}
