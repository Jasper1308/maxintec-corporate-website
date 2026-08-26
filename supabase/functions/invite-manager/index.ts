/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- This file is type-checked by the Supabase Deno runtime.
import { createClient } from 'npm:@supabase/supabase-js@2.107.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function validEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json(405, { message: 'Método não permitido.' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const portalSiteUrl = Deno.env.get('PORTAL_SITE_URL');
  const authorization = request.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !portalSiteUrl) {
    return json(500, { message: 'O serviço de convites não está configurado.' });
  }
  if (!authorization) return json(401, { message: 'Entre novamente para continuar.' });

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: userResult, error: userError } = await callerClient.auth.getUser();
  if (userError || !userResult.user) return json(401, { message: 'Entre novamente para continuar.' });

  const { data: callerProfile } = await serviceClient
    .from('profiles')
    .select('global_role')
    .eq('id', userResult.user.id)
    .maybeSingle();
  if (callerProfile?.global_role !== 'admin') {
    return json(403, { message: 'Você não tem permissão para enviar convites.' });
  }

  let body: { condominiumId?: unknown; email?: unknown; invitationId?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { message: 'Dados do convite inválidos.' });
  }

  const invitationId = typeof body.invitationId === 'string' ? body.invitationId : null;
  let condominiumId = typeof body.condominiumId === 'string' ? body.condominiumId : '';
  let email = validEmail(body.email) ? body.email.trim().toLowerCase() : '';
  let createdInvitationId: string | null = null;

  if (invitationId) {
    const { data: invitation } = await serviceClient
      .from('condominium_invitations')
      .select('id, condominium_id, email, status, expires_at')
      .eq('id', invitationId)
      .maybeSingle();
    if (!invitation || !['pending', 'expired'].includes(invitation.status)) {
      return json(409, { message: 'Este convite não está mais disponível para reenvio.' });
    }
    condominiumId = invitation.condominium_id;
    email = invitation.email;
  }

  if (!condominiumId || !validEmail(email)) return json(400, { message: 'Informe um e-mail válido.' });

  const { data: condominium } = await serviceClient
    .from('condominiums')
    .select('id, name')
    .eq('id', condominiumId)
    .maybeSingle();
  if (!condominium) return json(404, { message: 'Condomínio não encontrado.' });

  if (!invitationId) {
    const { data: existingProfile } = await serviceClient
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();
    if (existingProfile) {
      return json(409, {
        code: 'existing_user',
        message: 'Este e-mail já possui conta. Use a opção de adicionar gestor existente.',
      });
    }

    const newId = crypto.randomUUID();
    const { error: insertError } = await serviceClient.from('condominium_invitations').insert({
      id: newId,
      condominium_id: condominiumId,
      email,
      role: 'manager',
      status: 'pending',
      invited_by: userResult.user.id,
    });
    if (insertError) {
      return json(409, { message: 'Já existe um convite pendente para este e-mail.' });
    }
    createdInvitationId = newId;
  }

  const activeInvitationId = invitationId ?? createdInvitationId;
  let siteUrl: URL;
  try {
    siteUrl = new URL(portalSiteUrl);
  } catch {
    return json(500, { message: 'O serviço de convites não está configurado.' });
  }
  siteUrl.pathname = '/accept-invite';
  siteUrl.search = new URLSearchParams({ invitation: activeInvitationId! }).toString();

  const { error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: siteUrl.toString(),
    data: { invitation_id: activeInvitationId, condominium_name: condominium.name },
  });

  if (inviteError) {
    const accountExists = /already|registered|exists/i.test(inviteError.message);
    if (createdInvitationId && accountExists) {
      await serviceClient
        .from('condominium_invitations')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('id', createdInvitationId);
    }
    return json(accountExists ? 409 : 502, {
      ...(accountExists ? { code: 'existing_user' } : {}),
      message: accountExists
        ? 'Este e-mail já possui conta. Use a opção de adicionar gestor existente.'
        : 'Não foi possível enviar o convite agora. Tente novamente.',
    });
  }

  if (invitationId) {
    await serviceClient
      .from('condominium_invitations')
      .update({
        status: 'pending',
        revoked_at: null,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      })
      .eq('id', invitationId);
  }

  return json(200, {
    invitationId: activeInvitationId,
    message: invitationId ? 'Convite reenviado.' : 'Convite enviado.',
  });
});
