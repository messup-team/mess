// Code generated by sqlc. DO NOT EDIT.
// source: queries.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const addPendingMessage = `-- name: AddPendingMessage :exec
insert into pending_messages (id, "from", "to", body, "timestamp")
values (
    $1,
    $2,
    $3,
    $4,
    $5
)
`

type AddPendingMessageParams struct {
	ID        uuid.UUID
	From      string
	To        string
	Body      string
	Timestamp int64
}

func (q *Queries) AddPendingMessage(ctx context.Context, arg AddPendingMessageParams) error {
	_, err := q.db.ExecContext(ctx, addPendingMessage,
		arg.ID,
		arg.From,
		arg.To,
		arg.Body,
		arg.Timestamp,
	)
	return err
}

const amountNewMessages = `-- name: AmountNewMessages :many
select "from", count(id) from messages
where "to" = $1 and unread
group by "from"
limit 100 offset $2
`

type AmountNewMessagesParams struct {
	To     string
	Offset int32
}

type AmountNewMessagesRow struct {
	From  string
	Count int64
}

func (q *Queries) AmountNewMessages(ctx context.Context, arg AmountNewMessagesParams) ([]AmountNewMessagesRow, error) {
	rows, err := q.db.QueryContext(ctx, amountNewMessages, arg.To, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []AmountNewMessagesRow
	for rows.Next() {
		var i AmountNewMessagesRow
		if err := rows.Scan(&i.From, &i.Count); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const changeStatus = `-- name: ChangeStatus :exec
update messages set status = $2 where id = $1
`

type ChangeStatusParams struct {
	ID     uuid.UUID
	Status string
}

func (q *Queries) ChangeStatus(ctx context.Context, arg ChangeStatusParams) error {
	_, err := q.db.ExecContext(ctx, changeStatus, arg.ID, arg.Status)
	return err
}

const getChats = `-- name: GetChats :many
select chats."user", case when "new" is null then 0 else "new" end as "new"
from (select doubled_chats."user"
      from (
               select case
                          when messages."from" = $1 then messages."to"
                          else messages."from"
                          end
                                       as "user",
                      max("timestamp") as "timestamp"
               from messages
               where "from" =$1 
                  or "to" =$1 
               group by "from", "to"
           ) as doubled_chats
      group by doubled_chats."user"
      order by max("timestamp") desc
      limit 100 offset $2) as chats
         left join (
                select "from" as "user", count(id) as "new" from messages
where "to" = $1 and unread
group by "from"
             ) as new_messages  on new_messages."user" = chats."user"
`

type GetChatsParams struct {
	From   string
	Offset int32
}

type GetChatsRow struct {
	User interface{} `json:"user"`
	New  interface{} `json:"inbox"`
}

func (q *Queries) GetChats(ctx context.Context, arg GetChatsParams) ([]GetChatsRow, error) {
	rows, err := q.db.QueryContext(ctx, getChats, arg.From, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetChatsRow
	for rows.Next() {
		var i GetChatsRow
		if err := rows.Scan(&i.User, &i.New); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const movePendingMessages = `-- name: MovePendingMessages :exec
insert into messages (id, "from", "to", body, unread, status, timestamp)
select id, "from", "to", body, true, 'PROCESS', timestamp
from pending_messages
where pending_messages.id = $1
  and not proceed
`

//---- name: GetPendingMessages :many
// DEV
func (q *Queries) MovePendingMessages(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, movePendingMessages, id)
	return err
}

const poceedPendingMessages = `-- name: PoceedPendingMessages :exec
update pending_messages
set proceed = true
where id = $1
`

func (q *Queries) PoceedPendingMessages(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, poceedPendingMessages, id)
	return err
}

const readMessages = `-- name: ReadMessages :many
update messages
set unread = false
where id in (
    select id 
    from messages
    where (messages."from" = $2 and messages."to" = $1 and unread)
    order by "timestamp" desc
    limit 1000 offset $3
) returning id, "from", "to", body, unread, status, timestamp
`

type ReadMessagesParams struct {
	To     string
	From   string
	Offset int32
}

func (q *Queries) ReadMessages(ctx context.Context, arg ReadMessagesParams) ([]Message, error) {
	rows, err := q.db.QueryContext(ctx, readMessages, arg.To, arg.From, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Message
	for rows.Next() {
		var i Message
		if err := rows.Scan(
			&i.ID,
			&i.From,
			&i.To,
			&i.Body,
			&i.Unread,
			&i.Status,
			&i.Timestamp,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const watchMessages = `-- name: WatchMessages :many
select id, "from", "to", body, unread, status, timestamp
from messages
where ("from" = $1 and "to" = $2)
   or ("from" = $2 and "to" = $1 and not unread)
order by "timestamp" desc
limit 1000 offset $3
`

type WatchMessagesParams struct {
	From   string
	To     string
	Offset int32
}

func (q *Queries) WatchMessages(ctx context.Context, arg WatchMessagesParams) ([]Message, error) {
	rows, err := q.db.QueryContext(ctx, watchMessages, arg.From, arg.To, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Message
	for rows.Next() {
		var i Message
		if err := rows.Scan(
			&i.ID,
			&i.From,
			&i.To,
			&i.Body,
			&i.Unread,
			&i.Status,
			&i.Timestamp,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
