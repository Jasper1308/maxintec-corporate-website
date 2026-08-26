-- MaxInTec Portal Base completion
-- Prepared for manual review/application. This migration is additive and does
-- not delete business rows. Apply first in a disposable Supabase environment.

create extension if not exists pgcrypto;

create or replace function public.portal_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.portal_slug(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(
    translate(lower(value),
      'áàâãäåéèêëíìîïóòôõöúùûüçñýÿ',
      'aaaaaaeeeeiiiiooooouuuucnyy'),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- Existing tables: additive columns only.
alter table public.profiles
  add column if not exists avatar_path text;

alter table public.condominiums
  add column if not exists cnpj text,
  add column if not exists postal_code text,
  add column if not exists street text,
  add column if not exists number text,
  add column if not exists complement text,
  add column if not exists neighborhood text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists phone text,
  add column if not exists admin_email text,
  add column if not exists internal_notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Normalize existing slugs and deterministically resolve collisions.
with normalized as (
  select
    id,
    coalesce(nullif(public.portal_slug(coalesce(slug, '')), ''),
             nullif(public.portal_slug(name), ''),
             'condominio') as base_slug
  from public.condominiums
), ranked as (
  select id, base_slug,
         row_number() over (partition by base_slug order by id) as position
  from normalized
)
update public.condominiums c
set slug = case
  when ranked.position = 1 then ranked.base_slug
  else ranked.base_slug || '-' || ranked.position::text
end
from ranked
where ranked.id = c.id;

alter table public.condominiums alter column slug set not null;
create unique index if not exists condominiums_slug_lower_uidx
  on public.condominiums (lower(slug));
do $$
begin
  if not exists (
    select cnpj from public.condominiums where cnpj is not null
    group by cnpj having count(*) > 1
  ) then
    create unique index if not exists condominiums_cnpj_uidx
      on public.condominiums (cnpj) where cnpj is not null;
  end if;
end $$;
create index if not exists condominiums_active_name_idx
  on public.condominiums (active, name);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.condominiums'::regclass
      and conname = 'condominiums_state_format_check'
  ) then
    alter table public.condominiums
      add constraint condominiums_state_format_check
      check (state is null or state ~ '^[A-Z]{2}$') not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.condominiums'::regclass
      and conname = 'condominiums_cnpj_format_check'
  ) then
    alter table public.condominiums
      add constraint condominiums_cnpj_format_check
      check (cnpj is null or cnpj ~ '^[0-9]{14}$') not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.condominiums'::regclass
      and conname = 'condominiums_postal_code_format_check'
  ) then
    alter table public.condominiums
      add constraint condominiums_postal_code_format_check
      check (postal_code is null or postal_code ~ '^[0-9]{8}$') not valid;
  end if;
end $$;

alter table public.condominium_blocks
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.condominium_blocks set id = gen_random_uuid() where id is null;
alter table public.condominium_blocks alter column id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.condominium_blocks'::regclass and contype = 'p'
  ) then
    alter table public.condominium_blocks
      add constraint condominium_blocks_pkey primary key (id);
  elsif not exists (
    select 1 from pg_constraint
    where conrelid = 'public.condominium_blocks'::regclass
      and conname = 'condominium_blocks_id_key'
  ) then
    alter table public.condominium_blocks
      add constraint condominium_blocks_id_key unique (id);
  end if;
end $$;

-- Do not fail installation if legacy rows already contain duplicates. The
-- administrative function below prevents new active duplicates immediately.
do $$
begin
  if not exists (
    select condominium_id, lower(name) from public.condominium_blocks where active
    group by condominium_id, lower(name) having count(*) > 1
  ) then
    create unique index if not exists condominium_blocks_active_name_uidx
      on public.condominium_blocks (condominium_id, lower(name)) where active;
  end if;
end $$;
create index if not exists condominium_blocks_condominium_idx
  on public.condominium_blocks (condominium_id, active, name);

alter table public.condominio_registrations
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists privacy_policy_version text;

alter table public.audit_logs
  add column if not exists actor_id uuid,
  add column if not exists entity_id uuid,
  add column if not exists metadata jsonb;

