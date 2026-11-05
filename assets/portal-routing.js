(() => {
  const ADMIN_HOST = 'searchcraftadmin.onrender.com';
  const CLIENT_LOGIN = 'https://searchcraft-l7fv.onrender.com/login/';
  const ADMIN_LOGIN = `https://${ADMIN_HOST}/login/?admin=1`;
  const host = location.hostname.toLowerCase();
  const path = location.pathname.toLowerCase();
  const authenticated = sessionStorage.getItem('sc_auth') === '1';
  const superAdmin = (sessionStorage.getItem('sc_role') || '').toUpperCase() === 'SUPER_ADMIN';

  if (host === ADMIN_HOST) {
    const adminRoute = path.startsWith('/admin/');
    const loginRoute = path.startsWith('/login/');
    if (!adminRoute && !loginRoute) {
      location.replace(authenticated && superAdmin ? '/admin/' : '/login/?admin=1');
    }
    return;
  }

  if (path.startsWith('/admin/')) {
    location.replace(ADMIN_LOGIN);
    return;
  }

  if (path.startsWith('/panel/') && (!authenticated || superAdmin)) {
    location.replace(superAdmin ? ADMIN_LOGIN : CLIENT_LOGIN);
  }
})();
