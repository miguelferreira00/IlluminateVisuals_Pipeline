export type UserRole = 'CALLER' | 'ADMIN' | 'PARTNER';
export type ContactoEstado = 'NOVO' | 'EM_CONTACTO' | 'FOLLOW_UP' | 'REUNIAO_AGENDADA' | 'CLIENTE' | 'PERDIDO';
export type Setor = 'TELECOMUNICACOES' | 'ENERGIA' | 'RETALHO' | 'BANCA' | 'SEGUROS' | 'SAUDE' | 'TECNOLOGIA' | 'OUTRO';
export type CallResultado = 'NAO_ATENDEU' | 'RECUSOU' | 'INTERESSADO' | 'LIGACAO_AGENDADA' | 'REUNIAO_MARCADA' | 'SEM_INTERESSE';
export type CallProximoPasso = 'NENHUM' | 'FOLLOW_UP_CALL' | 'ENVIAR_EMAIL' | 'REUNIAO_MARCADA' | 'PROPOSTA_ENVIADA';
export type ReuniaoEstado = 'AGENDADA' | 'REALIZADA' | 'CANCELADA';

export interface CurrentUser {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

export interface UserResumo {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  username: string | null;
  ativo: boolean;
}

export interface Contacto {
  id: number;
  empresa: string;
  setor: Setor;
  nomeDecisor: string;
  cargo: string;
  telefone: string;
  email: string;
  linkedinUrl: string;
  estado: ContactoEstado;
  scorePotencial: number;
  notas: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ContactoResumo {
  id: number;
  empresa: string;
  setor: Setor;
  nomeDecisor: string;
  cargo: string;
  telefone: string;
  estado: ContactoEstado;
  scorePotencial: number;
  atualizadoEm: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Call {
  id: number;
  contacto: ContactoResumo;
  callerUser: CurrentUser;
  dataCall: string;
  resultado: CallResultado;
  proximoPasso: CallProximoPasso;
  dataFollowUp: string | null;
  notas: string;
  criadoEm: string;
}

export interface CallRequest {
  contactoId: number;
  dataCall: string;
  resultado: CallResultado;
  proximoPasso: CallProximoPasso;
  dataFollowUp?: string;
  notas?: string;
}

export interface ContactoRequest {
  empresa: string;
  setor: Setor;
  nomeDecisor: string;
  cargo: string;
  telefone: string;
  email: string;
  linkedinUrl: string;
  estado?: ContactoEstado;
  scorePotencial: number;
  notas?: string;
}

export interface Reuniao {
  id: number;
  contacto: ContactoResumo;
  googleEventId: string | null;
  dataReuniao: string;
  duracaoMinutos: number;
  responsavel: CurrentUser | null;
  criadoPor: CurrentUser | null;
  estado: ReuniaoEstado;
  notas: string;
  criadoEm: string;
}

export interface ReuniaoRequest {
  contactoId: number;
  dataReuniao: string;
  duracaoMinutos?: number;
  responsavelUserId?: number;
  notas?: string;
}

export interface SlotDisponivel {
  inicio: string;
  fim: string;
  livre: boolean;
}

export interface DashboardKpis {
  totalContactos: number;
  reunioesSemanaAtual: number;
  reunioesTotal: number;
  taxaConversao: number;
  followUpsPendentesVencidos: number;
  followUpsSemanaAtual: number;
  contactosPorEstado: Record<string, number>;
  topSetores: { setor: string; scoreMedio: number }[];
}

export interface CallsPorDia {
  data: string;
  total: number;
}

export const ESTADO_LABELS: Record<ContactoEstado, string> = {
  NOVO: 'Novo', EM_CONTACTO: 'Em Contacto', FOLLOW_UP: 'Follow-up',
  REUNIAO_AGENDADA: 'Reunião Agendada', CLIENTE: 'Cliente', PERDIDO: 'Perdido'
};

export const ESTADO_COLORS: Record<ContactoEstado, { bg: string; t: string; d: string }> = {
  NOVO:             { bg: '#EEF2FF', t: '#4F46E5', d: '#4F46E5' },
  EM_CONTACTO:      { bg: '#FFFBEB', t: '#B45309', d: '#D97706' },
  FOLLOW_UP:        { bg: '#FFF7ED', t: '#C2410C', d: '#EA580C' },
  REUNIAO_AGENDADA: { bg: '#F3E8FF', t: '#7E22CE', d: '#9333EA' },
  CLIENTE:          { bg: '#ECFDF5', t: '#047857', d: '#059669' },
  PERDIDO:          { bg: '#F3F4F6', t: '#6B7280', d: '#9CA3AF' },
};

export const SETOR_LABELS: Record<Setor, string> = {
  TELECOMUNICACOES: 'Telecoms', ENERGIA: 'Energia', RETALHO: 'Retalho',
  BANCA: 'Banca', SEGUROS: 'Seguros', SAUDE: 'Saúde',
  TECNOLOGIA: 'Tecnologia', OUTRO: 'Outro'
};

export const RESULTADO_LABELS: Record<CallResultado, string> = {
  NAO_ATENDEU: 'Não atendeu', RECUSOU: 'Recusou', INTERESSADO: 'Interessado',
  LIGACAO_AGENDADA: 'Ligação agendada', REUNIAO_MARCADA: 'Reunião marcada', SEM_INTERESSE: 'Sem interesse'
};

export const RESULTADO_COLORS: Record<CallResultado, { bg: string; t: string }> = {
  NAO_ATENDEU:      { bg: '#F3F4F6', t: '#6B7280' },
  RECUSOU:          { bg: '#FEF2F2', t: '#DC2626' },
  INTERESSADO:      { bg: '#ECFDF5', t: '#059669' },
  LIGACAO_AGENDADA: { bg: '#EFF6FF', t: '#2563EB' },
  REUNIAO_MARCADA:  { bg: '#F3E8FF', t: '#7E22CE' },
  SEM_INTERESSE:    { bg: '#FEF2F2', t: '#DC2626' },
};

export const PROXIMO_PASSO_LABELS: Record<CallProximoPasso, string> = {
  NENHUM: 'Nenhum', FOLLOW_UP_CALL: 'Follow-up call', ENVIAR_EMAIL: 'Enviar email',
  REUNIAO_MARCADA: 'Reunião marcada', PROPOSTA_ENVIADA: 'Proposta enviada'
};

export const AVATAR_COLORS = ['#4F46E5','#7E22CE','#0891B2','#059669','#D97706','#C2410C'];

export const RESULTADO_TO_ESTADO: Partial<Record<CallResultado, ContactoEstado>> = {
  REUNIAO_MARCADA:  'REUNIAO_AGENDADA',
  INTERESSADO:      'FOLLOW_UP',
  LIGACAO_AGENDADA: 'FOLLOW_UP',
  SEM_INTERESSE:    'PERDIDO',
  NAO_ATENDEU:      'EM_CONTACTO',
  RECUSOU:          'EM_CONTACTO',
};

export function enumOptions<K extends string>(map: Record<K, string>): { k: K; v: string }[] {
  return (Object.entries(map) as [K, string][]).map(([k, v]) => ({ k, v }));
}
