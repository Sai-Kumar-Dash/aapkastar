create table users (
  id bigserial primary key,
  phone varchar(15) not null unique,
  email varchar(255),
  name varchar(120) not null,
  role varchar(20) not null,
  created_at timestamptz not null default now()
);
create table categories (
  id bigserial primary key,
  name varchar(60) not null unique,
  slug varchar(60) not null unique
);
create table artist_profiles (
  id bigserial primary key,
  user_id bigint not null unique references users(id),
  stage_name varchar(120) not null,
  slug varchar(160) not null unique,
  category_id bigint not null references categories(id),
  city varchar(80) not null,
  bio text,
  languages varchar(255),
  experience_years integer not null default 0,
  starting_price integer not null,
  verification_status varchar(20) not null,
  avg_rating double precision not null default 0,
  bookings_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_artist_city on artist_profiles (lower(city));
create index idx_artist_category on artist_profiles (category_id);
create index idx_artist_status on artist_profiles (verification_status);
create table otp_codes (
  id bigserial primary key,
  phone varchar(15) not null,
  code_hash varchar(100) not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_otp_phone on otp_codes (phone, created_at desc);
insert into categories (name, slug) values
 ('Singer','singer'),('DJ','dj'),('Band','band'),('Dancer','dancer'),('Comedian','comedian'),
 ('Anchor','anchor'),('Musician','musician'),('Magician','magician'),('Rapper','rapper');
