import jwt from 'jsonwebtoken'
import * as jose from 'jose'

const secretStr = 'fallback-secret-for-dev'
const payload = { userId: "test1234", email: "test@example.com" }

const token = jwt.sign(payload, secretStr, { expiresIn: '7d' })

const secretBytes = new TextEncoder().encode(secretStr)
try {
  const joseVer = await jose.jwtVerify(token, secretBytes)
  console.log("JOSE PASS", joseVer.payload)
} catch(e) { console.error("JOSE FAIL", e) }

try {
  const jwtVer = jwt.verify(token, secretStr)
  console.log("JWT PASS", jwtVer)
} catch(e) { console.error("JWT FAIL", e) }
