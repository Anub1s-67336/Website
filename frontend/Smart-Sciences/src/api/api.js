/**
 * Smart-Sciences API Client
 * ─────────────────────────────────────────────────────────────────
 * Connects to the FastAPI backend at github.com/Anub1s-67336/Website
 *
 * To switch environments, change API_URL only:
 *   - Local dev  : 'http://localhost:8000'
 *   - Production : 'https://api.smart-sciences.uz'
 *
 * GitHub Copilot hint: all functions follow the pattern
 *   async functionName(payload) → { data } | throws Error
 * Match each function to the corresponding FastAPI router in the repo.
 */

export const API_URL = 'http://localhost:8000'   // ← change this one line to deploy

const TOKEN_KEY = 'ss_token'   // localStorage key for JWT

// ── Token helpers ────────────────────────────────────────────────

/** Save JWT token to localStorage */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/** Read JWT token from localStorage (null if absent) */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/** Remove JWT token (logout) */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** Build Authorization header object (empty if no token) */
function authHeader() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Generic request helper ───────────────────────────────────────

/**
 * @param {string} method   HTTP verb
 * @param {string} path     API path, e.g. '/auth/login'
 * @param {object} [body]   JSON body (optional)
 * @returns {Promise<any>}  Parsed JSON response
 * @throws  {Error}         With message from server or network
 */
async function request(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader(),
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Try to parse JSON even on error (FastAPI returns { detail: "..." })
  let json
  try {
    json = await res.json()
  } catch {
    throw new Error(`Server error: ${res.status} ${res.statusText}`)
  }

  if (!res.ok) {
    // FastAPI validation errors have json.detail as array
    const message = Array.isArray(json?.detail)
      ? json.detail.map((e) => e.msg).join(', ')
      : json?.detail ?? `Error ${res.status}`
    throw new Error(message)
  }

  return json
}

// ── Auth endpoints ───────────────────────────────────────────────
// Copilot: match to FastAPI router → /auth/register, /auth/login, /auth/me

/**
 * Register a new user.
 * POST /auth/register
 * Body: { username, email, password }
 * Returns: { id, username, email }
 */
export async function register({ username, email, password }) {
  return request('POST', '/auth/register', { username, email, password })
}

/**
 * Login and receive JWT.
 * POST /auth/login  (FastAPI OAuth2PasswordRequestForm → form-encoded)
 * Returns: { access_token, token_type }
 *
 * Note: FastAPI's OAuth2 form expects 'username' field for the email value.
 */
export async function login({ email, password }) {
  // FastAPI OAuth2PasswordRequestForm requires form-encoded body
  const formData = new URLSearchParams()
  formData.append('username', email)   // FastAPI uses 'username' field
  formData.append('password', password)

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })

  let json
  try { json = await res.json() } catch { throw new Error('Network error') }
  if (!res.ok) throw new Error(json?.detail ?? 'Login failed')

  saveToken(json.access_token)
  return json
}

/**
 * Logout — just clears the token client-side.
 * If your backend has a /auth/logout endpoint (token blacklist), call it here.
 */
export function logout() {
  clearToken()
}

// ── User data endpoints ──────────────────────────────────────────
// Copilot: match to FastAPI router → /users/me, /users/me/progress

/**
 * Get current authenticated user's profile + progress.
 * GET /users/me
 * Returns: { id, username, email, xp, medals, level, created_at }
 */
export async function getUserData() {
  return request('GET', '/users/me')
}

/**
 * Update XP for the current user.
 * PATCH /users/me/progress
 * Body: { xp_delta, medals }  — delta to add, updated medals array
 * Returns: { xp, medals, level }
 */
export async function updateProgress({ xpDelta, medals }) {
  return request('PATCH', '/users/me/progress', {
    xp_delta: xpDelta,
    medals,
  })
}

/**
 * Update only XP (convenience wrapper around updateProgress).
 * @param {number} xp  — total XP value to save (not delta)
 */
export async function updateXP(xp) {
  return request('PATCH', '/users/me/progress', { xp_total: xp })
}

// ── Leaderboard (future use) ─────────────────────────────────────
// Copilot: match to FastAPI router → /leaderboard

/**
 * Get top students leaderboard.
 * GET /leaderboard?limit=10
 * Returns: [{ username, xp, level }]
 */
export async function getLeaderboard(limit = 10) {
  return request('GET', `/leaderboard?limit=${limit}`)
}
