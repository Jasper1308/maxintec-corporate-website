'use client';

import { Pencil, Plus, RefreshCw, Search, Send, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { Modal } from '@/components/portal/Modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/portal/PortalStates';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { errorMessage, formatDate, formatDateTime } from '@/lib/format';

import { inviteManager, revokeManagerInvitation, saveCondominiumBlock, searchManagerCandidates, setCondominiumBlockActive, setManagerMembership } from '../actions';
import { getCondominiumDetails } from '../queries';
import type { CondominiumBlock, CondominiumDetails, CondominiumInvitation, CondominiumListItem, CondominiumManager, ProfileSearchResult } from '../types';
import { formatCnpj, formatPhone, formatPostalCode } from '../validation';

type Confirmation =
  | { kind: 'block'; block: CondominiumBlock; active: boolean }
  | { kind: 'manager'; manager: CondominiumManager; status: 'approved' | 'suspended' }
  | { kind: 'candidate'; candidate: ProfileSearchResult }
  | { kind: 'invitation'; invitation: CondominiumInvitation };

function displayAddress(item: CondominiumListItem): string {
  const line = [item.street, item.number].filter(Boolean).join(', ');
  const locality = [item.neighborhood, item.city, item.state].filter(Boolean).join(' · ');
  return [line, item.complement, locality, item.postal_code ? `CEP ${formatPostalCode(item.postal_code)}` : ''].filter(Boolean).join(' — ') || 'Não informado';
}

export function CondominiumDetailsModal({ condominium, onClose }: { condominium: CondominiumListItem; onClose: () => void }) {
  const [details, setDetails] = useState<CondominiumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [blockId, setBlockId] = useState<string | null>(null);
  const [blockName, setBlockName] = useState('');
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<ProfileSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setDetails(await getCondominiumDetails(condominium.id)); }
    catch (reason) {
      console.error('Failed to load condominium details:', reason);
      setError('Não foi possível carregar a central deste condomínio.');
    } finally { setLoading(false); }
  }, [condominium.id]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true); setError(null); setNotice(null);
    try { await action(); setNotice(success); await load(); setConfirmation(null); }
    catch (reason) {
      console.error('Failed condominium operation:', reason);
      setError(errorMessage(reason, 'Não foi possível concluir a ação. Tente novamente.'));
    } finally { setBusy(false); }
  }

  async function submitBlock(event: FormEvent) {
    event.preventDefault();
    await run(() => saveCondominiumBlock(condominium.id, blockId, blockName), blockId ? 'Bloco atualizado.' : 'Bloco adicionado.');
    setBlockId(null); setBlockName('');
  }

  async function findCandidates(event: FormEvent) {
    event.preventDefault(); setSearching(true); setError(null);
    try { setCandidates(await searchManagerCandidates(condominium.id, search)); }
    catch (reason) { console.error('Failed to search profiles:', reason); setError('Não foi possível buscar usuários agora.'); }
    finally { setSearching(false); }
  }

  async function submitInvite(event: FormEvent) {
    event.preventDefault();
    await run(() => inviteManager({ condominiumId: condominium.id, email: inviteEmail }), 'Convite enviado.');
    setInviteEmail('');
  }

  async function confirmAction() {
    if (!confirmation) return;
    if (confirmation.kind === 'block') return run(() => setCondominiumBlockActive(confirmation.block.id, confirmation.active), confirmation.active ? 'Bloco reativado.' : 'Bloco desativado.');
    if (confirmation.kind === 'manager') return run(() => setManagerMembership(confirmation.manager.userId, condominium.id, confirmation.status), confirmation.status === 'approved' ? 'Acesso do gestor reativado.' : 'Acesso do gestor suspenso.');
    if (confirmation.kind === 'candidate') return run(() => setManagerMembership(confirmation.candidate.id, condominium.id, 'approved'), 'Gestor associado ao condomínio.');
    return run(() => revokeManagerInvitation(confirmation.invitation.id), 'Convite revogado.');
  }

  function confirmationText() {
    if (!confirmation) return '';
    if (confirmation.kind === 'block') return confirmation.active ? `Reativar “${confirmation.block.name}”?` : `Desativar “${confirmation.block.name}”? Os dados anteriores serão preservados.`;
    if (confirmation.kind === 'manager') return confirmation.status === 'approved' ? 'Reativar o acesso deste gestor?' : 'Suspender o acesso deste gestor? O histórico será preservado.';
    if (confirmation.kind === 'candidate') return `Associar ${confirmation.candidate.full_name ?? confirmation.candidate.email ?? 'este usuário'} como gestor?`;
    return `Revogar o convite enviado para ${confirmation.invitation.email}?`;
  }

  return (
    <Modal open size="wide" title={`Central — ${condominium.name}`} onClose={() => { if (confirmation) { if (!busy) setConfirmation(null); } else if (!busy) onClose(); }}>
      <div className="space-y-8">
        {notice && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}
        {error && <ErrorState message={error} retry={() => void load()} />}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-white">Visão geral</h3><StatusBadge value={condominium.active ? 'active' : 'inactive'} label={condominium.active ? 'Ativo' : 'Inativo'} /></div>
          {loading ? <LoadingState /> : details && <div className="grid gap-3 sm:grid-cols-4">{[
            ['Moradores', details.approvedResidents], ['Pendências', details.pendingRegistrations], ['Chamados', details.tickets], ['Gestores ativos', details.managers.filter(item => item.status === 'approved').length],
          ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 bg-slate-950/50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>)}</div>}
        </section>

        <section className="rounded-xl border border-white/10 p-5">
          <h3 className="font-semibold text-white">Dados gerais</h3>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-slate-500">CNPJ</dt><dd className="mt-1 text-slate-200">{condominium.cnpj ? formatCnpj(condominium.cnpj) : 'Não informado'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-slate-500">Endereço</dt><dd className="mt-1 text-slate-200">{displayAddress(condominium)}</dd></div>
            <div><dt className="text-slate-500">Telefone</dt><dd className="mt-1 text-slate-200">{condominium.phone ? formatPhone(condominium.phone) : 'Não informado'}</dd></div>
            <div><dt className="text-slate-500">E-mail administrativo</dt><dd className="mt-1 text-slate-200">{condominium.admin_email ?? 'Não informado'}</dd></div>
            <div><dt className="text-slate-500">Código ERP</dt><dd className="mt-1 text-slate-200">{condominium.legacy_code ?? 'Não informado'}</dd></div>
          </dl>
          {condominium.internal_notes && <p className="mt-4 rounded-lg bg-slate-950/50 p-3 text-sm text-slate-300">{condominium.internal_notes}</p>}
        </section>

        {!loading && details && <>
          <section className="rounded-xl border border-white/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-white">Blocos e torres</h3></div>
            <form onSubmit={submitBlock} className="mt-4 flex flex-wrap gap-3"><input value={blockName} onChange={event => setBlockName(event.target.value)} className="portal-field min-w-56 flex-1" placeholder="Nome do bloco ou torre" /><button disabled={busy || !blockName.trim()} className="portal-button portal-button-primary"><Plus className="h-4 w-4" />{blockId ? 'Salvar' : 'Adicionar'}</button>{blockId && <button type="button" onClick={() => { setBlockId(null); setBlockName(''); }} className="portal-button portal-button-secondary">Cancelar</button>}</form>
            {details.blocks.length === 0 ? <div className="mt-4"><EmptyState title="Nenhum bloco cadastrado." /></div> : <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10">{details.blocks.map(block => <li key={block.id} className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="flex items-center gap-3"><span className="font-medium text-white">{block.name}</span><StatusBadge value={block.active ? 'active' : 'inactive'} label={block.active ? 'Ativo' : 'Inativo'} /></div><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => { setBlockId(block.id); setBlockName(block.name); }} className="portal-button portal-button-secondary min-h-9 px-3"><Pencil className="h-3.5 w-3.5" />Editar</button><button type="button" disabled={busy} onClick={() => setConfirmation({ kind: 'block', block, active: !block.active })} className="portal-button portal-button-secondary min-h-9 px-3">{block.active ? 'Desativar' : 'Reativar'}</button></div></li>)}</ul>}
          </section>

          <section className="rounded-xl border border-white/10 p-5">
            <h3 className="font-semibold text-white">Gestores</h3>
            {details.managers.length === 0 ? <div className="mt-4"><EmptyState title="Nenhum gestor associado." /></div> : <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10">{details.managers.map(manager => <li key={manager.membershipId} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium text-white">{manager.fullName ?? manager.email ?? 'Perfil sem nome'}</p>{manager.fullName && manager.email && <p className="mt-1 text-xs text-slate-500">{manager.email}</p>}<p className="mt-1 text-xs text-slate-500">Acesso liberado em {formatDate(manager.approvedAt)}</p></div><div className="flex items-center gap-2"><StatusBadge value={manager.status} label={manager.status === 'approved' ? 'Ativo' : manager.status === 'suspended' ? 'Suspenso' : 'Pendente'} /><button type="button" disabled={busy} onClick={() => setConfirmation({ kind: 'manager', manager, status: manager.status === 'approved' ? 'suspended' : 'approved' })} className="portal-button portal-button-secondary min-h-9 px-3">{manager.status === 'approved' ? 'Suspender' : 'Reativar'}</button></div></li>)}</ul>}

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl bg-slate-950/40 p-4"><h4 className="font-medium text-white">Adicionar gestor existente</h4><form onSubmit={findCandidates} className="mt-3 flex gap-2"><input value={search} onChange={event => setSearch(event.target.value)} className="portal-field" placeholder="Nome ou e-mail" /><button disabled={searching} className="portal-button portal-button-secondary"><Search className="h-4 w-4" />Buscar</button></form>{candidates.length > 0 && <ul className="mt-3 space-y-2">{candidates.map(candidate => <li key={candidate.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{candidate.full_name ?? candidate.email}</p><p className="truncate text-xs text-slate-500">{candidate.email}</p></div><button type="button" disabled={candidate.membership_status === 'approved'} onClick={() => setConfirmation({ kind: 'candidate', candidate })} className="portal-button portal-button-secondary min-h-9 px-3"><UserPlus className="h-3.5 w-3.5" />{candidate.membership_status === 'approved' ? 'Já associado' : 'Selecionar'}</button></li>)}</ul>}</div>
              <div className="rounded-xl bg-slate-950/40 p-4"><h4 className="font-medium text-white">Convidar novo gestor</h4><p className="mt-1 text-xs text-slate-500">O convite será enviado pelo sistema de autenticação do portal.</p><form onSubmit={submitInvite} className="mt-3 flex gap-2"><input required type="email" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} className="portal-field" placeholder="gestor@exemplo.com" /><button disabled={busy} className="portal-button portal-button-primary"><Send className="h-4 w-4" />Convidar</button></form></div>
            </div>

            <h4 className="mt-6 font-medium text-white">Convites</h4>
            {details.invitations.length === 0 ? <p className="mt-3 text-sm text-slate-500">Nenhum convite enviado.</p> : <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10">{details.invitations.map(invitation => <li key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 p-3"><div><p className="text-sm text-white">{invitation.email}</p><p className="mt-1 text-xs text-slate-500">Enviado em {formatDateTime(invitation.created_at)} · expira em {formatDate(invitation.expires_at)}</p></div><div className="flex items-center gap-2"><StatusBadge value={invitation.status} label={{ pending: 'Pendente', accepted: 'Aceito', revoked: 'Revogado', expired: 'Expirado' }[invitation.status]} />{(invitation.status === 'pending' || invitation.status === 'expired') && <button type="button" disabled={busy} onClick={() => void run(() => inviteManager({ invitationId: invitation.id }), 'Convite reenviado.')} className="portal-button portal-button-secondary min-h-9 px-3"><RefreshCw className="h-3.5 w-3.5" />Reenviar</button>}{invitation.status === 'pending' && <button type="button" disabled={busy} onClick={() => setConfirmation({ kind: 'invitation', invitation })} className="portal-button portal-button-secondary min-h-9 px-3">Revogar</button>}</div></li>)}</ul>}
          </section>
        </>}

        <section className="rounded-xl border border-white/10 p-5"><h3 className="font-semibold text-white">Atividade</h3><p className="mt-3 text-sm text-slate-400">Cadastro criado em {formatDateTime(condominium.created_at)} · última atualização em {formatDateTime(condominium.updated_at)}.</p></section>
      </div>

      {confirmation && <Modal open title="Confirmar ação" onClose={() => { if (!busy) setConfirmation(null); }}><p className="text-sm leading-6 text-slate-300">{confirmationText()}</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setConfirmation(null)} className="portal-button portal-button-secondary">Cancelar</button><button type="button" disabled={busy} onClick={() => void confirmAction()} className="portal-button portal-button-primary">{busy ? 'Processando...' : 'Confirmar'}</button></div></Modal>}
    </Modal>
  );
}
