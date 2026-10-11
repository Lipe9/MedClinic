/* MedClinic — aplicação (SPA com rotas por hash) */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app');
  const ico = n => `<svg class="ic"><use href="#i-${n}"/></svg>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clinicOf = id => CLINICS.find(c => c.id === id);
  const docOf = id => DOCTORS.find(d => d.id === id);
  const initials = n => n.replace(/^(Dr\.|Dra\.)\s*/, '').split(' ').map(p => p[0]).slice(0, 2).join('');
  const money = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (iso, o = { weekday: 'long', day: 'numeric', month: 'long' }) => Store.parseISO(iso).toLocaleDateString('pt-BR', o);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const avatar = d => `<span class="avatar" style="--c:${clinicOf(d.clinic).color}">${esc(initials(d.name))}</span>`;

  /* ---------- Toast / Modal ---------- */
  function toast(msg, type = 'ok') {
    const t = document.createElement('div');
    t.className = 'toast toast--' + type;
    t.innerHTML = `${ico(type === 'ok' ? 'check' : 'info')}<span>${esc(msg)}</span>`;
    $('#toasts').append(t);
    setTimeout(() => t.classList.add('out'), 3200);
    setTimeout(() => t.remove(), 3600);
  }
  const modal = $('#modal');
  function openModal(html) {
    modal.innerHTML = `<div class="modal__bg" data-action="close-modal"></div><div class="modal__card" role="dialog" aria-modal="true">${html}</div>`;
    modal.hidden = false; document.body.classList.add('lock');
    const f = $('input,button.btn--primary', modal); f && f.focus();
  }
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; document.body.classList.remove('lock'); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- Máscaras / validação ---------- */
  const maskPhone = v => { v = v.replace(/\D/g, '').slice(0, 11); return v.length > 10 ? v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3') : v.length > 6 ? v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3') : v.length > 2 ? v.replace(/(\d{2})(\d*)/, '($1) $2') : v; };
  const maskCPF = v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  function validCPF(c) {
    c = c.replace(/\D/g, ''); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    for (let t = 9; t < 11; t++) {
      let s = 0; for (let i = 0; i < t; i++) s += +c[i] * (t + 1 - i);
      if (((s * 10) % 11) % 10 !== +c[t]) return false;
    }
    return true;
  }
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  /* ---------- Tema ---------- */
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    $('#themeIcon').setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
    $('meta[name=theme-color]').content = t === 'dark' ? '#0b1416' : '#0f766e';
  }
  applyTheme(Store.getTheme() || 'light');

  /* ---------- Usuário ---------- */
  function renderUser() {
    const u = Store.getUser(), b = $('#userBtn');
    b.innerHTML = u ? `<span class="avatar avatar--sm">${esc(initials(u.name))}</span><span class="hide-sm">${esc(u.name.split(' ')[0])}</span>` : `${ico('user')}<span class="hide-sm">Entrar</span>`;
    b.setAttribute('aria-label', u ? 'Conta' : 'Entrar');
  }
  function userModal() {
    const u = Store.getUser();
    if (u) {
      openModal(`<h2>Olá, ${esc(u.name.split(' ')[0])} 👋</h2><p class="muted">${esc(u.email)}</p>
        <div class="row gap"><a class="btn btn--primary" href="#/consultas" data-action="close-modal">Minhas consultas</a>
        <button class="btn btn--ghost" data-action="logout">Sair</button></div>`);
    } else {
      openModal(`<h2>Identifique-se</h2><p class="muted">Use seu e-mail para acompanhar, remarcar e cancelar suas consultas. Seus dados ficam salvos apenas neste dispositivo.</p>
        <form id="loginForm" class="form" novalidate>
          ${field('name', 'Nome completo', 'text', 'name', 'Maria da Silva')}
          ${field('email', 'E-mail', 'email', 'email', 'voce@email.com')}
          <button class="btn btn--primary btn--block">Continuar ${ico('arrow')}</button>
        </form>`);
    }
  }
  const field = (id, label, type, ac, ph, val = '', extra = '') => `
    <label class="field"><span>${label}</span>
      <input id="${id}" name="${id}" type="${type}" autocomplete="${ac}" placeholder="${ph}" value="${esc(val)}" ${extra}>
      <small class="err" data-err="${id}"></small></label>`;
  function setErr(form, id, msg) {
    const el = $(`[data-err="${id}"]`, form); if (el) el.textContent = msg || '';
    const i = $('#' + id, form); i && i.classList.toggle('invalid', !!msg);
  }

  /* ---------- Estado do agendamento ---------- */
  let B = freshBooking();
  function freshBooking() {
    const u = Store.getUser();
    return { step: 1, clinic: null, doctor: null, date: null, time: null, reason: '', resched: null, done: null,
      patient: { name: u?.name || '', email: u?.email || '', phone: u?.phone || '', cpf: u?.cpf || '' } };
  }

  /* ---------- Views ---------- */
  function viewHome() {
    const next = Store.mine(Store.getUser()?.email).filter(a => a.status === 'confirmed' && a.date >= Store.iso(new Date()))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
    return `
    <section class="hero">
      <div class="wrap hero__in">
        <div class="hero__text reveal">
          <span class="pill">${ico('shield')} Agendamento 100% online · sem filas</span>
          <h1>Cuidar de você <em>nunca foi tão simples.</em></h1>
          <p>Escolha a especialidade, o profissional e o melhor horário. Em menos de um minuto sua consulta está confirmada.</p>
          <div class="row gap">
            <a href="#/agendar" class="btn btn--primary btn--lg">Agendar agora ${ico('arrow')}</a>
            <a href="#/medicos" class="btn btn--ghost btn--lg">Ver especialistas</a>
          </div>
          <ul class="stats">
            <li><b>${DOCTORS.length}</b><span>especialistas</span></li>
            <li><b>${CLINICS.length}</b><span>clínicas</span></li>
            <li><b>4.9</b><span>${ico('star')} avaliação média</span></li>
          </ul>
        </div>
        <div class="hero__card reveal">
          ${next ? upcomingCard(next) : quickCard()}
        </div>
      </div>
    </section>

    <section class="wrap section">
      <header class="section__head"><h2>Nossas especialidades</h2><p>Quatro clínicas, um único lugar para agendar.</p></header>
      <div class="grid grid--4">
        ${CLINICS.map(c => `
          <a class="card clinic reveal" href="#/agendar?clinic=${c.id}" style="--c:${c.color}">
            <span class="clinic__emoji">${c.emoji}</span>
            <h3>${esc(c.specialty)}</h3>
            <p>${esc(c.desc)}</p>
            <span class="link">Agendar ${ico('arrow')}</span>
          </a>`).join('')}
      </div>
    </section>

    <section class="wrap section">
      <header class="section__head"><h2>Como funciona</h2></header>
      <ol class="steps">
        <li class="reveal"><b>1</b><h3>Escolha</h3><p>Selecione a especialidade e o profissional ideal para você.</p></li>
        <li class="reveal"><b>2</b><h3>Reserve</h3><p>Veja os horários livres em tempo real e escolha o melhor.</p></li>
        <li class="reveal"><b>3</b><h3>Confirme</h3><p>Receba o comprovante e adicione à sua agenda com um toque.</p></li>
      </ol>
    </section>

    <section class="wrap section">
      <div class="perks">
        <div class="reveal">${ico('clock')}<h3>Horários em tempo real</h3><p>Sem conflitos: só mostramos o que está livre.</p></div>
        <div class="reveal">${ico('repeat')}<h3>Remarque quando quiser</h3><p>Mudou de ideia? Altere ou cancele em segundos.</p></div>
        <div class="reveal">${ico('calendar')}<h3>Integra com sua agenda</h3><p>Baixe o arquivo .ics para Google, Apple ou Outlook.</p></div>
        <div class="reveal">${ico('shield')}<h3>Privacidade</h3><p>Seus dados permanecem no seu dispositivo.</p></div>
      </div>
    </section>`;
  }
  const upcomingCard = a => {
    const d = docOf(a.doctorId);
    return `<h3>${ico('bell')} Sua próxima consulta</h3>
      <div class="mini">${avatar(d)}<div><b>${esc(d.name)}</b><span>${esc(d.role)}</span></div></div>
      <div class="when"><div>${ico('calendar')}${cap(fmtDate(a.date))}</div><div>${ico('clock')}${a.time}</div></div>
      <a class="btn btn--ghost btn--block" href="#/consultas">Gerenciar</a>`;
  };
  function quickCard() {
    return `<h3>Agendamento rápido</h3>
      <p class="muted">Primeiro horário livre por especialidade:</p>
      <ul class="quick">${CLINICS.map(c => {
        const d = DOCTORS.find(x => x.clinic === c.id), n = Store.nextFree(d);
        return `<li><a href="#/agendar?doctor=${d.id}" style="--c:${c.color}"><span class="clinic__emoji sm">${c.emoji}</span>
          <span><b>${esc(c.specialty)}</b><small>${n ? cap(fmtDate(n.date, { weekday: 'short', day: 'numeric', month: 'short' })) + ' · ' + n.time : 'Sem horários'}</small></span>${ico('arrow')}</a></li>`;
      }).join('')}</ul>`;
  }

  function viewDoctors() {
    return `<section class="wrap section page">
      <header class="section__head"><h1>Nossos especialistas</h1><p>Profissionais experientes, prontos para atender você.</p></header>
      <div class="chips" id="docFilter">
        <button class="chip on" data-filter="all">Todos</button>
        ${CLINICS.map(c => `<button class="chip" data-filter="${c.id}">${c.emoji} ${esc(c.specialty)}</button>`).join('')}
      </div>
      <div class="grid grid--2" id="docGrid">${DOCTORS.map(doctorCard).join('')}</div>
    </section>`;
  }
  function doctorCard(d) {
    const c = clinicOf(d.clinic), n = Store.nextFree(d);
    return `<article class="card doc" data-clinic="${d.clinic}" style="--c:${c.color}">
      <div class="doc__top">${avatar(d)}<div><h3>${esc(d.name)}</h3><span class="muted">${esc(d.role)} · ${esc(d.crm)}</span>
        <div class="rating">${ico('star')} ${d.rating.toFixed(1)} <span class="muted">· ${d.years} anos de experiência</span></div></div></div>
      <p>${esc(d.bio)}</p>
      <div class="meta">${ico('pin')} ${esc(c.name)}</div>
      <div class="meta">${ico('clock')} ${n ? 'Próximo: ' + fmtDate(n.date, { weekday: 'short', day: 'numeric', month: 'short' }) + ' às ' + n.time : 'Sem horários'}</div>
      <div class="doc__foot"><b>${money(d.price)}</b><a class="btn btn--primary btn--sm" href="#/agendar?doctor=${d.id}">Agendar</a></div>
    </article>`;
  }

  /* --- Fluxo de agendamento --- */
  const STEPS = ['Especialidade', 'Profissional', 'Data e hora', 'Seus dados'];
  function viewBook() {
    if (B.step === 5) return viewDone();
    const bar = `<ol class="progress" aria-label="Progresso">${STEPS.map((s, i) => `
      <li class="${i + 1 < B.step ? 'done' : ''} ${i + 1 === B.step ? 'now' : ''}"><span>${i + 1 < B.step ? ico('check') : i + 1}</span><em>${s}</em></li>`).join('')}</ol>`;
    let body = '';
    if (B.step === 1) body = stepClinic();
    if (B.step === 2) body = stepDoctor();
    if (B.step === 3) body = stepDate();
    if (B.step === 4) body = stepData();
    return `<section class="wrap section page">
      <header class="section__head left"><h1>${B.resched ? 'Remarcar consulta' : 'Agendar consulta'}</h1></header>
      ${bar}
      <div class="book">
        <div class="book__main">${body}</div>
        <aside class="book__side">${summary()}</aside>
      </div>
      <div class="book__bar">${nav()}</div>
    </section>`;
  }
  function stepClinic() {
    return `<h2 class="step-title">Qual especialidade você procura?</h2>
      <div class="grid grid--2">${CLINICS.map(c => `
        <button class="card pick ${B.clinic === c.id ? 'sel' : ''}" data-action="pick-clinic" data-id="${c.id}" style="--c:${c.color}">
          <span class="clinic__emoji">${c.emoji}</span>
          <span><b>${esc(c.specialty)}</b><small>${esc(c.name)}</small><small>${ico('pin')} ${esc(c.address)}</small></span>
        </button>`).join('')}</div>`;
  }
  function stepDoctor() {
    const list = DOCTORS.filter(d => d.clinic === B.clinic);
    return `<h2 class="step-title">Escolha o profissional</h2>
      <div class="grid grid--2">${list.map(d => {
        const n = Store.nextFree(d);
        return `<button class="card pick doc-pick ${B.doctor === d.id ? 'sel' : ''}" data-action="pick-doctor" data-id="${d.id}" style="--c:${clinicOf(d.clinic).color}">
          ${avatar(d)}<span><b>${esc(d.name)}</b><small>${esc(d.role)}</small>
          <small>${ico('star')} ${d.rating.toFixed(1)} · ${money(d.price)}</small>
          <small class="ok">${n ? 'Próximo: ' + fmtDate(n.date, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + n.time : 'Sem horários'}</small></span></button>`;
      }).join('')}</div>`;
  }
  function stepDate() {
    const d = docOf(B.doctor), today = new Date(), days = [];
    for (let i = 0; i < 30; i++) { const x = new Date(today); x.setDate(today.getDate() + i); days.push(x); }
    const ign = B.resched;
    if (!B.date) { const f = days.find(x => Store.freeCount(d, Store.iso(x), ign) > 0); if (f) B.date = Store.iso(f); }
    const slots = B.date ? Store.slots(d, B.date, ign) : [];
    const groups = ['Manhã', 'Tarde'].map(p => ({ p, items: slots.filter(s => s.period === p) })).filter(g => g.items.length);
    return `<h2 class="step-title">Quando fica melhor para você?</h2>
      <div class="dates" role="listbox" aria-label="Datas">${days.map(x => {
        const k = Store.iso(x), n = Store.freeCount(d, k, ign);
        return `<button class="date ${B.date === k ? 'sel' : ''}" ${n ? '' : 'disabled'} data-action="pick-date" data-id="${k}" aria-label="${fmtDate(k)}">
          <small>${x.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</small><b>${x.getDate()}</b>
          <small>${x.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small><i class="${n && n < 4 ? 'low' : ''}"></i></button>`;
      }).join('')}</div>
      <div class="slots">${B.date ? `<h3>${cap(fmtDate(B.date))}</h3>` : '<p class="muted">Sem datas disponíveis.</p>'}
        ${groups.map(g => `<div class="slots__g"><span>${g.p}</span><div class="slots__row">${g.items.map(s => `
          <button class="slot ${B.time === s.time ? 'sel' : ''}" ${s.available ? '' : 'disabled'} data-action="pick-time" data-id="${s.time}">${s.time}</button>`).join('')}</div></div>`).join('')}
        <p class="legend"><i></i> disponível <i class="x"></i> indisponível</p></div>`;
  }
  function stepData() {
    const p = B.patient;
    return `<h2 class="step-title">Seus dados</h2>
      <form class="form form--grid" id="patientForm" novalidate>
        ${field('name', 'Nome completo', 'text', 'name', 'Maria da Silva', p.name)}
        ${field('email', 'E-mail', 'email', 'email', 'voce@email.com', p.email, 'inputmode="email"')}
        ${field('phone', 'Telefone / WhatsApp', 'tel', 'tel', '(85) 99999-9999', p.phone, 'inputmode="tel"')}
        ${field('cpf', 'CPF', 'text', 'off', '000.000.000-00', p.cpf, 'inputmode="numeric"')}
        <label class="field full"><span>Motivo da consulta <em>(opcional)</em></span>
          <textarea id="reason" rows="3" placeholder="Conte brevemente o que você sente ou precisa">${esc(B.reason)}</textarea></label>
        <label class="check full"><input type="checkbox" id="terms"><span>Concordo em receber lembretes e com o uso dos dados para o agendamento.</span></label>
        <small class="err full" data-err="terms"></small>
      </form>`;
  }
  function summary() {
    const c = clinicOf(B.clinic), d = docOf(B.doctor);
    const row = (i, l, v) => `<li>${ico(i)}<span><small>${l}</small><b>${v || '—'}</b></span></li>`;
    return `<div class="card sum"><h3>Resumo</h3><ul>
      ${row('heart', 'Especialidade', c && esc(c.specialty))}
      ${row('user', 'Profissional', d && esc(d.name))}
      ${row('calendar', 'Data', B.date && cap(fmtDate(B.date, { weekday: 'short', day: 'numeric', month: 'long' })))}
      ${row('clock', 'Horário', B.time)}
      ${row('pin', 'Local', c && esc(c.address))}</ul>
      ${d ? `<div class="sum__total"><span>Valor</span><b>${money(d.price)}</b></div>` : ''}</div>`;
  }
  function nav() {
    const ok = (B.step === 1 && B.clinic) || (B.step === 2 && B.doctor) || (B.step === 3 && B.date && B.time) || B.step === 4;
    return `<button class="btn btn--ghost" data-action="back" ${B.step === 1 ? 'disabled' : ''}>${ico('back')} Voltar</button>
      <button class="btn btn--primary" data-action="next" ${ok ? '' : 'disabled'}>${B.step === 4 ? (B.resched ? 'Confirmar remarcação' : 'Confirmar agendamento') : 'Continuar'} ${ico(B.step === 4 ? 'check' : 'arrow')}</button>`;
  }
  function viewDone() {
    const a = B.done, d = docOf(a.doctorId), c = clinicOf(d.clinic);
    return `<section class="wrap section page"><div class="card done">
      <div class="done__check">${ico('check')}</div>
      <h1>${B.resched ? 'Consulta remarcada!' : 'Consulta confirmada!'}</h1>
      <p class="muted">Código do agendamento <b>${a.id}</b></p>
      <div class="ticket" style="--c:${c.color}">
        <div class="mini">${avatar(d)}<div><b>${esc(d.name)}</b><span>${esc(d.role)}</span></div></div>
        <div class="when"><div>${ico('calendar')}${cap(fmtDate(a.date))}</div><div>${ico('clock')}${a.time}</div><div>${ico('pin')}${esc(c.name)} — ${esc(c.address)}</div></div>
      </div>
      <p class="muted">Chegue 10 minutos antes e leve um documento com foto.</p>
      <div class="row gap center">
        <button class="btn btn--primary" data-action="ics" data-id="${a.id}">${ico('download')} Adicionar à agenda</button>
        <a class="btn btn--ghost" href="#/consultas">Minhas consultas</a>
        <button class="btn btn--ghost" data-action="new">Novo agendamento</button>
      </div></div></section>`;
  }

  /* --- Minhas consultas --- */
  let tab = 'next';
  function viewAppts() {
    const u = Store.getUser();
    if (!u) return `<section class="wrap section page"><div class="empty card">
      <span class="empty__ic">${ico('user')}</span><h2>Identifique-se para ver suas consultas</h2>
      <p class="muted">Informe seu e-mail para acessar seus agendamentos neste dispositivo.</p>
      <button class="btn btn--primary" data-action="user">Entrar</button></div></section>`;
    const today = Store.iso(new Date());
    const all = Store.mine(u.email).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const next = all.filter(a => a.status === 'confirmed' && a.date >= today);
    const past = all.filter(a => a.status !== 'confirmed' || a.date < today).reverse();
    const list = tab === 'next' ? next : past;
    return `<section class="wrap section page">
      <header class="section__head left row between"><div><h1>Minhas consultas</h1><p>${esc(u.name)} · ${esc(u.email)}</p></div>
        <a class="btn btn--primary hide-sm" href="#/agendar">${ico('plus')} Nova consulta</a></header>
      <div class="tabs"><button class="${tab === 'next' ? 'on' : ''}" data-action="tab" data-id="next">Próximas <span>${next.length}</span></button>
        <button class="${tab === 'past' ? 'on' : ''}" data-action="tab" data-id="past">Histórico <span>${past.length}</span></button></div>
      ${list.length ? `<div class="grid grid--2">${list.map(apptCard).join('')}</div>` :
        `<div class="empty card"><span class="empty__ic">${ico('calendar')}</span><h2>${tab === 'next' ? 'Nenhuma consulta agendada' : 'Nada por aqui ainda'}</h2>
        <a class="btn btn--primary" href="#/agendar">Agendar consulta</a></div>`}
    </section>`;
  }
  function apptCard(a) {
    const d = docOf(a.doctorId), c = clinicOf(d.clinic), active = a.status === 'confirmed' && a.date >= Store.iso(new Date());
    const diff = Math.round((Store.parseISO(a.date) - Store.parseISO(Store.iso(new Date()))) / 864e5);
    const when = diff === 0 ? 'Hoje' : diff === 1 ? 'Amanhã' : diff > 1 ? `Em ${diff} dias` : '';
    return `<article class="card appt ${a.status}" style="--c:${c.color}">
      <div class="appt__date"><small>${Store.parseISO(a.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small><b>${Store.parseISO(a.date).getDate()}</b><small>${a.time}</small></div>
      <div class="appt__info"><div class="row between"><b>${esc(d.name)}</b>
        <span class="badge ${a.status === 'cancelled' ? 'bad' : active ? 'good' : ''}">${a.status === 'cancelled' ? 'Cancelada' : active ? (when || 'Confirmada') : 'Concluída'}</span></div>
        <span class="muted">${esc(c.specialty)} · ${esc(c.name)}</span>
        <span class="muted">${ico('pin')} ${esc(c.address)}</span>
        <small class="muted">Código ${a.id}</small>
        ${active ? `<div class="row gap wrap-r"><button class="btn btn--ghost btn--sm" data-action="resched" data-id="${a.id}">${ico('repeat')} Remarcar</button>
          <button class="btn btn--ghost btn--sm" data-action="ics" data-id="${a.id}">${ico('download')} Agenda</button>
          <button class="btn btn--danger btn--sm" data-action="cancel" data-id="${a.id}">Cancelar</button></div>` :
          `<div class="row gap"><a class="btn btn--ghost btn--sm" href="#/agendar?doctor=${d.id}">Agendar novamente</a></div>`}</div>
    </article>`;
  }

  function viewAbout() {
    return `<section class="wrap section page">
      <header class="section__head"><h1>Sobre a MedClinic</h1><p>Tecnologia a serviço da saúde.</p></header>
      <div class="about card">
        <div><h2>Nossa missão</h2><p>Construir uma rede otimizada para o setor da <b>saúde</b>, entregando <b>software</b> que simplifica o acesso ao cuidado e devolve tempo às pessoas.</p></div>
        <div><h2>Nossa proposta</h2><p>Realizar a entrega de software que satisfaça nossos objetivos preestabelecidos: agendamento simples, transparente e acessível em qualquer tela.</p></div>
      </div>
      <header class="section__head"><h2>Equipe</h2></header>
      <div class="team">${TEAM.map(t => `<figure class="reveal"><img src="${t.photo}" alt="${esc(t.name)}" loading="lazy"><figcaption>${esc(t.name)}</figcaption></figure>`).join('')}</div>
      <div class="card support">
        <h2>Precisa de ajuda?</h2><p class="muted">Envie sua mensagem e responderemos em breve.</p>
        <form class="form form--grid" action="https://formspree.io/f/mvojevay" method="POST">
          <label class="field"><span>Nome</span><input name="Nome" required autocomplete="name"></label>
          <label class="field"><span>E-mail</span><input name="Email" type="email" required autocomplete="email"></label>
          <label class="field full"><span>Mensagem</span><textarea name="Mensagem" rows="4" required></textarea></label>
          <div class="full"><button class="btn btn--primary">Enviar mensagem</button></div>
        </form></div>
    </section>`;
  }

  /* ---------- Roteador ---------- */
  function route() {
    const [path, qs] = (location.hash.slice(1) || '/').split('?');
    const q = new URLSearchParams(qs || '');
    const name = path.replace('/', '') || 'home';
    if (name !== 'agendar' && (B.step === 5 || B.resched)) B = freshBooking();
    if (name === 'agendar') {
      if (B.step === 5 && !q.toString()) { /* mostra comprovante */ }
      else if (q.get('doctor') && docOf(q.get('doctor'))) {
        const d = docOf(q.get('doctor')); B = freshBooking(); B.clinic = d.clinic; B.doctor = d.id; B.step = 3;
        history.replaceState(null, '', '#/agendar');
      } else if (q.get('clinic') && clinicOf(q.get('clinic'))) {
        B = freshBooking(); B.clinic = q.get('clinic'); B.step = 2; history.replaceState(null, '', '#/agendar');
      }
    }
    const views = { home: viewHome, medicos: viewDoctors, agendar: viewBook, consultas: viewAppts, sobre: viewAbout };
    app.innerHTML = (views[name] || viewHome)();
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === (views[name] ? name : 'home')));
    document.title = 'MedClinic | ' + ({ home: 'Agendamento de consultas', medicos: 'Especialistas', agendar: 'Agendar', consultas: 'Minhas consultas', sobre: 'Sobre' }[name] || '');
    window.scrollTo({ top: 0 });
    observe();
  }
  const rerender = () => { const y = scrollY; route(); scrollTo({ top: y }); };
  addEventListener('hashchange', route);

  function observe() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    $$('.reveal', app).forEach(el => io.observe(el));
  }

  /* ---------- Ações ---------- */
  function submitBooking() {
    const f = $('#patientForm'), p = B.patient;
    p.name = $('#name', f).value.trim(); p.email = $('#email', f).value.trim();
    p.phone = $('#phone', f).value; p.cpf = $('#cpf', f).value; B.reason = $('#reason', f).value.trim();
    let bad = false;
    const chk = (id, ok, msg) => { setErr(f, id, ok ? '' : msg); if (!ok) bad = true; };
    chk('name', p.name.split(/\s+/).length >= 2, 'Informe nome e sobrenome.');
    chk('email', validEmail(p.email), 'E-mail inválido.');
    chk('phone', p.phone.replace(/\D/g, '').length >= 10, 'Telefone inválido.');
    chk('cpf', validCPF(p.cpf), 'CPF inválido.');
    const t = $('#terms', f); setErr(f, 'terms', t.checked ? '' : 'É necessário concordar para continuar.'); if (!t.checked) bad = true;
    if (bad) { $('.invalid', f)?.focus(); return; }

    // revalida disponibilidade (evita conflito)
    const d = docOf(B.doctor);
    const slot = Store.slots(d, B.date, B.resched).find(s => s.time === B.time);
    if (!slot || !slot.available) { toast('Esse horário acabou de ser ocupado. Escolha outro.', 'err'); B.time = null; B.step = 3; return rerender(); }

    Store.setUser({ name: p.name, email: p.email, phone: p.phone, cpf: p.cpf });
    renderUser();
    if (B.resched) {
      Store.update(B.resched, { date: B.date, time: B.time, patient: { ...p }, reason: B.reason });
      B.done = Store.all().find(a => a.id === B.resched);
    } else {
      B.done = Store.add({ id: Store.uid(), doctorId: d.id, date: B.date, time: B.time, patient: { ...p }, reason: B.reason, status: 'confirmed', createdAt: Date.now() });
    }
    B.step = 5; rerender(); toast('Agendamento confirmado!');
  }

  function downloadICS(a) {
    const d = docOf(a.doctorId), c = clinicOf(d.clinic);
    const st = a.date.replace(/-/g, '') + 'T' + a.time.replace(':', '') + '00';
    const [h, m] = a.time.split(':').map(Number), e = h * 60 + m + 30;
    const en = a.date.replace(/-/g, '') + 'T' + String(Math.floor(e / 60)).padStart(2, '0') + String(e % 60).padStart(2, '0') + '00';
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MedClinic//PT', 'BEGIN:VEVENT', `UID:${a.id}@medclinic`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTSTART:${st}`, `DTEND:${en}`,
      `SUMMARY:Consulta — ${d.name}`, `LOCATION:${c.name} — ${c.address}`, `DESCRIPTION:Código ${a.id}. Chegue 10 minutos antes.`,
      'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Consulta em 1 hora', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const l = document.createElement('a'); l.href = url; l.download = `consulta-${a.id}.ics`; l.click(); URL.revokeObjectURL(url);
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-action],[data-filter],#themeBtn,#userBtn');
    if (!t) return;
    if (t.id === 'themeBtn') { const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; Store.setTheme(n); return applyTheme(n); }
    if (t.id === 'userBtn') return userModal();
    if (t.dataset.filter) {
      $$('#docFilter .chip').forEach(c => c.classList.toggle('on', c === t));
      $$('#docGrid .doc').forEach(c => c.hidden = t.dataset.filter !== 'all' && c.dataset.clinic !== t.dataset.filter); return;
    }
    const id = t.dataset.id;
    switch (t.dataset.action) {
      case 'close-modal': return closeModal();
      case 'user': return userModal();
      case 'logout': Store.logout(); closeModal(); renderUser(); B = freshBooking(); toast('Você saiu da conta.'); return route();
      case 'pick-clinic': if (B.clinic !== id) { B.clinic = id; B.doctor = B.date = B.time = null; } B.step = 2; return rerender();
      case 'pick-doctor': if (B.doctor !== id) { B.doctor = id; B.date = B.time = null; } B.step = 3; return rerender();
      case 'pick-date': B.date = id; B.time = null; return rerender();
      case 'pick-time': B.time = id; return rerender();
      case 'back': if (B.step > 1) { B.step--; rerender(); } return;
      case 'next':
        if (B.step === 4) return submitBooking();
        B.step++; return rerender();
      case 'new': B = freshBooking(); location.hash = '#/agendar'; return route();
      case 'tab': tab = id; return rerender();
      case 'ics': return downloadICS(Store.all().find(a => a.id === id));
      case 'resched': {
        const a = Store.all().find(x => x.id === id), d = docOf(a.doctorId);
        B = freshBooking(); B.resched = id; B.clinic = d.clinic; B.doctor = d.id; B.patient = { ...a.patient }; B.reason = a.reason || ''; B.step = 3;
        location.hash = '#/agendar'; return route();
      }
      case 'cancel': {
        const a = Store.all().find(x => x.id === id), d = docOf(a.doctorId);
        return openModal(`<h2>Cancelar consulta?</h2><p class="muted">${esc(d.name)} · ${cap(fmtDate(a.date))} às ${a.time}</p>
          <div class="row gap"><button class="btn btn--danger" data-action="confirm-cancel" data-id="${id}">Sim, cancelar</button>
          <button class="btn btn--ghost" data-action="close-modal">Manter</button></div>`);
      }
      case 'confirm-cancel': Store.update(id, { status: 'cancelled' }); closeModal(); toast('Consulta cancelada.'); return rerender();
    }
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'phone') e.target.value = maskPhone(e.target.value);
    if (e.target.id === 'cpf') e.target.value = maskCPF(e.target.value);
    if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'loginForm') {
      e.preventDefault(); const f = e.target, n = $('#name', f).value.trim(), m = $('#email', f).value.trim();
      setErr(f, 'name', n.length > 2 ? '' : 'Informe seu nome.'); setErr(f, 'email', validEmail(m) ? '' : 'E-mail inválido.');
      if (n.length < 3 || !validEmail(m)) return;
      const old = Store.getUser(); Store.setUser({ ...(old || {}), name: n, email: m });
      closeModal(); renderUser(); B = freshBooking(); toast('Bem-vindo, ' + n.split(' ')[0] + '!'); route();
    }
    if (e.target.id === 'patientForm') { e.preventDefault(); submitBooking(); }
  });

  $('#year').textContent = new Date().getFullYear();
  const hdr = $('#topbar'); addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 8), { passive: true });
  renderUser(); route();
})();