-- Manager invitations never store passwords or Auth tokens.
create table if not exists public.condominium_invitations (
  id uuid primary key default gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete restrict,
  email text not null,
  role text not null default 'manager',
  status text not null default 'pending',
  invited_by uuid not null references public.profiles(id) on delete restrict,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  constraint condominium_invitations_email_check
    check (email = lower(trim(email)) and position('@' in email) > 1),
  constraint condominium_invitations_role_check check (role in ('manager')),
  constraint condominium_invitations_status_check
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  constraint condominium_invitations_expiration_check check (expires_at > created_at)
);

create unique index if not exists condominium_invitations_pending_uidx
  on public.condominium_invitations (condominium_id, lower(email), role)
  where status = 'pending';
create index if not exists condominium_invitations_admin_list_idx
  on public.condominium_invitations (status, created_at desc);

create table if not exists public.ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now(),
  constraint ticket_attachments_mime_check check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  ),
  constraint ticket_attachments_size_check check (size_bytes > 0 and size_bytes <= 10485760),
  constraint ticket_attachments_path_check check (storage_path !~ '(^|/)\.\.(/|$)')
);

create index if not exists ticket_attachments_ticket_created_idx
  on public.ticket_attachments (ticket_id, created_at);

-- Security helpers are SECURITY DEFINER only to inspect authorization state.
create or replace function public.portal_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and global_role = 'admin'
  );
$$;

create or replace function public.portal_is_manager(p_condominium_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.portal_is_admin() or exists (
    select 1
    from public.condominium_memberships
    where user_id = auth.uid()
      and condominium_id = p_condominium_id
      and role = 'manager'
      and status = 'approved'
  );
$$;

create or replace function public.portal_can_access_ticket(p_ticket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tickets ticket
    where ticket.id = p_ticket_id
      and (
        ticket.opened_by = auth.uid()
        or public.portal_is_admin()
        or public.portal_is_manager(ticket.condominium_id)
      )
  );
$$;

create or replace function public.portal_try_uuid(value text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return value::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

revoke all on function public.portal_is_admin() from public;
revoke all on function public.portal_is_manager(uuid) from public;
revoke all on function public.portal_can_access_ticket(uuid) from public;
grant execute on function public.portal_is_admin() to authenticated;
grant execute on function public.portal_is_manager(uuid) to authenticated;
grant execute on function public.portal_can_access_ticket(uuid) to authenticated;

-- Server-side slug collision handling and complete condominium upsert.
create or replace function public.admin_upsert_condominium(
  p_condominium_id uuid,
  p_name text,
  p_cnpj text default null,
  p_postal_code text default null,
  p_street text default null,
  p_number text default null,
  p_complement text default null,
  p_neighborhood text default null,
  p_city text default null,
  p_state text default null,
  p_phone text default null,
  p_admin_email text default null,
  p_internal_notes text default null,
  p_erp_code text default null,
  p_active boolean default true
)
returns public.condominiums
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.condominiums;
  base_slug text;
  candidate_slug text;
  suffix integer := 1;
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_name, ''))) < 2 then
    raise exception 'invalid condominium name' using errcode = '22023';
  end if;
  if nullif(regexp_replace(coalesce(p_cnpj, ''), '\D', '', 'g'), '') is not null
     and exists (
       select 1 from public.condominiums
       where cnpj = regexp_replace(p_cnpj, '\D', '', 'g')
         and id is distinct from p_condominium_id
     ) then
    raise exception 'cnpj already registered' using errcode = '23505';
  end if;

  base_slug := coalesce(nullif(public.portal_slug(p_name), ''), 'condominio');
  candidate_slug := base_slug;
  while exists (
    select 1 from public.condominiums
    where lower(slug) = lower(candidate_slug)
      and id is distinct from p_condominium_id
  ) loop
    suffix := suffix + 1;
    candidate_slug := base_slug || '-' || suffix::text;
  end loop;

  if p_condominium_id is null then
    insert into public.condominiums (
      name, slug, legacy_code, active, cnpj, postal_code, street, number,
      complement, neighborhood, city, state, phone, admin_email,
      internal_notes, created_at, updated_at
    ) values (
      trim(p_name), candidate_slug, nullif(trim(p_erp_code), ''), coalesce(p_active, true),
      nullif(regexp_replace(coalesce(p_cnpj, ''), '\D', '', 'g'), ''),
      nullif(regexp_replace(coalesce(p_postal_code, ''), '\D', '', 'g'), ''),
      nullif(trim(p_street), ''), nullif(trim(p_number), ''),
      nullif(trim(p_complement), ''), nullif(trim(p_neighborhood), ''),
      nullif(trim(p_city), ''), nullif(upper(trim(p_state)), ''),
      nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), ''),
      nullif(lower(trim(p_admin_email)), ''), nullif(trim(p_internal_notes), ''),
      now(), now()
    ) returning * into result;
  else
    update public.condominiums set
      name = trim(p_name), slug = candidate_slug,
      legacy_code = nullif(trim(p_erp_code), ''), active = coalesce(p_active, active),
      cnpj = nullif(regexp_replace(coalesce(p_cnpj, ''), '\D', '', 'g'), ''),
      postal_code = nullif(regexp_replace(coalesce(p_postal_code, ''), '\D', '', 'g'), ''),
      street = nullif(trim(p_street), ''), number = nullif(trim(p_number), ''),
      complement = nullif(trim(p_complement), ''), neighborhood = nullif(trim(p_neighborhood), ''),
      city = nullif(trim(p_city), ''), state = nullif(upper(trim(p_state)), ''),
      phone = nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), ''),
      admin_email = nullif(lower(trim(p_admin_email)), ''),
      internal_notes = nullif(trim(p_internal_notes), ''), updated_at = now()
    where id = p_condominium_id
    returning * into result;
    if result.id is null then
      raise exception 'condominium not found' using errcode = 'P0002';
    end if;
  end if;
  return result;
