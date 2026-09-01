alter table public.challenge_rooms
  add column if not exists host_results jsonb,
  add column if not exists guest_results jsonb,
  add column if not exists host_rematch boolean not null default false,
  add column if not exists guest_rematch boolean not null default false,
  add column if not exists rematch_rounds integer,
  add column if not exists rematch_track_ids jsonb;

create or replace function public.start_challenge(
  room_id text,
  host_id_value text
)
returns setof public.challenge_rooms
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.challenge_rooms as rooms
  set status = 'playing'
  where rooms.id = start_challenge.room_id
    and rooms.host_id = start_challenge.host_id_value
    and rooms.guest_id is not null
    and rooms.status = 'waiting'
  returning rooms.*;
end;
$$;

grant execute on function public.start_challenge(text, text) to anon;

create or replace function public.submit_challenge_results(
  room_id text,
  player_role text,
  player_results jsonb
)
returns setof public.challenge_rooms
language plpgsql
security definer
set search_path = public
as $$
begin
  if player_role = 'host' then
    return query
    update public.challenge_rooms as rooms
    set host_results = submit_challenge_results.player_results,
        status = case when rooms.guest_results is not null then 'complete' else 'playing' end
    where rooms.id = submit_challenge_results.room_id
      and rooms.status in ('playing', 'waiting_results')
    returning rooms.*;
  elsif player_role = 'guest' then
    return query
    update public.challenge_rooms as rooms
    set guest_results = submit_challenge_results.player_results,
        status = case when rooms.host_results is not null then 'complete' else 'playing' end
    where rooms.id = submit_challenge_results.room_id
      and rooms.guest_id is not null
      and rooms.status in ('playing', 'waiting_results')
    returning rooms.*;
  end if;
end;
$$;

grant execute on function public.submit_challenge_results(text, text, jsonb) to anon;

create or replace function public.request_challenge_rematch(
  room_id text,
  player_role text
)
returns setof public.challenge_rooms
language plpgsql
security definer
set search_path = public
as $$
begin
  if player_role = 'host' then
    return query
    update public.challenge_rooms as rooms
    set status = case when rooms.guest_rematch then 'playing' else 'rematch_waiting' end,
        host_results = case when rooms.guest_rematch then null else rooms.host_results end,
        guest_results = case when rooms.guest_rematch then null else rooms.guest_results end,
        host_rematch = case when rooms.guest_rematch then false else true end,
        guest_rematch = case when rooms.guest_rematch then false else rooms.guest_rematch end
    where rooms.id = request_challenge_rematch.room_id
    returning rooms.*;
  elsif player_role = 'guest' then
    return query
    update public.challenge_rooms as rooms
    set status = case when rooms.host_rematch then 'playing' else 'rematch_waiting' end,
        host_results = case when rooms.host_rematch then null else rooms.host_results end,
        guest_results = case when rooms.host_rematch then null else rooms.guest_results end,
        host_rematch = case when rooms.host_rematch then false else rooms.host_rematch end,
        guest_rematch = case when rooms.host_rematch then false else true end
    where rooms.id = request_challenge_rematch.room_id
    returning rooms.*;
  end if;
end;
$$;

grant execute on function public.request_challenge_rematch(text, text) to anon;

create or replace function public.request_challenge_rematch(
  room_id text,
  player_role text,
  rematch_rounds integer,
  rematch_track_ids jsonb
)
returns setof public.challenge_rooms
language plpgsql
security definer
set search_path = public
as $$
begin
  if player_role = 'host' then
    return query
    update public.challenge_rooms as rooms
    set host_rematch = case when rooms.guest_rematch then false else true end,
        guest_rematch = case when rooms.guest_rematch then false else rooms.guest_rematch end,
      rematch_rounds = request_challenge_rematch.rematch_rounds,
      rematch_track_ids = request_challenge_rematch.rematch_track_ids,
      rounds = case when rooms.guest_rematch then request_challenge_rematch.rematch_rounds else rooms.rounds end,
      track_ids = case when rooms.guest_rematch then request_challenge_rematch.rematch_track_ids else rooms.track_ids end,
        status = case when rooms.guest_rematch then 'playing' else 'rematch_waiting' end,
        host_results = case when rooms.guest_rematch then null else rooms.host_results end,
        guest_results = case when rooms.guest_rematch then null else rooms.guest_results end
    where rooms.id = request_challenge_rematch.room_id
    returning rooms.*;
  elsif player_role = 'guest' then
    return query
    update public.challenge_rooms as rooms
    set host_rematch = case when rooms.host_rematch then false else rooms.host_rematch end,
        guest_rematch = case when rooms.host_rematch then false else true end,
        rematch_rounds = coalesce(rooms.rematch_rounds, request_challenge_rematch.rematch_rounds),
        rematch_track_ids = coalesce(rooms.rematch_track_ids, request_challenge_rematch.rematch_track_ids),
        rounds = case when rooms.host_rematch then coalesce(rooms.rematch_rounds, request_challenge_rematch.rematch_rounds) else rooms.rounds end,
        track_ids = case when rooms.host_rematch then coalesce(rooms.rematch_track_ids, request_challenge_rematch.rematch_track_ids) else rooms.track_ids end,
        status = case when rooms.host_rematch then 'playing' else 'rematch_waiting' end,
        host_results = case when rooms.host_rematch then null else rooms.host_results end,
        guest_results = case when rooms.host_rematch then null else rooms.guest_results end
    where rooms.id = request_challenge_rematch.room_id
    returning rooms.*;
  end if;
end;
$$;

grant execute on function public.request_challenge_rematch(text, text, integer, jsonb) to anon;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'challenge_rooms'
  ) then
    alter publication supabase_realtime add table public.challenge_rooms;
  end if;
end;
$$;
