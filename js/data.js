/* Catálogo de clínicas e especialistas */
window.CLINICS = [
  { id: 'vitalis', name: 'Médica Vitalis', specialty: 'Clínica Geral', emoji: '🩺', color: '#0f766e',
    desc: 'Check-ups, diagnóstico e acompanhamento contínuo da sua saúde.', address: 'Av. Dom Luís, 1200 · Aldeota, Fortaleza - CE' },
  { id: 'sorriso', name: 'Odontológica Sorriso Saudável', specialty: 'Odontologia', emoji: '🦷', color: '#2563eb',
    desc: 'Limpeza, ortodontia, estética dental e tratamentos preventivos.', address: 'Av. Desembargador Moreira, 850 · Meireles, Fortaleza - CE' },
  { id: 'nutrivida', name: 'Nutrição NutriVida', specialty: 'Nutrição', emoji: '🥗', color: '#65a30d',
    desc: 'Planos alimentares personalizados para seus objetivos.', address: 'R. Silva Jatahy, 430 · Meireles, Fortaleza - CE' },
  { id: 'visao', name: 'Oftalmologia Visão Clara', specialty: 'Oftalmologia', emoji: '👁️', color: '#9333ea',
    desc: 'Exames de vista, lentes de contato e saúde ocular completa.', address: 'Av. Santos Dumont, 95 · Aldeota, Fortaleza - CE' }
];

/* days: 0=Dom … 6=Sáb · start/end em "HH:MM" */
window.DOCTORS = [
  { id: 'd1', clinic: 'vitalis', name: 'Dr. Benjamin Hartman', role: 'Clínico Geral', crm: 'CRM 123456-CE', rating: 4.9, years: 14,
    bio: 'Especialista em medicina preventiva, com foco em check-ups completos e qualidade de vida.',
    days: [1, 2, 3, 4, 5], start: '08:00', end: '17:00', price: 220 },
  { id: 'd2', clinic: 'vitalis', name: 'Dra. Camila Duarte', role: 'Clínica Geral · Geriatria', crm: 'CRM 234567-CE', rating: 4.8, years: 9,
    bio: 'Atendimento humanizado com atenção especial à saúde do idoso e doenças crônicas.',
    days: [1, 3, 5, 6], start: '09:00', end: '15:00', price: 240 },
  { id: 'd3', clinic: 'sorriso', name: 'Dra. Sophia Ramirez', role: 'Ortodontista', crm: 'CRO 45678-CE', rating: 5.0, years: 12,
    bio: 'Aparelhos fixos e alinhadores invisíveis, com planejamento digital do sorriso.',
    days: [2, 3, 4, 5], start: '09:00', end: '18:00', price: 280 },
  { id: 'd4', clinic: 'sorriso', name: 'Dr. Rafael Moreira', role: 'Dentista · Estética', crm: 'CRO 56789-CE', rating: 4.7, years: 7,
    bio: 'Clareamento, facetas e harmonização orofacial com técnicas minimamente invasivas.',
    days: [1, 2, 4, 6], start: '08:00', end: '16:00', price: 260 },
  { id: 'd5', clinic: 'nutrivida', name: 'Dr. Alexander Anderson', role: 'Nutricionista Esportivo', crm: 'CRN 7890-CE', rating: 4.9, years: 10,
    bio: 'Performance, hipertrofia e emagrecimento saudável com acompanhamento próximo.',
    days: [1, 2, 3, 4], start: '08:00', end: '17:00', price: 190 },
  { id: 'd6', clinic: 'nutrivida', name: 'Dra. Larissa Prado', role: 'Nutrição Clínica', crm: 'CRN 8901-CE', rating: 4.8, years: 6,
    bio: 'Reeducação alimentar, nutrição funcional e acompanhamento de patologias.',
    days: [2, 3, 5, 6], start: '09:00', end: '16:00', price: 180 },
  { id: 'd7', clinic: 'visao', name: 'Dra. Isabella Chang', role: 'Oftalmologista', crm: 'CRM 345678-CE', rating: 4.9, years: 15,
    bio: 'Cirurgia refrativa, catarata e prevenção de doenças da retina.',
    days: [1, 2, 3, 4, 5], start: '08:00', end: '17:00', price: 300 },
  { id: 'd8', clinic: 'visao', name: 'Dr. Thiago Nakamura', role: 'Oftalmologista Pediátrico', crm: 'CRM 456789-CE', rating: 4.8, years: 8,
    bio: 'Cuidado da visão infantil, estrabismo e ambliopia com atendimento lúdico.',
    days: [3, 4, 5, 6], start: '09:00', end: '15:00', price: 290 }
];

window.TEAM = [
  { name: 'Felipe', photo: 'img/felipe.jpg' },
  { name: 'Giselly', photo: 'img/giselly.jpg' },
  { name: 'Kaio', photo: 'img/kaio.jpg' },
  { name: 'Maciel', photo: 'img/maciel.jpg' },
  { name: 'Venécio', photo: 'img/venecio.jpg' }
];

