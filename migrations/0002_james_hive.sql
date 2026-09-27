-- James hive: evolving population of engine variants, every game played, and a
-- compressed position tree distilled from those games.

create table if not exists james_variants (
  id text primary key,
  name text not null,
  generation integer not null default 1,
  parent_a text,
  parent_b text,
  genome jsonb not null,
  elo double precision not null default 1200,
  games integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  alive boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists james_variants_alive_elo on james_variants (alive, elo desc);

create table if not exists james_games (
  id bigserial primary key,
  source text not null,
  white_id text,
  black_id text,
  level integer not null default 0,
  result text not null,
  plies integer not null,
  moves text,
  compressed boolean not null default false,
  engine_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists james_games_created on james_games (created_at desc);

create table if not exists james_positions (
  pos_key text not null,
  move text not null,
  plays integer not null default 0,
  points double precision not null default 0,
  updated_at timestamptz not null default now(),
  primary key (pos_key, move)
);

create index if not exists james_positions_plays on james_positions (plays desc);

create table if not exists james_meta (
  key text primary key,
  value bigint not null default 0
);
