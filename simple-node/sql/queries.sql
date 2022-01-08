-- name: WatchMessages :many
select *
from messages
where ("from" = $1 and "to" = $2)
   or ("from" = $2 and "to" = $1 and not unread)
order by "timestamp" desc
limit 1000 offset $3;

-- name: AmountNewMessages :many
select "from", count(id) from messages
where "to" = $1 and unread
group by "from"
limit 100 offset $2;

-- name: ReadMessages :many
update messages
set unread = false
where id in (
    select id 
    from messages
    where (messages."from" = $2 and messages."to" = $1 and unread)
    order by "timestamp" desc
    limit 1000 offset $3
) returning *;

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

-- name: AddPendingMessage :exec
insert into pending_messages (id, "from", "to", body, "timestamp")
values (
    $1,
    $2,
    $3,
    $4,
    $5
);

------ name: GetPendingMessages :many 
-- DEV
-- name: MovePendingMessages :exec
insert into messages (id, "from", "to", body, unread, status, timestamp)
select id, "from", "to", body, true, 'PROCESS', timestamp
from pending_messages
where pending_messages.id = $1
  and not proceed;

-- name: ChangeStatus :exec
update messages set status = $2 where id = $1;  

-- name: PoceedPendingMessages :exec 
update pending_messages
set proceed = true
where id = $1;

