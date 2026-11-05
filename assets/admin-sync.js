(() => {
  const CLIENT_SYNC = 'https://searchcraft-l7fv.onrender.com/sync/?target=admin';
  const encode = value => btoa(unescape(encodeURIComponent(JSON.stringify(value))))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const decode = value => JSON.parse(decodeURIComponent(escape(atob(value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=')))));
  const writableKey = key =>
    key === 'sc_shipments' ||
    key === 'sc_module_records' ||
    key.startsWith('sc_profile:') ||
    key.startsWith('sc_wallet_balance:');
  const nativeSetItem = Storage.prototype.setItem;

  const syncMatch = location.hash.match(/^#sync=([A-Za-z0-9_-]+)$/);
  if (syncMatch) {
    let snapshot = {};
    try { snapshot = decode(syncMatch[1]); } catch { snapshot = {}; }
    for (const [key, value] of Object.entries(snapshot)) {
      if (typeof value === 'string') nativeSetItem.call(localStorage, key, value);
    }
    sessionStorage.removeItem('sc_admin_pending_writes');
    sessionStorage.setItem('sc_admin_top_sync_at', String(Date.now()));
    sessionStorage.setItem('sc_admin_sync_status', `Connected ${new Date().toISOString()}`);
    history.replaceState(null, '', '/admin/#All%20Sellers');
    location.reload();
    return;
  }

  const readPending = () => {
    try { return JSON.parse(sessionStorage.getItem('sc_admin_pending_writes') || '{}'); }
    catch { return {}; }
  };
  const syncNow = () => {
    const pending = readPending();
    const push = Object.keys(pending).length ? `#push=${encode(pending)}` : '';
    location.href = `${CLIENT_SYNC}${push}`;
  };

  Storage.prototype.setItem = function(key, value) {
    nativeSetItem.call(this, key, value);
    if (this === localStorage && writableKey(String(key))) {
      const pending = readPending();
      pending[String(key)] = String(value);
      sessionStorage.setItem('sc_admin_pending_writes', JSON.stringify(pending));
    }
  };

  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'adminDataSync';
  button.textContent = '↻ Sync data';
  button.title = 'Sync sellers, orders and account data from the client portal';
  button.addEventListener('click', syncNow);
  document.querySelector('#notifications')?.before(button);

  const lastSync = Number(sessionStorage.getItem('sc_admin_top_sync_at') || 0);
  if (!lastSync || Date.now() - lastSync > 5 * 60 * 1000) setTimeout(syncNow, 0);
})();
