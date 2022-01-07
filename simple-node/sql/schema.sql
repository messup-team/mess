create table if not exists statuses
(
    id          serial primary key,
    name        text    not null,
    code        integer not null,
    description text    not null
);

create table if not exists messages
(
    id          uuid unique          not null,
    "from"      text                 not null,
    "to"        text                 not null,
    body        text                 not null,
    unread      boolean default true not null,
    status      text                 not null,
    "timestamp" bigint               not null
);

create table if not exists pending_messages
(
    id          uuid                   not null,
    "from"      text                   not null,
    "to"        text                   not null,
    body        text                   not null,
    "timestamp" bigint                 not null,
    proceed     boolean default false  not null
);