end;
$$;

create or replace function public.admin_set_condominium_active(
  p_condominium_id uuid,
  p_active boolean
)
returns public.condominiums
language plpgsql
security definer
set search_path = ''
as $$
declare result public.condominiums;
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.condominiums
  set active = p_active, updated_at = now()
  where id = p_condominium_id
  returning * into result;
  if result.id is null then
    raise exception 'condominium not found' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

create or replace function public.admin_upsert_condominium_block(
  p_condominium_id uuid,
  p_block_id uuid,
  p_name text
)
returns public.condominium_blocks
language plpgsql
security definer
set search_path = ''
as $$
declare result public.condominium_blocks;
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if not exists (select 1 from public.condominiums where id = p_condominium_id) then
    raise exception 'condominium not found' using errcode = 'P0002';
  end if;
  if length(trim(coalesce(p_name, ''))) < 1 then
    raise exception 'invalid block name' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.condominium_blocks
    where condominium_id = p_condominium_id and active
      and lower(name) = lower(trim(p_name))
      and id is distinct from p_block_id
  ) then
    raise exception 'active block name already exists' using errcode = '23505';
  end if;
  if p_block_id is null then
    insert into public.condominium_blocks (condominium_id, name, active)
    values (p_condominium_id, trim(p_name), true) returning * into result;
  else
    update public.condominium_blocks
    set name = trim(p_name), updated_at = now()
    where id = p_block_id and condominium_id = p_condominium_id
    returning * into result;
    if result.id is null then raise exception 'block not found' using errcode = 'P0002'; end if;
  end if;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, condominium_id, metadata)
  values (auth.uid(), case when p_block_id is null then 'block.created' else 'block.updated' end,
          'condominium_block', result.id, p_condominium_id, jsonb_build_object('name', result.name));
  return result;
end;
$$;

create or replace function public.admin_set_condominium_block_active(
  p_block_id uuid,
  p_active boolean
)
returns public.condominium_blocks
language plpgsql
security definer
set search_path = ''
as $$
declare result public.condominium_blocks;
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_active and exists (
    select 1
    from public.condominium_blocks candidate
    join public.condominium_blocks current_block on current_block.id = p_block_id
    where candidate.condominium_id = current_block.condominium_id
      and candidate.id <> current_block.id
      and candidate.active
      and lower(candidate.name) = lower(current_block.name)
  ) then
    raise exception 'active block name already exists' using errcode = '23505';
  end if;
  update public.condominium_blocks
  set active = p_active, updated_at = now()
  where id = p_block_id returning * into result;
  if result.id is null then raise exception 'block not found' using errcode = 'P0002'; end if;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, condominium_id, metadata)
  values (auth.uid(), case when p_active then 'block.activated' else 'block.deactivated' end,
          'condominium_block', result.id, result.condominium_id, jsonb_build_object('name', result.name));
  return result;
end;
$$;

