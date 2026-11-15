// Cálculo del presupuesto. Las tarifas NO están aquí (serían visibles para cualquiera):
// están en el programa de Google (Code.gs, apartado PRICES) y solo las recibe el panel con tu clave.
window.DD_PRICES = null;

window.ddIsFav = code => /^F\d\d$/.test(String(code || ''));
window.ddCountNames = s => String(s || '').split(/,|;|\/|\n|\s+y\s+|\s+e\s+|\s*&\s*/i).map(x => x.trim()).filter(Boolean).length;
window.ddLayers = cat => Math.min(3, Math.max(1, ((window.DD_PRICES || {}).layers || {})[cat] || 1));
window.ddUnitPrice = (code, size, cat) => {
  if (!window.DD_PRICES) return null;
  if (String(code) === '#ESP') return null;           // diseño especial: siempre a presupuesto
  const P = window.DD_PRICES, t = window.ddIsFav(code) ? P.fav : P.catalog;
  if (!Object.prototype.hasOwnProperty.call(t, size)) return null;
  const v = t[size];
  return Array.isArray(v) ? v[window.ddLayers(cat) - 1] : v;
};
window.ddTierRate = units => { for (const [min, r] of window.DD_PRICES.tiers) if (units >= min) return r; return 0; };

// Calcula el presupuesto orientativo de una lista de artículos {code, size, qty, names}
window.ddQuote = function (items) {
  const P = window.DD_PRICES;
  const units = items.reduce((a, it) => a + (+it.qty || 0), 0);
  const catRate = window.ddTierRate(units);
  const favRate = units >= P.favDiscount.min ? P.favDiscount.rate : 0;
  let products = 0, discount = 0, extras = 0, custom = 0;
  const lines = items.map(it => {
    const qty = Math.max(1, +it.qty || 1), fav = window.ddIsFav(it.code);
    const unit = window.ddUnitPrice(it.code, it.size, it.cat);
    const layers = fav ? 0 : window.ddLayers(it.cat);
    const n = window.ddCountNames(it.names);
    const extraNames = fav ? Math.max(0, n - P.favNamesIncluded) * qty : Math.max(0, n - qty);
    const paint = it.finish === 'Pintado' ? (P.paint || 0) * qty : 0;
    const extra = extraNames * P.extraName + paint;
    if (unit === null) { custom++; return { code: it.code, qty, layers, paint, unit: null, extraNames, extra, subtotal: null, rate: 0, discount: 0 }; }
    const subtotal = unit * qty + extra;
    const rate = fav ? favRate : catRate;
    const d = Math.round(subtotal * rate * 100) / 100;
    products += subtotal; discount += d; extras += extra;
    return { code: it.code, qty, layers, paint, unit, extraNames, extra, subtotal, rate, discount: d };
  });
  const r2 = x => Math.round(x * 100) / 100;
  return { units, lines, products: r2(products), discount: r2(discount), extras: r2(extras), total: r2(products - discount), custom, catRate, favRate };
};
