create table votes (
  user_id bigint not null references users(id) on delete cascade,
  kind varchar(8) not null,
  item_id bigint not null,
  primary key (user_id, kind, item_id)
);
create index idx_votes_item on votes (kind, item_id);
