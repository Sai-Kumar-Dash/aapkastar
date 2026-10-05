alter table users alter column phone drop not null;
alter table users add column password_hash varchar(100);
create unique index uq_users_email on users (lower(email)) where email is not null;
alter table artist_profiles add column avatar_url varchar(500), add column cover_url varchar(500);
create table posts (
  id bigserial primary key,
  artist_id bigint not null references artist_profiles(id) on delete cascade,
  type varchar(10) not null,
  text text,
  media_url varchar(600),
  created_at timestamptz not null default now()
);
create index idx_posts_artist on posts (artist_id, created_at desc);
create table favorite_artists (
  user_id bigint references users(id) on delete cascade,
  artist_id bigint references artist_profiles(id) on delete cascade,
  primary key (user_id, artist_id)
);
create table saved_posts (
  user_id bigint references users(id) on delete cascade,
  post_id bigint references posts(id) on delete cascade,
  primary key (user_id, post_id)
);
