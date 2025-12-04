function generateUUIDv4() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}`;
}

function base64UrlDecode(input) {
  if (!input) return '';
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad === 2) input += '==';
  else if (pad === 3) input += '=';
  else if (pad !== 0) return null;
  try {
    const decoded = atob(input);
    try {
      return decodeURIComponent(Array.prototype.map.call(decoded, c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch (e) {
      return decoded;
    }
  } catch (e) {
    return null;
  }
}

function decodeJWT(jwt) {
  const parts = jwt.split('.');
  if (parts.length < 2) return { error: 'Invalid JWT format' };
  const header = base64UrlDecode(parts[0]);
  const payload = base64UrlDecode(parts[1]);
  const signature = parts[2] || '';
  let hdrJson, pldJson;
  try { hdrJson = JSON.parse(header); } catch { hdrJson = header; }
  try { pldJson = JSON.parse(payload); } catch { pldJson = payload; }
  return { header: hdrJson, payload: pldJson, signature };
}

function generateTimestamp() {
  return `${Date.now()}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const genUuidBtn = document.getElementById('genUuidBtn');
  const uuidOut = document.getElementById('uuidOut');
  const copyUuid = document.getElementById('copyUuid');
  const decodeBtn = document.getElementById('decodeBtn');
  const jwtIn = document.getElementById('jwtIn');
  const hdr = document.getElementById('hdr');
  const pld = document.getElementById('pld');
  const sig = document.getElementById('sig');
  const copyPayload = document.getElementById('copyPayload');
  const genTsBtn = document.getElementById('genTsBtn');
  const tsOut = document.getElementById('tsOut');
  const copyTs = document.getElementById('copyTs')


  genUuidBtn.addEventListener('click', () => uuidOut.value = generateUUIDv4());
  genTsBtn.addEventListener('click', () => tsOut.value = generateTimestamp());

  copyUuid.addEventListener('click', async () => {
    if (!uuidOut.value) return;
    try { await navigator.clipboard.writeText(uuidOut.value); } catch (e) { uuidOut.select(); document.execCommand('copy'); }
  });

  decodeBtn.addEventListener('click', () => {
    const token = jwtIn.value.trim();
    const decoded = decodeJWT(token);
    if (decoded.error) {
      hdr.textContent = '';
      pld.textContent = decoded.error;
      sig.textContent = '';
      return;
    }
    hdr.textContent = typeof decoded.header === 'string' ? decoded.header : JSON.stringify(decoded.header, null, 2);
    pld.textContent = typeof decoded.payload === 'string' ? decoded.payload : JSON.stringify(decoded.payload, null, 2);
    sig.textContent = decoded.signature;
  });

  copyPayload.addEventListener('click', async () => {
    const text = pld.textContent || '';
    if (!text) return;
    await navigator.clipboard.writeText(text);
  });

  copyTs.addEventListener('click', async () => {
    if (!tsOut.value) return;
    try { await navigator.clipboard.writeText(tsOut.value); } catch (e) { tsOut.select(); document.execCommand('copy'); }
  });
});
