const base64UrlDecode = (input) => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  return atob(padded)
}

export function parseJwtPayload(jwtToken) {
  try {
    const parts = jwtToken.split('.')
    if (parts.length < 2) return null

    const payloadJson = base64UrlDecode(parts[1])
    const payload = JSON.parse(payloadJson)

    // If exp exists, treat expired tokens as invalid.
    if (typeof payload?.exp === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000)
      if (payload.exp <= nowSeconds) return null
    }

    return payload
  } catch {
    return null
  }
}


