-- name: GetStatuses :many
select * from statuses;

-- name: GetMessage :one
select *
from messages
where id = $1
limit 1;

-- name: GetMessages :many
select messages.*
from messages
         left join statuses on messages.status = statuses.name
where ("from" = $1 or "to" = $1)
  and code = 1
limit 1000 offset $2;

-- name: GetMessagesWith :many
select messages.*
from messages
         left join statuses on messages.status = statuses.name
where ("from" = $1 and "to" = $2)
   or ("from" = $2 and "to" = $1)
    and code = 1
limit 1000 offset $3;

-- name: GetPendingMessages :many
select * from pending_messages where proceed = false
limit 1000 offset $1;


-- name: AddMessage :exec
insert into messages (id, "from", "to", body, status, "timestamp")
values (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
);

-- name: ChangeStatus :exec
update messages set status = $2 where id = $1;  

-- name: ProceedMessage :exec
insert into messages (id, "from", "to", body, unread, status, timestamp)
select id, "from", "to", body, true, 'PROCESS', timestamp
from pending_messages
where pending_messages.id = $1
  and not proceed;
update pending_messages
set proceed = true
where id = $1;

-- name: ReadMessageById :exec
update messages
set unread = false
where id = $1;

-- name: ReadMessagesFromTo :exec
update messages
set unread = false
where "from" = $1
  and "to" = $2;

-- name: ReadMessagesAll :exec
update messages set unread = false where "to" = $1 and "from" = $2; 

-- name: AddPendingMessage :exec
insert into pending_messages (id, "from", "to", body, "timestamp")
values (
    $1,
    $2,
    $3,
    $4,
    $5
);

-- name: GetChats :many
select doubled_chats."user"
from (
         select case
                    when "from" = $1 then "to"
                    else "from"
                    end
                                 as "user",
                max("timestamp") as "timestamp"
         from messages
         where "from" = $1 
            or "to" = $1 
         group by "from", "to"
     ) as doubled_chats
group by doubled_chats."user"
order by max("timestamp") desc
limit 100 offset $2;

-- name: GetChatsFrom :many
select "to" as "user"
from messages
where "from" = $1
group by "to"
order by max("timestamp") desc
limit 100 offset $2;

-- name: GetChatsTo :many
select "from" as "user"
from messages
where "to" = $1
group by "from"
order by max("timestamp") desc
limit 100 offset $2;