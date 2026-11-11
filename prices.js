// 💶 Tarifas de Dolce Dettaglio · Navidad 2026
// Si cambias un precio aquí, cambia en la tienda y en el cálculo automático del panel.
window.DD_PRICES = {
  // Diseños del catálogo (precio por unidad, 1 nombre incluido por unidad)
  catalog: { 'Mini · 6 cm': 4, 'Estándar · 8 cm': 5, 'Grande · 10 cm': 6.5, 'XL · a medida': null },
  // Favoritos F01–F10 (precio por unidad, hasta 5 nombres incluidos)
  fav: { '10 cm': 10, '15 cm': 14, '20 cm': 18, 'Tamaño personalizado': null },
  favNamesIncluded: 5,
  extraName: 1,                                 // € por cada nombre adicional
  // Descuento según unidades totales del pedido (solo diseños del catálogo)
  tiers: [[20, 0.20], [10, 0.17], [5, 0.15]],
  // Descuento de los favoritos a partir de X unidades totales
  favDiscount: { min: 5, rate: 0.10 }
};

window.ddIsFav = code => /^F\d\d$/.test(String(code || ''));
window.ddCountNames = s => String(s || '').split(/,|;|\/|\n|\s+y\s+|\s+e\s+|\s*&\s*/i).map(x => x.trim()).filter(Boolean).length;
window.ddUnitPrice = (code, size) => {
  const P = window.DD_PRICES, t = window.ddIsFav(code) ? P.fav : P.catalog;
  return Object.prototype.hasOwnProperty.call(t, size) ? t[size] : null;
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
    const unit = window.ddUnitPrice(it.code, it.size);
    const n = window.ddCountNames(it.names);
    const extraNames = fav ? Math.max(0, n - P.favNamesIncluded) * qty : Math.max(0, n - qty);
    const extra = extraNames * P.extraName;
    if (unit === null) { custom++; return { code: it.code, qty, unit: null, extraNames, extra, subtotal: null, rate: 0, discount: 0 }; }
    const subtotal = unit * qty + extra;
    const rate = fav ? favRate : catRate;
    const d = Math.round(subtotal * rate * 100) / 100;
    products += subtotal; discount += d; extras += extra;
    return { code: it.code, qty, unit, extraNames, extra, subtotal, rate, discount: d };
  });
  const r2 = x => Math.round(x * 100) / 100;
  return { units, lines, products: r2(products), discount: r2(discount), extras: r2(extras), total: r2(products - discount), custom, catRate, favRate };
};
