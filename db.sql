-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.aa_summer_series_registration (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  Timestamp timestamp with time zone,
  Email Address text,
  Full Name text NOT NULL,
  Date Of Birth date,
  Nationality text,
  Phone Number text,
  Upload Id (Ghana Card or Passport Photo) text,
  Primary Position text,
  Secondary Position text,
  Dominant Foot text,
  Current Team( School Team, Academy, Club or None) text,
  Years of Playing Experience text,
  Height(cm) numeric,
  Weight(kg) numeric,
  How many minutes can you play at high Intensity? text,
  Which role best describes your playing style? text,
  What is your strongest attribute as a footballer? text,
  Emergency Contact Name text,
  Emergency Contact Phone Number text,
  Player Consent text,
  player_id uuid,
  season_id integer DEFAULT 1,
  reviewed boolean DEFAULT false,
  imported_to_bio_data boolean DEFAULT false,
  review_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT aa_summer_series_registration_pkey PRIMARY KEY (id),
  CONSTRAINT aa_summer_series_registration_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT aa_summer_series_registration_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id)
);
CREATE TABLE public.affiliations (
  id integer NOT NULL DEFAULT nextval('affiliations_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT affiliations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.api_import_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source character varying,
  endpoint character varying,
  records_received integer,
  records_inserted integer,
  records_failed integer,
  error_details jsonb,
  imported_at timestamp with time zone DEFAULT now(),
  CONSTRAINT api_import_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  key_hash text NOT NULL UNIQUE,
  label text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT api_keys_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bio_data (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  Player Code character varying UNIQUE,
  Player Name character varying NOT NULL,
  AA STATS EMAIL character varying,
  Password character varying,
  DOB date,
  Position character varying,
  Age integer,
  Nationality character varying,
  First Choice character varying,
  Second Choice character varying,
  Affiliation character varying,
  Phone Number character varying,
  Status character varying,
  Height numeric,
  Weight numeric,
  SYNced character varying,
  season_id integer,
  team_id uuid,
  jersey_number integer,
  photo_url text,
  emergency_contact character varying,
  emergency_phone character varying,
  consent_media boolean DEFAULT false,
  consent_data boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bio_data_pkey PRIMARY KEY (id),
  CONSTRAINT bio_data_Position_fkey FOREIGN KEY (Position) REFERENCES public.positions(code),
  CONSTRAINT bio_data_Nationality_fkey FOREIGN KEY (Nationality) REFERENCES public.nationalities(code),
  CONSTRAINT bio_data_Affiliation_fkey FOREIGN KEY (Affiliation) REFERENCES public.affiliations(name),
  CONSTRAINT bio_data_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id),
  CONSTRAINT bio_data_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.collators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  contact text,
  status smallint NOT NULL DEFAULT 1,
  email_verified_at timestamp with time zone,
  role text DEFAULT 'collator'::text,
  deleted_at timestamp with time zone,
  assigned_competitions_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid UNIQUE,
  CONSTRAINT collators_pkey PRIMARY KEY (id),
  CONSTRAINT collators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.competition_collators (
  competition_id uuid NOT NULL,
  collator_id uuid NOT NULL,
  CONSTRAINT competition_collators_pkey PRIMARY KEY (competition_id, collator_id),
  CONSTRAINT competition_collators_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id),
  CONSTRAINT competition_collators_collator_id_fkey FOREIGN KEY (collator_id) REFERENCES public.collators(id)
);
CREATE TABLE public.competition_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  stage_id uuid NOT NULL,
  group_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT competition_groups_pkey PRIMARY KEY (id),
  CONSTRAINT competition_groups_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id),
  CONSTRAINT competition_groups_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stages(id)
);
CREATE TABLE public.competition_points_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL UNIQUE,
  win_points integer NOT NULL DEFAULT 3,
  draw_points integer NOT NULL DEFAULT 1,
  loss_points integer NOT NULL DEFAULT 0,
  tie_break_order jsonb NOT NULL DEFAULT '["points", "goal_difference", "goals_for"]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT competition_points_config_pkey PRIMARY KEY (id),
  CONSTRAINT competition_points_config_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id)
);
CREATE TABLE public.competition_teams (
  competition_id uuid NOT NULL,
  team_id uuid NOT NULL,
  CONSTRAINT competition_teams_pkey PRIMARY KEY (competition_id, team_id),
  CONSTRAINT competition_teams_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id),
  CONSTRAINT competition_teams_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.competition_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  description text NOT NULL DEFAULT ''::text,
  slug text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT competition_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.competitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_id uuid,
  competition_type_id uuid,
  structure_id uuid,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text NOT NULL,
  description text,
  banner text,
  status text NOT NULL DEFAULT 'draft'::text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT competitions_pkey PRIMARY KEY (id),
  CONSTRAINT competitions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT competitions_competition_type_id_fkey FOREIGN KEY (competition_type_id) REFERENCES public.competition_types(id),
  CONSTRAINT competitions_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES public.structures(id)
);
CREATE TABLE public.defensive (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id uuid,
  player_id uuid,
  team_id uuid,
  Player Name character varying,
  Position character varying,
  Jersey # integer,
  Tackle Won integer DEFAULT 0,
  Interception integer DEFAULT 0,
  Block integer DEFAULT 0,
  Clearance integer DEFAULT 0,
  Tackle Lost integer DEFAULT 0,
  Headed Clearance integer DEFAULT 0,
  Recovery integer DEFAULT 0,
  Duels Won integer DEFAULT 0,
  Duels Lost integer DEFAULT 0,
  Successful 50/50 integer DEFAULT 0,
  Aerial Battles Won integer DEFAULT 0,
  Aerial Battles Lost integer DEFAULT 0,
  Errors Leading To Goal integer DEFAULT 0,
  Tackle Success Rate numeric DEFAULT 
CASE
    WHEN (("Tackle Won" + "Tackle Lost") > 0) THEN round(((("Tackle Won")::numeric / (("Tackle Won" + "Tackle Lost"))::numeric) * (100)::numeric), 2)
    ELSE NULL::numeric
END,
  data_verified boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT defensive_pkey PRIMARY KEY (id),
  CONSTRAINT defensive_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT defensive_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT defensive_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.draft_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  season_id integer,
  draft_date date NOT NULL,
  format character varying DEFAULT 'Snake'::character varying,
  total_rounds integer DEFAULT 16,
  total_teams integer DEFAULT 4,
  gk_per_team integer DEFAULT 2,
  df_per_team integer DEFAULT 5,
  mf_per_team integer DEFAULT 5,
  fw_per_team integer DEFAULT 4,
  is_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT draft_events_pkey PRIMARY KEY (id),
  CONSTRAINT draft_events_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id)
);
CREATE TABLE public.draft_picks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  draft_event_id uuid,
  round_number integer NOT NULL,
  pick_number integer NOT NULL,
  team_id uuid,
  player_id uuid,
  picked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT draft_picks_pkey PRIMARY KEY (id),
  CONSTRAINT draft_picks_draft_event_id_fkey FOREIGN KEY (draft_event_id) REFERENCES public.draft_events(id),
  CONSTRAINT draft_picks_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT draft_picks_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id)
);
CREATE TABLE public.dribbles_and_fouls (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id uuid,
  player_id uuid,
  team_id uuid,
  Player Name character varying,
  Position character varying,
  Jersey # integer,
  Successful Dribble integer DEFAULT 0,
  Unsuccessful Dribble integer DEFAULT 0,
  Foul Won integer DEFAULT 0,
  Foul Committed integer DEFAULT 0,
  Dribble Success Rate numeric DEFAULT 
CASE
    WHEN (("Successful Dribble" + "Unsuccessful Dribble") > 0) THEN round(((("Successful Dribble")::numeric / (("Successful Dribble" + "Unsuccessful Dribble"))::numeric) * (100)::numeric), 2)
    ELSE NULL::numeric
END,
  data_verified boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dribbles_and_fouls_pkey PRIMARY KEY (id),
  CONSTRAINT dribbles_and_fouls_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT dribbles_and_fouls_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT dribbles_and_fouls_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.evaluation_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  season_id integer,
  session_type character varying NOT NULL CHECK (session_type::text = ANY (ARRAY['Drill'::character varying, 'Small-Sided Game'::character varying, 'Match'::character varying]::text[])),
  session_date date NOT NULL,
  location character varying,
  weight_pct numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT evaluation_sessions_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id)
);
CREATE TABLE public.evaluators (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  full_name character varying NOT NULL,
  role character varying,
  email character varying,
  season_id integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluators_pkey PRIMARY KEY (id),
  CONSTRAINT evaluators_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id)
);
CREATE TABLE public.event_seasons (
  id integer NOT NULL DEFAULT nextval('event_seasons_id_seq'::regclass),
  name character varying NOT NULL,
  year integer NOT NULL,
  start_date date,
  end_date date,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  competition_type text DEFAULT 'Summer Series'::text,
  CONSTRAINT event_seasons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fixtures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  home_team_id uuid NOT NULL,
  away_team_id uuid NOT NULL,
  stage_id uuid,
  match_date date NOT NULL,
  time text,
  location text,
  stream_url text,
  status text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fixtures_pkey PRIMARY KEY (id),
  CONSTRAINT fixtures_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id),
  CONSTRAINT fixtures_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id),
  CONSTRAINT fixtures_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id),
  CONSTRAINT fixtures_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.stages(id)
);
CREATE TABLE public.foot_preference (
  id integer NOT NULL DEFAULT nextval('foot_preference_id_seq'::regclass),
  code character varying NOT NULL UNIQUE,
  description character varying,
  CONSTRAINT foot_preference_pkey PRIMARY KEY (id)
);
CREATE TABLE public.goalkeeper_stats (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id uuid,
  player_id uuid,
  team_id uuid,
  Player Name character varying,
  Jersey # integer,
  Saves integer DEFAULT 0,
  Goals Conceded integer DEFAULT 0,
  Clean Sheet boolean DEFAULT false,
  Penalties Saved integer DEFAULT 0,
  Punches integer DEFAULT 0,
  High Claims integer DEFAULT 0,
  Catches integer DEFAULT 0,
  Sweeper Actions integer DEFAULT 0,
  Save Percentage numeric DEFAULT 
CASE
    WHEN (("Saves" + "Goals Conceded") > 0) THEN round(((("Saves")::numeric / (("Saves" + "Goals Conceded"))::numeric) * (100)::numeric), 2)
    ELSE NULL::numeric
END,
  data_verified boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT goalkeeper_stats_pkey PRIMARY KEY (id),
  CONSTRAINT goalkeeper_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT goalkeeper_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT goalkeeper_stats_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.google_sheets_import (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  import_source character varying,
  batch_id character varying,
  raw_data jsonb NOT NULL,
  processed boolean DEFAULT false,
  errors text,
  imported_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT google_sheets_import_pkey PRIMARY KEY (id)
);
CREATE TABLE public.group_teams (
  group_id uuid NOT NULL,
  team_id uuid NOT NULL,
  CONSTRAINT group_teams_pkey PRIMARY KEY (group_id, team_id),
  CONSTRAINT group_teams_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.competition_groups(id),
  CONSTRAINT group_teams_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.match_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fixture_id uuid NOT NULL,
  player_id uuid,
  card_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT match_cards_pkey PRIMARY KEY (id),
  CONSTRAINT match_cards_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id),
  CONSTRAINT match_cards_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.match_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fixture_id uuid NOT NULL,
  scorer_id uuid,
  assist_player_id uuid,
  goal_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT match_goals_pkey PRIMARY KEY (id),
  CONSTRAINT match_goals_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id),
  CONSTRAINT match_goals_scorer_id_fkey FOREIGN KEY (scorer_id) REFERENCES public.players(id),
  CONSTRAINT match_goals_assist_player_id_fkey FOREIGN KEY (assist_player_id) REFERENCES public.players(id)
);
CREATE TABLE public.match_lineups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id uuid,
  player_id uuid,
  team_id uuid,
  Player Name character varying,
  Position character varying,
  Jersey # integer,
  is_starter boolean DEFAULT true,
  minute_on integer DEFAULT 0,
  minute_off integer,
  minutes_played integer DEFAULT (COALESCE(minute_off, 90) - minute_on),
  Yellow Card integer DEFAULT 0,
  Red Card integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT match_lineups_pkey PRIMARY KEY (id),
  CONSTRAINT match_lineups_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT match_lineups_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT match_lineups_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.match_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fixture_id uuid NOT NULL,
  player_id uuid,
  type text NOT NULL,
  action text,
  details text,
  time text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT match_logs_pkey PRIMARY KEY (id),
  CONSTRAINT match_logs_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id),
  CONSTRAINT match_logs_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.match_substitutions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fixture_id uuid NOT NULL,
  player_out_id uuid,
  player_in_id uuid,
  team_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT match_substitutions_pkey PRIMARY KEY (id),
  CONSTRAINT match_substitutions_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id),
  CONSTRAINT match_substitutions_player_out_id_fkey FOREIGN KEY (player_out_id) REFERENCES public.players(id),
  CONSTRAINT match_substitutions_player_in_id_fkey FOREIGN KEY (player_in_id) REFERENCES public.players(id),
  CONSTRAINT match_substitutions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  season_id integer,
  Event character varying,
  Game # integer,
  Date date NOT NULL,
  Teams character varying,
  Collector Name character varying,
  Start Time time without time zone,
  End Time time without time zone,
  home_team_id uuid,
  away_team_id uuid,
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  stage character varying,
  match_status character varying DEFAULT 'scheduled'::character varying CHECK (match_status::text = ANY (ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  video_url text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id),
  CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id),
  CONSTRAINT matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.nationalities (
  id integer NOT NULL DEFAULT nextval('nationalities_id_seq'::regclass),
  code character NOT NULL UNIQUE,
  name character varying NOT NULL,
  CONSTRAINT nationalities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.news_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  content text NOT NULL,
  cover_image text,
  youtube_url text,
  is_featured boolean NOT NULL DEFAULT false,
  competition_id uuid,
  category_id uuid,
  meta_title text,
  meta_description text,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT news_posts_pkey PRIMARY KEY (id),
  CONSTRAINT news_posts_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id),
  CONSTRAINT news_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.partner_live_cache (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  partner_name text NOT NULL,
  match_data jsonb NOT NULL,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT partner_live_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.passes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id uuid,
  player_id uuid,
  team_id uuid,
  Player Name character varying,
  Position character varying,
  Jersey # integer,
  Attempted Pass integer DEFAULT 0,
  Completed Pass integer DEFAULT 0,
  Key Pass integer DEFAULT 0,
  Assist integer DEFAULT 0,
  Pass Accuracy numeric DEFAULT 
CASE
    WHEN ("Attempted Pass" > 0) THEN round(((("Completed Pass")::numeric / ("Attempted Pass")::numeric) * (100)::numeric), 2)
    ELSE NULL::numeric
END,
  data_verified boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT passes_pkey PRIMARY KEY (id),
  CONSTRAINT passes_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT passes_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT passes_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.physical_data (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  Name character varying,
  Jersey integer,
  Team character varying,
  Squad Num integer,
  Club Name character varying,
  player_id uuid,
  team_id uuid,
  match_id uuid,
  Session Date date NOT NULL,
  Session No integer,
  Session Type character varying,
  matchup_code character varying,
  Accelerations integer,
  Calories integer,
  Decelerations integer,
  Distance per DSL numeric,
  HID Per Min numeric,
  High Intensity Distance numeric,
  High Speed integer,
  HSR Per Min numeric,
  Impacts integer,
  Max Speed numeric,
  No of Sprints integer,
  Sprint Dist numeric,
  Sprint Dist % Total numeric,
  Total Dist numeric,
  Step Balance integer,
  Stop Balance integer,
  Time In Red Zone character varying,
  minutes_tracked numeric,
  sample_only boolean DEFAULT false,
  data_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT physical_data_pkey PRIMARY KEY (id),
  CONSTRAINT physical_data_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT physical_data_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT physical_data_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id)
);
CREATE TABLE public.player_evaluations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid,
  evaluator_id uuid,
  session_id uuid,
  Technical numeric CHECK ("Technical" >= 1::numeric AND "Technical" <= 5::numeric),
  Tactical numeric CHECK ("Tactical" >= 1::numeric AND "Tactical" <= 5::numeric),
  Physical Effort numeric CHECK ("Physical Effort" >= 1::numeric AND "Physical Effort" <= 5::numeric),
  Decision Making numeric CHECK ("Decision Making" >= 1::numeric AND "Decision Making" <= 5::numeric),
  Attitude numeric CHECK ("Attitude" >= 1::numeric AND "Attitude" <= 5::numeric),
  Weighted Score numeric DEFAULT ((((("Technical" * 0.30) + ("Tactical" * 0.20)) + ("Physical Effort" * 0.20)) + ("Decision Making" * 0.20)) + ("Attitude" * 0.10)),
  Key Strengths text,
  Areas To Improve text,
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT player_evaluations_pkey PRIMARY KEY (id),
  CONSTRAINT player_evaluations_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT player_evaluations_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES public.evaluators(id),
  CONSTRAINT player_evaluations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.evaluation_sessions(id)
);
CREATE TABLE public.player_statistics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  competition_id uuid,
  fixture_id uuid,
  total_shots integer,
  shots_on_target integer,
  shots_off_target integer,
  dribbles_successful integer,
  dribbles_attempted integer,
  times_fouled integer,
  dispossessed integer,
  offsides integer,
  tackles integer,
  interceptions integer,
  fouls_committed integer,
  clearances integer,
  dribbles_defended integer,
  blocks integer,
  own_goals integer,
  minutes_played integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT player_statistics_pkey PRIMARY KEY (id),
  CONSTRAINT player_statistics_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id),
  CONSTRAINT player_statistics_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id),
  CONSTRAINT player_statistics_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id)
);
CREATE TABLE public.players (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  name text NOT NULL,
  profile_picture text,
  position text,
  nationality text,
  dob date,
  weight numeric,
  height numeric,
  bio text,
  preferred_foot text,
  previous_experience text,
  reason_for_joining text,
  sections jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.positions (
  id integer NOT NULL DEFAULT nextval('positions_id_seq'::regclass),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  CONSTRAINT positions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'admin'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.qa_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  table_name character varying,
  record_id uuid,
  issue_description text NOT NULL,
  old_value text,
  new_value text,
  corrected_by character varying,
  approved_by character varying,
  evidence_reference text,
  corrected_at timestamp with time zone DEFAULT now(),
  CONSTRAINT qa_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fixture_id uuid NOT NULL UNIQUE,
  home_team_score integer NOT NULL DEFAULT 0,
  away_team_score integer NOT NULL DEFAULT 0,
  winner_team_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT results_pkey PRIMARY KEY (id),
  CONSTRAINT results_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id),
  CONSTRAINT results_winner_team_id_fkey FOREIGN KEY (winner_team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.shots (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id uuid,
  player_id uuid,
  team_id uuid,
  Player Name character varying,
  Position character varying,
  Jersey # integer,
  Shot On Target integer DEFAULT 0,
  Shot Off Target integer DEFAULT 0,
  Shot Blocked integer DEFAULT 0,
  Goal integer DEFAULT 0,
  Saves integer DEFAULT 0,
  Headed Goals integer DEFAULT 0,
  Goals With Right integer DEFAULT 0,
  Goals With Left integer DEFAULT 0,
  Penalties Scored integer DEFAULT 0,
  Freekicks Scored integer DEFAULT 0,
  Big Chances Missed integer DEFAULT 0,
  Hit Woodwork integer DEFAULT 0,
  data_verified boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shots_pkey PRIMARY KEY (id),
  CONSTRAINT shots_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT shots_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id),
  CONSTRAINT shots_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.statsports_player_mapping (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid,
  AA STATS EMAIL character varying NOT NULL UNIQUE,
  Statsports Display Name character varying,
  Squad Num integer,
  Club Name character varying,
  device_serial character varying,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT statsports_player_mapping_pkey PRIMARY KEY (id),
  CONSTRAINT statsports_player_mapping_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id)
);
CREATE TABLE public.structures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT structures_pkey PRIMARY KEY (id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  season_id integer,
  name character varying NOT NULL,
  short_code character varying,
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id)
);
CREATE TABLE public.top64_selection (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  season_id integer,
  player_id uuid,
  Position character varying,
  eval_rank integer,
  selection_type character varying DEFAULT 'Selected'::character varying CHECK (selection_type::text = ANY (ARRAY['Selected'::character varying, 'Reserve'::character varying, 'Alternate'::character varying]::text[])),
  locked_at timestamp with time zone,
  locked_by character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT top64_selection_pkey PRIMARY KEY (id),
  CONSTRAINT top64_selection_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.event_seasons(id),
  CONSTRAINT top64_selection_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id)
);
CREATE TABLE public.video_verification_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id uuid,
  stat_table character varying,
  player_id uuid,
  Player Name character varying,
  stat_column character varying,
  original_value integer,
  verified_value integer,
  discrepancy integer DEFAULT (verified_value - original_value),
  nacsport_timestamp character varying,
  reviewer_name character varying,
  action_taken text,
  verified_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_verification_log_pkey PRIMARY KEY (id),
  CONSTRAINT video_verification_log_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT video_verification_log_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.bio_data(id)
);