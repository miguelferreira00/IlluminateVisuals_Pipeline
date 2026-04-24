-- =============================================================
-- CRM Agência Audiovisual — Seed de dados de teste
-- =============================================================

USE crm_agencia;

-- -------------------------------------------------------------
-- Utilizadores
-- Nota: google_calendar_token é preenchido após login OAuth2,
--       portanto fica NULL no seed.
-- -------------------------------------------------------------
INSERT INTO users (nome, email, role) VALUES
  ('Miguel Admin',    'admin@agencia.pt',   'ADMIN'),
  ('Ana Parceira',    'ana@agencia.pt',     'PARTNER'),
  ('Rui Caller',      'rui@agencia.pt',     'CALLER');

-- -------------------------------------------------------------
-- Contactos (15 registos com mix de estados, setores e scores)
-- -------------------------------------------------------------
INSERT INTO contactos (empresa, setor, nome_decisor, cargo, telefone, email, linkedin_url, estado, score_potencial, notas) VALUES
  ('NOS Comunicações',      'TELECOMUNICACOES', 'Pedro Carvalho',    'Diretor de Marketing',     '+351 910 000 001', 'p.carvalho@nos.pt',        'https://linkedin.com/in/pedro-carvalho',    'EM_CONTACTO',      9,  'Mostrou interesse em produção de vídeo institucional.'),
  ('EDP Renováveis',        'ENERGIA',          'Sofia Monteiro',    'Head of Brand',            '+351 910 000 002', 's.monteiro@edp.pt',        'https://linkedin.com/in/sofia-monteiro',    'FOLLOW_UP',        8,  'Follow-up agendado após envio de proposta.'),
  ('Continente / Sonae',    'RETALHO',          'João Ferreira',     'Marketing Manager',        '+351 910 000 003', 'j.ferreira@sonae.pt',      'https://linkedin.com/in/joao-ferreira',     'REUNIAO_AGENDADA', 10, 'Reunião marcada para apresentação de portfólio.'),
  ('Millennium BCP',        'BANCA',            'Carla Nunes',       'Diretora de Comunicação',  '+351 910 000 004', 'c.nunes@bcp.pt',           'https://linkedin.com/in/carla-nunes',       'NOVO',             7,  NULL),
  ('Fidelidade Seguros',    'SEGUROS',          'António Lopes',     'CMO',                      '+351 910 000 005', 'a.lopes@fidelidade.pt',    'https://linkedin.com/in/antonio-lopes',     'EM_CONTACTO',      6,  'Ligou de volta após primeira call.'),
  ('Luz Saúde',             'SAUDE',            'Mariana Costa',     'Responsável de Marketing', '+351 910 000 006', 'm.costa@luzsaude.pt',      'https://linkedin.com/in/mariana-costa',     'PERDIDO',          3,  'Orçamento cortado este ano.'),
  ('Altice Portugal',       'TELECOMUNICACOES', 'Ricardo Pinto',     'Brand Manager',            '+351 910 000 007', 'r.pinto@altice.pt',        'https://linkedin.com/in/ricardo-pinto',     'FOLLOW_UP',        8,  'Precisa de aprovação interna antes de avançar.'),
  ('Jerónimo Martins',      'RETALHO',          'Inês Rodrigues',    'Digital Marketing Lead',   '+351 910 000 008', 'i.rodrigues@jm.pt',        'https://linkedin.com/in/ines-rodrigues',    'NOVO',             9,  NULL),
  ('Galp Energia',          'ENERGIA',          'Bruno Alves',       'Marketing Director',       '+351 910 000 009', 'b.alves@galp.pt',          'https://linkedin.com/in/bruno-alves',       'EM_CONTACTO',      7,  'Interessado em reportagem fotográfica de eventos.'),
  ('Santander Portugal',    'BANCA',            'Cláudia Sousa',     'Head of Marketing',        '+351 910 000 010', 'c.sousa@santander.pt',     'https://linkedin.com/in/claudia-sousa',     'NOVO',             6,  NULL),
  ('Vodafone Portugal',     'TELECOMUNICACOES', 'Tiago Mendes',      'Content Strategy Manager', '+351 910 000 011', 't.mendes@vodafone.pt',     'https://linkedin.com/in/tiago-mendes',      'CLIENTE',          10, 'Cliente ativo — campanha de verão em curso.'),
  ('Worten',                'RETALHO',          'Filipa Gomes',      'Marketing Manager',        '+351 910 000 012', 'f.gomes@worten.pt',        'https://linkedin.com/in/filipa-gomes',      'PERDIDO',          4,  'Preferem agência com foco em digital.'),
  ('Cofidis',               'SEGUROS',          'Marco Baptista',    'Diretor de Marca',         '+351 910 000 013', 'm.baptista@cofidis.pt',    'https://linkedin.com/in/marco-baptista',    'FOLLOW_UP',        7,  'Ligação de follow-up na próxima segunda-feira.'),
  ('OutSystems',            'TECNOLOGIA',       'Sara Vieira',       'Head of Events & Brand',   '+351 910 000 014', 's.vieira@outsystems.com',  'https://linkedin.com/in/sara-vieira',       'REUNIAO_AGENDADA', 9,  'Querem vídeo para evento global em Lisboa.'),
  ('Novo Banco',            'BANCA',            'Luís Dias',         'Marketing Digital',        '+351 910 000 015', 'l.dias@novobanco.pt',      'https://linkedin.com/in/luis-dias',         'NOVO',             5,  NULL);

