drop table if exists posts;
create table posts (
  id integer primary key autoincrement,
  'text' text not null,
  file text not null,
  'timestamp' datetime default current_timestamp,
  ip varchar(20) not null
)
