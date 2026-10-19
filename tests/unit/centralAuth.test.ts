import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generatePkce, 
  generateState, 
  parseJwtMetadata, 
  saveCentralAuthMeta, 
  getCentralAuthMeta, 
  clearCentralAuthMeta 
} from '../../src/services/centralAuthService';

describe('CentralAuth OAuth 2.1 Service Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('generates compliant PKCE code_verifier and code_challenge', async () => {
    const pkce = await generatePkce();
    expect(pkce.codeVerifier).toBeDefined();
    expect(pkce.codeChallenge).toBeDefined();
    // Base64URL without padding or +, /
    expect(pkce.codeVerifier).not.toContain('+');
    expect(pkce.codeVerifier).not.toContain('/');
    expect(pkce.codeVerifier).not.toContain('=');
    expect(pkce.codeChallenge).not.toContain('+');
    expect(pkce.codeChallenge).not.toContain('/');
    expect(pkce.codeChallenge).not.toContain('=');
    expect(pkce.codeVerifier.length).toBeGreaterThanOrEqual(43);
  });

  it('generates secure random CSRF state', () => {
    const state1 = generateState();
    const state2 = generateState();
    expect(state1).toBeDefined();
    expect(state2).toBeDefined();
    expect(state1).not.toEqual(state2);
  });

  it('correctly parses custom token hook claims from JWT', () => {
    // Simulated JWT with injected CentralAuth Zero-Trust claims
    const header = btoa(JSON.stringify({ alg: 'ES256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'user-uuid-1234',
      email: 'palash123more@gmail.com',
      aud: 'lunaflow-spa-dev',
      app_metadata: {
        client_id: 'lunaflow-spa-dev',
        roles: ['admin', 'medical_lead'],
        permissions: ['cycles:read', 'cycles:write', 'medical:export'],
      },
      exp: 1893456000,
    }));
    const fakeSignature = 'mockSignature';
    const fakeJwt = `${header}.${payload}.${fakeSignature}`;

    const meta = parseJwtMetadata(fakeJwt);
    expect(meta.sub).toBe('user-uuid-1234');
    expect(meta.email).toBe('palash123more@gmail.com');
    expect(meta.clientId).toBe('lunaflow-spa-dev');
    expect(meta.roles).toContain('admin');
    expect(meta.roles).toContain('medical_lead');
    expect(meta.permissions).toContain('cycles:write');
  });

  it('persists and retrieves CentralAuth session metadata', () => {
    const sampleMeta = {
      clientId: 'lunaflow-spa-dev',
      roles: ['admin'],
      permissions: ['billing:read'],
      sub: '123',
    };

    saveCentralAuthMeta(sampleMeta);
    const retrieved = getCentralAuthMeta();
    expect(retrieved).toEqual(sampleMeta);

    clearCentralAuthMeta();
    expect(getCentralAuthMeta()).toBeNull();
  });
});