create or replace function public.admin_set_membership(
  p_user_id uuid,
  p_condominium_id uuid,
  p_status text default 'approved'
)
returns public.condominium_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.condominium_memberships;
  previous_status text;
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_status not in ('approved', 'suspended') then
    raise exception 'invalid membership status' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.condominiums where id = p_condominium_id) then
    raise exception 'condominium not found' using errcode = 'P0002';
  end if;

  select status into previous_status
  from public.condominium_memberships
  where user_id = p_user_id and condominium_id = p_condominium_id and role = 'manager'
  limit 1 for update;

  if found then
    update public.condominium_memberships
    set status = p_status,
        approved_at = case when p_status = 'approved' then coalesce(approved_at, now()) else approved_at end
    where user_id = p_user_id and condominium_id = p_condominium_id and role = 'manager'
    returning * into result;
  else
    insert into public.condominium_memberships
      (user_id, condominium_id, role, status, approved_at)
    values
      (p_user_id, p_condominium_id, 'manager', p_status,
       case when p_status = 'approved' then now() else null end)
    returning * into result;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, condominium_id, metadata)
  values (auth.uid(), case when p_status = 'approved' then 'manager.approved' else 'manager.suspended' end,
          'condominium_membership', result.id, p_condominium_id,
          jsonb_build_object('user_id', p_user_id, 'previous_status', previous_status));

  if p_status = 'approved' and previous_status is distinct from 'approved' then
    insert into public.notifications (user_id, title, type, metadata)
    values (p_user_id, 'Acesso de gestor liberado', 'manager_approved',
            jsonb_build_object('condominium_id', p_condominium_id, 'href', '/portal'));
  end if;
  return result;
end;
$$;

create or replace function public.admin_search_profiles(
  p_condominium_id uuid,
  p_search text default ''
)
returns table (
  id uuid,
  full_name text,
  email text,
  membership_status text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return query
  select profile.id, profile.full_name, profile.email, membership.status
  from public.profiles profile
  left join public.condominium_memberships membership
    on membership.user_id = profile.id
   and membership.condominium_id = p_condominium_id
   and membership.role = 'manager'
  where profile.global_role <> 'admin'
    and (
      length(trim(coalesce(p_search, ''))) = 0
      or profile.full_name ilike '%' || trim(p_search) || '%'
      or profile.email ilike '%' || trim(p_search) || '%'
    )
  order by profile.full_name nulls last, profile.email
  limit 25;
end;
$$;

create or replace function public.admin_revoke_invitation(p_invitation_id uuid)
returns public.condominium_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare result public.condominium_invitations;
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.condominium_invitations
  set status = 'revoked', revoked_at = now()
  where id = p_invitation_id and status = 'pending'
  returning * into result;
  if result.id is null then raise exception 'pending invitation not found' using errcode = 'P0002'; end if;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, condominium_id, metadata)
  values (auth.uid(), 'manager_invitation.revoked', 'condominium_invitation', result.id,
          result.condominium_id, jsonb_build_object('email', result.email));
  return result;
end;
$$;

create or replace function public.accept_condominium_invitation(p_invitation_id uuid)
returns public.condominium_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.condominium_invitations;
  authenticated_email text;
  result public.condominium_memberships;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select lower(email) into authenticated_email from auth.users where id = auth.uid();
  select * into invitation from public.condominium_invitations
  where id = p_invitation_id for update;
  if invitation.id is null then raise exception 'invitation not found' using errcode = 'P0002'; end if;
  if invitation.status <> 'pending' or invitation.revoked_at is not null then
    raise exception 'invitation is not pending' using errcode = '22023';
  end if;
  if invitation.expires_at <= now() then
    update public.condominium_invitations set status = 'expired' where id = invitation.id;
    return null;
  end if;
  if authenticated_email is null or authenticated_email <> lower(invitation.email) then
    raise exception 'invitation identity mismatch' using errcode = '42501';
  end if;

  select * into result from public.condominium_memberships
  where user_id = auth.uid() and condominium_id = invitation.condominium_id and role = 'manager'
  limit 1 for update;
  if found then
    update public.condominium_memberships
    set status = 'approved', approved_at = coalesce(approved_at, now())
    where id = result.id returning * into result;
  else
    insert into public.condominium_memberships
      (user_id, condominium_id, role, status, approved_at)
    values (auth.uid(), invitation.condominium_id, 'manager', 'approved', now())
    returning * into result;
  end if;

  update public.condominium_invitations
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = invitation.id;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, condominium_id, metadata)
  values (auth.uid(), 'manager_invitation.accepted', 'condominium_invitation', invitation.id,
          invitation.condominium_id, jsonb_build_object('membership_id', result.id));
  insert into public.notifications (user_id, title, type, metadata)
  values (invitation.invited_by, 'Convite de gestor aceito', 'manager_invitation_accepted',
          jsonb_build_object('condominium_id', invitation.condominium_id, 'href', '/portal/condominiums'));
  return result;
