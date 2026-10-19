// ==============================================================================
// LunaFlow: CentralAuth OAuth 2.1 Engine (PKCE S256 + Zero-Trust Roles)
// Spec: OAuth 2.1 RFC 7636 (PKCE) + Asymmetric ES256 / RS256 Verification
// ==============================================================================

import { supabase, SUPABASE_URL } from './supabase';

export interface CentralAuthMeta {
  clientId: string;
  roles: string[];
  permissions: string[];
  sub: string;
  email?: string;
  tokenExpiry?: number;
}

const STORAGE_KEY_VERIFIER = 'centralauth_oauth_verifier';
const STORAGE_KEY_STATE = 'centralauth_oauth_state';
const STORAGE_KEY_META = 'centralauth_session_meta';

export const DEFAULT_CLIENT_ID = 
  import.meta.env.VITE_CENTRALAUTH_CLIENT_ID || 'c44881e2-1646-43e2-8186-354778bee820';

export const CENTRALAUTH_SERVER_URL = 
  import.meta.env.VITE_CENTRALAUTH_SERVER_URL || 'https://centralauth.vercel.app';

function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function generatePkce(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  // 1. Generate cryptographically secure random code_verifier (32 bytes = 43 chars base64url)
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const codeVerifier = base64UrlEncode(randomBytes.buffer);

  // 2. Hash with SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);

  // 3. Base64url encode the digest -> code_challenge
  const codeChallenge = base64UrlEncode(hash);

  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  const randomBytes = new Uint8Array(24);
  crypto.getRandomValues(randomBytes);
  return base64UrlEncode(randomBytes.buffer);
}

/**
 * Initiates the PKCE OAuth 2.1 Authorization Code Flow
 */
export async function startCentralAuthLogin(options?: { clientId?: string; redirectUri?: string }) {
  const clientId = options?.clientId || DEFAULT_CLIENT_ID;
  const redirectUri = options?.redirectUri || `${window.location.origin}/oauth/callback`;

  const { codeVerifier, codeChallenge } = await generatePkce();
  const state = generateState();

  // Store code_verifier and state in sessionStorage for callback validation
  sessionStorage.setItem(STORAGE_KEY_VERIFIER, codeVerifier);
  sessionStorage.setItem(STORAGE_KEY_STATE, state);
  sessionStorage.setItem('centralauth_active_client_id', clientId);
  sessionStorage.setItem('centralauth_redirect_uri', redirectUri);

  const authEndpoint = `${SUPABASE_URL}/auth/v1/oauth/authorize`;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${authEndpoint}?${params.toString()}`;
}

/**
 * Handles the OAuth 2.1 Callback, verifies PKCE, and exchanges code for JWT tokens
 */
export async function handleCentralAuthCallback(currentUrlSearch: string) {
  const urlParams = new URLSearchParams(currentUrlSearch);
  const code = urlParams.get('code');
  const returnedState = urlParams.get('state');
  const error = urlParams.get('error');
  const errorDesc = urlParams.get('error_description');

  if (error) {
    throw new Error(`CentralAuth error: ${error} - ${errorDesc || 'Access denied'}`);
  }

  // 1. Validate CSRF state
  const storedState = sessionStorage.getItem(STORAGE_KEY_STATE);
  if (!returnedState || returnedState !== storedState) {
    throw new Error('CSRF State mismatch! Cross-site request forgery protection prevented login.');
  }

  const codeVerifier = sessionStorage.getItem(STORAGE_KEY_VERIFIER);
  if (!code || !codeVerifier) {
    throw new Error('Missing OAuth authorization code or PKCE verifier.');
  }

  const clientId = sessionStorage.getItem('centralauth_active_client_id') || DEFAULT_CLIENT_ID;
  const redirectUri = sessionStorage.getItem('centralauth_redirect_uri') || `${window.location.origin}/oauth/callback`;

  // 2. Exchange authorization code for tokens
  const tokenEndpoint = `${SUPABASE_URL}/auth/v1/oauth/token`;
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const tokens = await response.json();

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${tokens.error_description || tokens.error || 'Server error'}`);
  }

  // 3. Clean up PKCE storage
  sessionStorage.removeItem(STORAGE_KEY_STATE);
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
  sessionStorage.removeItem('centralauth_active_client_id');
  sessionStorage.removeItem('centralauth_redirect_uri');

  // 4. Decode JWT claims (injected by CentralAuth Custom Token Hook)
  const meta = parseJwtMetadata(tokens.access_token);
  saveCentralAuthMeta(meta);

  // 5. Hydrate Supabase Client Session
  if (supabase && tokens.access_token && tokens.refresh_token) {
    const { data, error: sessionErr } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    if (sessionErr) throw sessionErr;
    return { session: data.session, user: data.user, meta };
  }

  return { session: null, user: null, meta, tokens };
}

/**
 * Parses JWT payload without external dependencies
 */
export function parseJwtMetadata(accessToken: string): CentralAuthMeta {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) throw new Error('Invalid JWT format');
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr);

    const appMetadata = payload.app_metadata || {};
    return {
      clientId: appMetadata.client_id || payload.aud || 'unknown',
      roles: Array.isArray(appMetadata.roles) ? appMetadata.roles : [],
      permissions: Array.isArray(appMetadata.permissions) ? appMetadata.permissions : [],
      sub: payload.sub,
      email: payload.email,
      tokenExpiry: payload.exp,
    };
  } catch (err) {
    console.warn('Could not parse CentralAuth metadata from JWT', err);
    return {
      clientId: 'unknown',
      roles: [],
      permissions: [],
      sub: '',
    };
  }
}

export function saveCentralAuthMeta(meta: CentralAuthMeta) {
  try {
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
  } catch {}
}

export function getCentralAuthMeta(): CentralAuthMeta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_META);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCentralAuthMeta() {
  try {
    localStorage.removeItem(STORAGE_KEY_META);
  } catch {}
}
