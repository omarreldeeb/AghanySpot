alter table public.challenge_rooms
  add column if not exists host_results jsonb,
  add column if not exists guest_results jsonb;

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
        status = case when rooms.guest_results is not null then 'complete' else 'waiting_results' end
    where rooms.id = submit_challenge_results.room_id
      and rooms.status in ('playing', 'waiting_results')
    returning rooms.*;
  elsif player_role = 'guest' then
    return query
    update public.challenge_rooms as rooms
    set guest_results = submit_challenge_results.player_results,
        status = case when rooms.host_results is not null then 'complete' else 'waiting_results' end
    where rooms.id = submit_challenge_results.room_id
      and rooms.guest_id is not null
      and rooms.status in ('playing', 'waiting_results')
    returning rooms.*;
  end if;
end;
$$;

grant execute on function public.submit_challenge_results(text, text, jsonb) to anon;

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