end;
$$;

-- Audit condominium changes without trusting the browser.
create or replace function public.portal_audit_condominium_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, condominium_id, metadata)
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'condominium.created'
         when old.active is distinct from new.active and new.active then 'condominium.activated'
         when old.active is distinct from new.active and not new.active then 'condominium.deactivated'
         else 'condominium.updated' end,
    'condominium', new.id, new.id,
    jsonb_build_object('name', new.name, 'active', new.active)
  );
  return new;
end;
$$;

drop trigger if exists portal_condominium_audit on public.condominiums;
create trigger portal_condominium_audit
after insert or update on public.condominiums
for each row execute function public.portal_audit_condominium_change();

drop trigger if exists portal_condominiums_updated_at on public.condominiums;
create trigger portal_condominiums_updated_at
before update on public.condominiums
for each row execute function public.portal_set_updated_at();

drop trigger if exists portal_blocks_updated_at on public.condominium_blocks;
create trigger portal_blocks_updated_at
before update on public.condominium_blocks
for each row execute function public.portal_set_updated_at();

create or replace function public.portal_require_privacy_consent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if nullif(trim(new.privacy_policy_version), '') is null then
    raise exception 'privacy consent required' using errcode = '23514';
  end if;
  new.privacy_accepted_at := now();
  return new;
end;
$$;

drop trigger if exists portal_registration_privacy_consent on public.condominio_registrations;
create trigger portal_registration_privacy_consent
before insert on public.condominio_registrations
for each row execute function public.portal_require_privacy_consent();

create or replace function public.portal_ticket_attachment_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.ticket_events (ticket_id, event_type, actor_id, message)
  values (new.ticket_id, 'attachment_added', new.uploaded_by, new.original_name);
  return new;
end;
$$;

create or replace function public.portal_validate_ticket_attachment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  new.uploaded_by := auth.uid();
  if (select count(*) from public.ticket_attachments where ticket_id = new.ticket_id) >= 5 then
    raise exception 'ticket attachment limit reached' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists portal_ticket_attachment_validation on public.ticket_attachments;
create trigger portal_ticket_attachment_validation
before insert on public.ticket_attachments
for each row execute function public.portal_validate_ticket_attachment();

create or replace function public.portal_audit_invitation_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, condominium_id, metadata)
  values (new.invited_by, 'manager_invitation.created', 'condominium_invitation', new.id,
          new.condominium_id, jsonb_build_object('email', new.email));
  return new;
end;
$$;

drop trigger if exists portal_invitation_created_audit on public.condominium_invitations;
create trigger portal_invitation_created_audit
after insert on public.condominium_invitations
for each row execute function public.portal_audit_invitation_created();

drop trigger if exists portal_ticket_attachment_history on public.ticket_attachments;
create trigger portal_ticket_attachment_history
after insert on public.ticket_attachments
for each row execute function public.portal_ticket_attachment_event();

-- RLS and privileges. Privileged writes go through validated RPCs.
alter table public.condominium_invitations enable row level security;
alter table public.ticket_attachments enable row level security;
alter table public.condominium_blocks enable row level security;
alter table public.profiles enable row level security;

drop policy if exists portal_profile_update_own on public.profiles;
create policy portal_profile_update_own on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists portal_admin_read_invitations on public.condominium_invitations;
create policy portal_admin_read_invitations on public.condominium_invitations
for select to authenticated using (public.portal_is_admin());

drop policy if exists portal_ticket_attachments_read on public.ticket_attachments;
create policy portal_ticket_attachments_read on public.ticket_attachments
for select to authenticated using (public.portal_can_access_ticket(ticket_id));
drop policy if exists portal_ticket_attachments_insert on public.ticket_attachments;
create policy portal_ticket_attachments_insert on public.ticket_attachments
for insert to authenticated with check (
  uploaded_by = auth.uid() and public.portal_can_access_ticket(ticket_id)
);
drop policy if exists portal_ticket_attachments_delete on public.ticket_attachments;
create policy portal_ticket_attachments_delete on public.ticket_attachments
for delete to authenticated using (
  uploaded_by = auth.uid() or public.portal_is_admin()
);

