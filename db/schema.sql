-- =============================================================
-- CRM Illuminate Visuals — Schema MySQL 8
-- =============================================================

CREATE DATABASE IF NOT EXISTS crm_agencia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crm_agencia;

-- -------------------------------------------------------------
-- Utilizadores
-- -------------------------------------------------------------
CREATE TABLE users (
  id                    BIGINT          AUTO_INCREMENT PRIMARY KEY,
  nome                  VARCHAR(100)    NOT NULL,
  email                 VARCHAR(150)    NOT NULL UNIQUE,
  username              VARCHAR(50)     NULL UNIQUE,
  password_hash         VARCHAR(255)    NULL,
  role                  ENUM('CALLER','PARTNER','ADMIN') NOT NULL DEFAULT 'CALLER',
  google_calendar_token TEXT,
  ativo                 BOOLEAN         NOT NULL DEFAULT TRUE,
  criado_em             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Contactos (pipeline CRM)
-- -------------------------------------------------------------
CREATE TABLE contactos (
  id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
  empresa          VARCHAR(200) NOT NULL,
  setor            ENUM(
                     'TELECOMUNICACOES',
                     'ENERGIA',
                     'RETALHO',
                     'BANCA',
                     'SEGUROS',
                     'SAUDE',
                     'TECNOLOGIA',
                     'OUTRO'
                   )            NOT NULL DEFAULT 'OUTRO',
  nome_decisor     VARCHAR(150),
  cargo            VARCHAR(100),
  telefone         VARCHAR(30),
  email            VARCHAR(150),
  linkedin_url     VARCHAR(300),
  estado           ENUM(
                     'NOVO',
                     'EM_CONTACTO',
                     'FOLLOW_UP',
                     'REUNIAO_AGENDADA',
                     'CLIENTE',
                     'PERDIDO'
                   )            NOT NULL DEFAULT 'NOVO',
  score_potencial  INT          NOT NULL DEFAULT 5
                               CHECK (score_potencial BETWEEN 1 AND 10),
  notas            TEXT,
  criado_em        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_estado        (estado),
  INDEX idx_setor         (setor),
  INDEX idx_atualizado_em (atualizado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Histórico de Cold Calls
-- -------------------------------------------------------------
CREATE TABLE calls (
  id               BIGINT      AUTO_INCREMENT PRIMARY KEY,
  contacto_id      BIGINT      NOT NULL,
  caller_user_id   BIGINT      NOT NULL,
  data_call        DATETIME    NOT NULL,
  resultado        ENUM(
                     'NAO_ATENDEU',
                     'RECUSOU',
                     'INTERESSADO',
                     'LIGACAO_AGENDADA',
                     'REUNIAO_MARCADA',
                     'SEM_INTERESSE'
                   )           NOT NULL,
  proximo_passo    ENUM(
                     'NENHUM',
                     'FOLLOW_UP_CALL',
                     'ENVIAR_EMAIL',
                     'REUNIAO_MARCADA',
                     'PROPOSTA_ENVIADA'
                   )           NOT NULL DEFAULT 'NENHUM',
  data_follow_up   DATE,
  notas            TEXT,
  criado_em        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_calls_contacto  FOREIGN KEY (contacto_id)    REFERENCES contactos(id) ON DELETE RESTRICT,
  CONSTRAINT fk_calls_caller    FOREIGN KEY (caller_user_id) REFERENCES users(id)     ON DELETE RESTRICT,

  INDEX idx_contacto_id    (contacto_id),
  INDEX idx_data_call      (data_call),
  INDEX idx_data_follow_up (data_follow_up)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Reuniões
-- -------------------------------------------------------------
CREATE TABLE reunioes (
  id                   BIGINT       AUTO_INCREMENT PRIMARY KEY,
  contacto_id          BIGINT       NOT NULL,
  google_event_id      VARCHAR(200),
  data_reuniao         DATETIME     NOT NULL,
  duracao_minutos      INT          NOT NULL DEFAULT 30,
  responsavel_user_id  BIGINT,
  estado               ENUM('AGENDADA','REALIZADA','CANCELADA') NOT NULL DEFAULT 'AGENDADA',
  notas                TEXT,
  criado_em            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_reunioes_contacto     FOREIGN KEY (contacto_id)         REFERENCES contactos(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reunioes_responsavel  FOREIGN KEY (responsavel_user_id) REFERENCES users(id)     ON DELETE SET NULL,

  INDEX idx_data_reuniao (data_reuniao),
  INDEX idx_estado       (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
