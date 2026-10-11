create table if not exists media (
  id varchar(36) primary key,
  content_type varchar(60) not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
