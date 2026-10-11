alter table users add column if not exists avatar_url varchar(500);
alter table users add column if not exists membership_plan varchar(12) not null default 'FREE';
alter table users add column if not exists membership_expires_at timestamptz;
create table if not exists post_comments (
  id bigserial primary key,
  post_id bigint not null references posts(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  body varchar(1000) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_post_comments_post on post_comments(post_id, created_at desc);
create table if not exists event_bookings (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  quantity integer not null default 1,
  unit_price integer not null,
  discount_percent integer not null default 0,
  total_amount integer not null,
  status varchar(16) not null default 'PENDING_PAYMENT',
  created_at timestamptz not null default now()
);
create index if not exists idx_event_bookings_user on event_bookings(user_id, created_at desc);
create index if not exists idx_event_bookings_event on event_bookings(event_id, created_at desc);
