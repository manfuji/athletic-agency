-- Normalize legacy bio_data columns (many have spaces) into a safe view
-- for PostgREST/Supabase queries.

create or replace view public.v_bio_data_normalized as
  select
    id as bio_data_id,
    "Player Code" as player_code,
    "Player Name" as player_name,
    "AA STATS EMAIL" as aa_stats_email,
    "DOB" as dob,
    "Position" as position,
    "Nationality" as nationality,
    season_id,
    team_id,
    jersey_number,
    photo_url,
    emergency_contact,
    emergency_phone,
    consent_media,
    consent_data,
    created_at,
    updated_at
  from public.bio_data;

-- Ensure RLS/privileges are evaluated as the querying user (not the view owner).
alter view public.v_bio_data_normalized
  set (security_invoker = true);

