/**
 * Google Drive API helper - Cria pastas diretamente via Service Account
 * Usa JWT RS256 para autenticação com a API do Google Drive
 */

const SA_EMAIL = 'drive-bot@fontesgraphics.iam.gserviceaccount.com';
const SA_TOKEN_URI = 'https://oauth2.googleapis.com/token';

// Private key da Service Account (PEM)
const SA_PRIVATE_KEY = [
  '-----BEGIN PRIVATE KEY-----',
  'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQChaC8g2XORgZr8',
  '+C1YQps7lEt+1r0nT6ezuM+PIO1fAcSP5CaumOBibUUA0lUfnQswSGfnGuAW4KpO',
  'Eyt1xiq+buFlscDij3tUQfe7ccEDSLvU+E2xDrMKTkaTFULiqmQR+JHBZO4BNdYD',
  'qktdJMOFkASh7ggbPFl/jIoPA/uoAABjCE5BqVV1FfaqxnDOLlURHHkSF8jxzHpV',
  'ctECAkOgMNtv3ALuPcKT/6ioYXCoZFtXqFBjHW49ztEhTQxOdxMYxkToygJUT3bL',
  'wdb++2Cnvc3A09QDebxi3rWFo71IP3UwV0pgn8YeKeVRKo0dHiPWMoVO6NFGk+E1',
  'FkPXR4M3AgMBAAECggEAArLfeKHNst+RcWVc5Z5yJgJt3EadHF59QHNcKmfQF1Za',
  'Osk8O3McQOV+0aR5xanEizwgBfOjh4yeGpMylwzcg26c9NcAPC0V+wg64++qTrm/',
  '75NvQgEPW/ekanGZrHj8a8wOnn+gaHU3iUpf21KcfBL97w8wB4LFsolfP1l4JNOZ',
  'tzNB1w42vsL3pdO2noD+50cbA+PYO+PgrQWkCqiuIj6KdvynhK1JqEzTdupld2FJ',
  '+IaX9xYVwEeXO2xMUHMPtJrm2QLe+T0t3WQXFol+DExN4Ogbr9bKBe4XtRH8cPLm',
  'Aekvg7CedwwxV+4cxMJExvbzQnny0MhpTAVEWSvWkQKBgQDL/EBOUTmcsHbDwNaM',
  'QL451j3nmHXgVb1ssYryoop/VP1QQFxydxNI8bmkEYGibNqDIL2FQTMW8lVq07lv',
  '+hPDnDw2o/Gwf1B10dbVmO0fJgrMp2AkqlxVW0hRybtCR7aj7drAzYKvZ5++r6Mr',
  'mU9hfUfUYd1AWgpdAS7oICcYDQKBgQDKkIChlfxBFJakD9RgbSHMkIeKLpFsEnRD',
  'D0x+aclMTnhf/16v4BvBr7Xz7r/W9HGzCKGvLCGXlgY1DpudgTvepWlSCkwLgu60',
  'KZZ6N6mb4+UP+ePKJjq3LSXeFsgYTFS6vx5kMqxyHKlQL/V8+5idZ/v6ktf4iLoK',
  'Jm3xfujTUwKBgQCFg8ZTfLbI6HfUCRRlGLtp/+DlBdWh0Hz79/mKdvlP/sEPFhFs',
  'mqP0ysNHsG25cqZTzco+vj5CdruSAKMPuA/XqRuAaC5559syQvbrN/18tdm7upIj',
  'bZ6h/+2GGxSGfYn+ImFccSdox9q3ZR7YGrDqjqXFTYkT5duCpJOfO+xawQKBgQCe',
  'iRHjZVuUI+TyamExRrhZPhSWlXPDPX44rdSUa37cdd3IZDlbNO8EW9zwGT+ToKUM',
  'FglU7BkuZoBdLh2k2+xbiOIxD1YM/GCOKK5Y4Q+hrm8sXctl/x2dF3y3oOTh/3ug',
  '3MuQaAiHFt98nsxnERKUvzl7F0pofbn9D66kf0sBeQKBgQCHok1BtBSO407qupvS',
  'W4AGqHz83aAxlJ9ejBkpkbjOyMUnl8+cC7NxuaxYZQGmfLcsybnF8PY2TETLBOyJ',
  's9wFsk5vlYRjciiO5Wiubn0gdVo9+BCHK/zGPzJ+pW9IhGrkxm9wUsmnvA/Q0ALz',
  'uz2QzgmX1PGEbHVoM7sUhGTn2g==',
  '-----END PRIVATE KEY-----',
].join('\n');

/** Base64url encode (RFC 4648 §5) */
function base64url(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** Create JWT signed with RS256 */
async function createJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: SA_TOKEN_URI,
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;

  const pemBody = SA_PRIVATE_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${base64url(new Uint8Array(sig))}`;
}

/** Get access token from Google OAuth2 */
async function getAccessToken(): Promise<string> {
  const jwt = await createJWT();
  const res = await fetch(SA_TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`Google OAuth error: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

/** Create a folder in Google Drive */
export async function createDriveFolder(
  folderName: string,
  parentFolderId: string
): Promise<{ id: string; url: string }> {
  const token = await getAccessToken();
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    }),
  });
  if (!res.ok) throw new Error(`Drive create folder error: ${await res.text()}`);
  const folder = await res.json();

  // Tornar a pasta pública (link viewer)
  await enablePublicLink(token, folder.id);

  return {
    id: folder.id,
    url: `https://drive.google.com/drive/folders/${folder.id}`,
  };
}

/** Enable "anyone with link" for a folder */
async function enablePublicLink(token: string, folderId: string): Promise<void> {
  try {
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}/permissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'anyone', role: 'reader' }),
      }
    );
  } catch (err) {
    console.warn('⚠️ Não foi possível tornar a pasta pública:', err);
  }
}
