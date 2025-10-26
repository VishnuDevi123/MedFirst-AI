const OBJECT_ID_PATTERN = /0x[0-9a-fA-F]{2,64}/g

const findLongestObjectId = (value: string): string | null => {
  const matches = value.match(OBJECT_ID_PATTERN)
  if (!matches || matches.length === 0) {
    return null
  }

  return matches.reduce((longest, current) =>
    current.length > longest.length ? current : longest
  )
}

export const extractObjectId = (rawValue: string | null | undefined): string | null => {
  if (!rawValue) {
    return null
  }

  const trimmed = rawValue.trim()
  if (!trimmed) {
    return null
  }

  const candidateSources = [
    trimmed.replace(/\s+/g, ''),
    trimmed,
    trimmed.replace(/[^0-9a-fA-Fx]/g, ''),
  ]

  for (const source of candidateSources) {
    const candidate = findLongestObjectId(source)
    if (candidate) {
      const normalized = `0x${candidate.slice(2).toLowerCase()}`
      return normalized
    }
  }

  try {
    const url = new URL(trimmed)
    const lastSegment = url.pathname.split('/').filter(Boolean).pop() ?? ''
    const candidate = findLongestObjectId(lastSegment)
    if (candidate) {
      return `0x${candidate.slice(2).toLowerCase()}`
    }
    return lastSegment || trimmed
  } catch {
    return trimmed
  }
}
