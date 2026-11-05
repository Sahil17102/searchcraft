(() => {
  const CLIENT_ORIGIN = 'https://searchcraft-l7fv.onrender.com';
  const frame = document.createElement('iframe');
  frame.src = `${CLIENT_ORIGIN}/sync/?v=1`;
  frame.title = 'SearchCraft client data sync';
  frame.hidden = true;
  frame.setAttribute('aria-hidden', 'true');
  document.body.append(frame);

  let importing = false;
  const writableKey = key =>
    key === 'sc_shipments' ||
    key === 'sc_module_records' ||
    key.startsWith('sc_profile:') ||
    key.startsWith('sc_wallet_balance:');
  const nativeSetItem = Storage.prototype.setItem;

  Storage.prototype.setItem = function(key, value) {
    nativeSetItem.call(this, key, value);
    if (!importing && this === localStorage && writableKey(String(key)) && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'searchcraft:write', key: String(key), value: String(value) }, CLIENT_ORIGIN);
    }
  };

  const requestSnapshot = () => frame.contentWindow?.postMessage({ type: 'searchcraft:pull' }, CLIENT_ORIGIN);
  frame.addEventListener('load', requestSnapshot);

  addEventListener('message', event => {
    if (event.origin !== CLIENT_ORIGIN || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'searchcraft:ready') {
      requestSnapshot();
      return;
    }
    if (event.data?.type !== 'searchcraft:snapshot' || !event.data.data) return;

    const entries = Object.entries(event.data.data);
    const digest = JSON.stringify(entries.sort(([a], [b]) => a.localeCompare(b)));
    if (sessionStorage.getItem('sc_admin_sync_digest') === digest) return;

    let changed = false;
    importing = true;
    for (const [key, value] of entries) {
      if (localStorage.getItem(key) !== value) {
        nativeSetItem.call(localStorage, key, value);
        changed = true;
      }
    }
    importing = false;
    sessionStorage.setItem('sc_admin_sync_digest', digest);
    sessionStorage.setItem('sc_admin_sync_status', `Connected ${new Date().toISOString()}`);
    if (changed) location.reload();
  });
})();
