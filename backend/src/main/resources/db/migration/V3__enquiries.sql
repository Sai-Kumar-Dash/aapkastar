create table enquiries (
  id bigserial primary key,
  artist_id bigint not null references artist_profiles(id) on delete cascade,
  customer_id bigint not null references users(id) on delete cascade,
  event_type varchar(40) not null,
  event_date date not null,
  city varchar(80) not null,
  guests integer,
  budget integer,
  message text,
  status varchar(12) not null default 'NEW',
  created_at timestamptz not null default now()
);
create index idx_enq_artist on enquiries (artist_id, created_at desc);
create index idx_enq_customer on enquiries (customer_id, created_at desc);
