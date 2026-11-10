// Comunicación con el servidor de pedidos (Google Apps Script)
window.ddReady = () => /^https:\/\/script\.google(usercontent)?\.com\//.test((window.DD_CONFIG || {}).API_URL || '');
window.ddApi = async function (action, payload) {
  if (!window.ddReady()) throw new Error('La tienda todavía no está conectada al sistema de pedidos.');
  let res;
  try {
    res = await fetch(window.DD_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
  } catch (e) { throw new Error('No hay conexión con el servidor. Inténtalo de nuevo en unos segundos.'); }
  let data;
  try { data = await res.json(); } catch (e) { throw new Error('Respuesta inesperada del servidor.'); }
  if (!data.ok) throw new Error(data.error || 'Ha ocurrido un error.');
  return data;
};
window.ddMoney = x => (x === '' || x === null || x === undefined || isNaN(+x)) ? '—' : (Math.round(+x * 100) / 100).toFixed(2).replace('.', ',') + ' €';
window.ddEsc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
