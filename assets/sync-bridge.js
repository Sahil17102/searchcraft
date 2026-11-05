(() => {
  const ADMIN_ORIGIN = 'https://searchcraftadmin.onrender.com';
  const allowedKey = key =>
    key === 'sc_shipments' ||
    key === 'sc_module_records' ||
    key.startsWith('sc_signup:') ||
    key.startsWith('sc_profile:') ||
    key.startsWith('sc_workspace_users:') ||
    key.startsWith('sc_wallet_balance:');

  const safeJson = (value, fallback) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };

  const sanitizeValue = (key, value) => {
    if (key.startsWith('sc_signup:')) {
      const record = safeJson(value, {});
      const { password, ...safe } = record;
      return JSON.stringify(safe);
    }
    if (key.startsWith('sc_workspace_users:')) {
      const users = safeJson(value, []);
      return JSON.stringify(users.map(user => {
        const { password, ...safe } = user;
        return safe;
      }));
    }
    return value;
  };

  const snapshot = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && allowedKey(key)) data[key] = sanitizeValue(key, localStorage.getItem(key));
    }
    return data;
  };

  const publish = () => parent.postMessage({ type: 'searchcraft:snapshot', data: snapshot() }, ADMIN_ORIGIN);

  const encode = value => btoa(unescape(encodeURIComponent(JSON.stringify(value))))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const decode = value => JSON.parse(decodeURIComponent(escape(atob(value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=')))));

  if (window === top) {
    const params = new URLSearchParams(location.search);
    if (params.get('target') !== 'admin') return;
    const pushMatch = location.hash.match(/^#push=([A-Za-z0-9_-]+)$/);
    if (pushMatch) {
      let writes = {};
      try { writes = decode(pushMatch[1]); } catch { writes = {}; }
      for (const [key, value] of Object.entries(writes)) {
        const writable = key === 'sc_shipments' || key === 'sc_module_records' || key.startsWith('sc_profile:') || key.startsWith('sc_wallet_balance:');
        if (writable && typeof value === 'string') localStorage.setItem(key, value);
      }
    }
    location.replace(`${ADMIN_ORIGIN}/admin/#sync=${encode(snapshot())}`);
    return;
  }

  addEventListener('message', event => {
    if (event.origin !== ADMIN_ORIGIN || event.source !== parent) return;
    if (event.data?.type === 'searchcraft:pull') publish();
    if (event.data?.type === 'searchcraft:write') {
      const { key, value } = event.data;
      const writable = key === 'sc_shipments' || key === 'sc_module_records' || key.startsWith('sc_profile:') || key.startsWith('sc_wallet_balance:');
      if (writable && typeof value === 'string') localStorage.setItem(key, value);
    }
  });

  addEventListener('storage', event => {
    if (event.key && allowedKey(event.key)) publish();
  });

  parent.postMessage({ type: 'searchcraft:ready' }, ADMIN_ORIGIN);
})();