-- -------------------------------------------------------------
-- Calls (associadas a alguns contactos)
-- caller_user_id = 3 (Rui Caller)
-- -------------------------------------------------------------
INSERT INTO calls (contacto_id, caller_user_id, data_call, resultado, proximo_passo, data_follow_up, notas) VALUES
  -- NOS: primeiro contacto positivo
  (1, 3, '2026-04-14 10:00:00', 'INTERESSADO',       'ENVIAR_EMAIL',    '2026-04-21', 'Pediu portfólio por email. Enviar ainda hoje.'),
  -- NOS: follow-up após email
  (1, 3, '2026-04-21 15:30:00', 'LIGACAO_AGENDADA',  'FOLLOW_UP_CALL',  '2026-04-28', 'Gostou do portfólio. Quer falar com a equipa de criatividade.'),
  -- EDP: primeira call
  (2, 3, '2026-04-10 09:00:00', 'INTERESSADO',       'PROPOSTA_ENVIADA', NULL,        'Aberta à proposta. Proposta enviada a 12/04.'),
  -- Continente: call que resultou em reunião
  (3, 3, '2026-04-16 11:00:00', 'REUNIAO_MARCADA',   'REUNIAO_MARCADA',  NULL,        'Decisor muito entusiasmado. Reunião marcada de imediato.'),
  -- Fidelidade: duas tentativas + sucesso
  (5, 3, '2026-04-08 14:00:00', 'NAO_ATENDEU',       'FOLLOW_UP_CALL',  '2026-04-11', NULL),
  (5, 3, '2026-04-11 10:30:00', 'INTERESSADO',       'FOLLOW_UP_CALL',  '2026-04-18', 'Atendeu. Demonstrou interesse. Pedir aprovação ao diretor.'),
  -- Luz Saúde: call sem sucesso
  (6, 3, '2026-04-09 16:00:00', 'RECUSOU',           'NENHUM',           NULL,        'Orçamento para marketing audiovisual cortado até fim do ano.'),
  -- Altice: interesse mas pendente aprovação
  (7, 3, '2026-04-15 09:30:00', 'INTERESSADO',       'FOLLOW_UP_CALL',  '2026-04-25', 'Precisa de aprovação do diretor geral. Ligar daqui a 10 dias.'),
  -- Galp: primeira call
  (9, 3, '2026-04-17 11:00:00', 'INTERESSADO',       'ENVIAR_EMAIL',    '2026-04-24', 'Quer receber proposta para cobertura fotográfica de eventos internos.'),
  -- OutSystems: call que resultou em reunião
  (14, 3, '2026-04-18 14:00:00', 'REUNIAO_MARCADA',  'REUNIAO_MARCADA',  NULL,        'Evento global em outubro. Querem parceiro exclusivo para vídeo e foto.');

-- -------------------------------------------------------------
-- Reuniões (as duas que resultaram de calls)
-- responsavel_user_id = 1 (Admin / Sócio A) e 2 (Ana / Sócia B)
-- -------------------------------------------------------------
INSERT INTO reunioes (contacto_id, google_event_id, data_reuniao, duracao_minutos, responsavel_user_id, estado, notas) VALUES
  (3,  NULL, '2026-04-29 10:00:00', 60, 1, 'AGENDADA',  'Apresentação de portfólio e cases relevantes para retalho.'),
  (14, NULL, '2026-04-30 15:00:00', 60, 2, 'AGENDADA',  'Briefing para cobertura do evento global OutSystems Summit Lisboa.');
