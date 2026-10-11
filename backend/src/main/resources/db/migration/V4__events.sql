create table events (
  id bigserial primary key,
  artist_id bigint not null references artist_profiles(id) on delete cascade,
  title varchar(140) not null, description text, venue varchar(160), city varchar(80) not null,
  starts_at timestamptz not null, ticket_price integer,
  created_at timestamptz not null default now()
);
create index idx_events_start on events (starts_at);
create table follows (
  user_id bigint references users(id) on delete cascade,
  artist_id bigint references artist_profiles(id) on delete cascade,
  primary key (user_id, artist_id)
);
create table event_comments (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  body varchar(500) not null, created_at timestamptz not null default now()
);
create table news (
  id bigserial primary key,
  artist_id bigint references artist_profiles(id) on delete set null,
  event_id bigint references events(id) on delete set null,
  headline varchar(200) not null, body varchar(500),
  created_at timestamptz not null default now()
);
create table notifications (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  text varchar(300) not null, link varchar(120),
  is_read boolean not null default false, created_at timestamptz not null default now()
);
create index idx_notif_user on notifications (user_id, created_at desc);
