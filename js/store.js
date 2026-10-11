/* Persistência (localStorage) e regras de disponibilidade */
(function () {
  const K = { appts: 'mc.appts.v2', user: 'mc.user.v2', theme: 'mc.theme' };
  const read = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = n => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;

  // hash determinístico para simular horários já ocupados
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 100;
  }

  const Store = {
    iso, parseISO, pad,
    getUser: () => read(K.user, null),
    setUser: u => write(K.user, u),
    logout: () => localStorage.removeItem(K.user),
    getTheme: () => localStorage.getItem(K.theme),
    setTheme: t => localStorage.setItem(K.theme, t),

    all: () => read(K.appts, []),
    save: list => write(K.appts, list),
    mine(email) {
      return this.all().filter(a => a.patient.email.toLowerCase() === (email || '').toLowerCase());
    },
    add(a) { const l = this.all(); l.push(a); this.save(l); return a; },
    update(id, patch) {
      const l = this.all(); const i = l.findIndex(a => a.id === id);
      if (i > -1) { l[i] = { ...l[i], ...patch }; this.save(l); }
    },
    uid: () => 'MC-' + Math.random().toString(36).slice(2, 7).toUpperCase(),

    /* Horários do médico em um dia (com flag de disponibilidade) */
    slots(doc, dateISO, ignoreId) {
      const d = parseISO(dateISO);
      if (!doc.days.includes(d.getDay())) return [];
      const booked = new Set(this.all()
        .filter(a => a.status === 'confirmed' && a.doctorId === doc.id && a.date === dateISO && a.id !== ignoreId)
        .map(a => a.time));
      const now = new Date();
      const isToday = iso(now) === dateISO;
      const nowMin = now.getHours() * 60 + now.getMinutes() + 60; // antecedência mínima 1h
      const out = [];
      for (let m = toMin(doc.start); m < toMin(doc.end); m += 30) {
        if (m >= 720 && m < 780) continue; // almoço 12h–13h
        const t = fromMin(m);
        const busy = booked.has(t) || hash(doc.id + dateISO + t) < 30;
        const past = isToday && m < nowMin;
        out.push({ time: t, available: !busy && !past, period: m < 720 ? 'Manhã' : m < 1080 ? 'Tarde' : 'Noite' });
      }
      return out;
    },
    freeCount(doc, dateISO, ignoreId) { return this.slots(doc, dateISO, ignoreId).filter(s => s.available).length; },
    nextFree(doc) {
      const d = new Date();
      for (let i = 0; i < 45; i++) {
        const key = iso(d);
        const s = this.slots(doc, key).find(x => x.available);
        if (s) return { date: key, time: s.time };
        d.setDate(d.getDate() + 1);
      }
      return null;
    }
  };
  window.Store = Store;
})();