drop policy if exists portal_blocks_read on public.condominium_blocks;
create policy portal_blocks_read on public.condominium_blocks
for select to authenticated using (active or public.portal_is_admin());

revoke insert, update, delete on public.condominiums from authenticated;
revoke insert, update, delete on public.condominium_blocks from authenticated;
revoke insert, update, delete on public.condominium_memberships from authenticated;
revoke insert, update, delete on public.condominium_invitations from authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_path) on public.profiles to authenticated;
grant select on public.condominium_invitations, public.ticket_attachments to authenticated;
grant insert, delete on public.ticket_attachments to authenticated;

revoke all on function public.admin_upsert_condominium(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,boolean) from public;
revoke all on function public.admin_set_condominium_active(uuid,boolean) from public;
revoke all on function public.admin_upsert_condominium_block(uuid,uuid,text) from public;
revoke all on function public.admin_set_condominium_block_active(uuid,boolean) from public;
revoke all on function public.admin_set_membership(uuid,uuid,text) from public;
revoke all on function public.admin_search_profiles(uuid,text) from public;
revoke all on function public.admin_revoke_invitation(uuid) from public;
revoke all on function public.accept_condominium_invitation(uuid) from public;
grant execute on function public.admin_upsert_condominium(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,boolean) to authenticated;
grant execute on function public.admin_set_condominium_active(uuid,boolean) to authenticated;
grant execute on function public.admin_upsert_condominium_block(uuid,uuid,text) to authenticated;
grant execute on function public.admin_set_condominium_block_active(uuid,boolean) to authenticated;
grant execute on function public.admin_set_membership(uuid,uuid,text) to authenticated;
grant execute on function public.admin_search_profiles(uuid,text) to authenticated;
grant execute on function public.admin_revoke_invitation(uuid) to authenticated;
grant execute on function public.accept_condominium_invitation(uuid) to authenticated;

-- Private Storage buckets. Existing buckets are preserved.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 2097152, array['image/jpeg','image/png','image/webp']),
  ('ticket-attachments', 'ticket-attachments', false, 10485760,
   array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists portal_avatar_read_own on storage.objects;
create policy portal_avatar_read_own on storage.objects
for select to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists portal_avatar_insert_own on storage.objects;
create policy portal_avatar_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(storage.extension(name)) in ('jpg','jpeg','png','webp')
);
drop policy if exists portal_avatar_update_own on storage.objects;
create policy portal_avatar_update_own on storage.objects
for update to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists portal_avatar_delete_own on storage.objects;
create policy portal_avatar_delete_own on storage.objects
for delete to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists portal_ticket_files_read on storage.objects;
create policy portal_ticket_files_read on storage.objects
for select to authenticated using (
  bucket_id = 'ticket-attachments'
  and public.portal_can_access_ticket(public.portal_try_uuid((storage.foldername(name))[1]))
);
drop policy if exists portal_ticket_files_insert on storage.objects;
create policy portal_ticket_files_insert on storage.objects
for insert to authenticated with check (
  bucket_id = 'ticket-attachments'
  and public.portal_try_uuid((storage.foldername(name))[1]) is not null
  and (storage.foldername(name))[2] = auth.uid()::text
  and public.portal_can_access_ticket(public.portal_try_uuid((storage.foldername(name))[1]))
  and lower(storage.extension(name)) in ('jpg','jpeg','png','webp','pdf')
);
drop policy if exists portal_ticket_files_delete on storage.objects;
create policy portal_ticket_files_delete on storage.objects
for delete to authenticated using (
  bucket_id = 'ticket-attachments'
  and (
    (storage.foldername(name))[2] = auth.uid()::text
    or public.portal_is_admin()
  )
);

comment on table public.condominium_invitations is
  'Manager invitation lifecycle; privileged delivery is performed by invite-manager Edge Function.';
comment on table public.ticket_attachments is
  'Metadata for private ticket files stored in the ticket-attachments bucket.';
comment on column public.profiles.avatar_path is
  'Private avatar object path. This is separate from resident registration documents.';
