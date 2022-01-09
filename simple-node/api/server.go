package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"kotsmile/mess/simple-node/db"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type Server struct {
	*mux.Router
}

func NewServer() *Server {
	s := &Server{
		Router: mux.NewRouter(),
	}
	s.routes()
	return s
}

func (s *Server) GetDB() (*db.Queries, error) {
	configDB := "user=postgres dbname=postgres password=1234 host=localhost port=5432 sslmode=disable"
	conn, err := sql.Open("postgres", configDB)
	if err != nil {
		return nil, err
	}
	return db.New(conn), nil
}

func (s *Server) WatchMessges() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		dbAcces, err := s.GetDB()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user := r.URL.Query().Get("user")
		if user == "" {
			http.Error(w, "user is empty", http.StatusBadRequest)
			return
		}

		with := r.URL.Query().Get("with")
		if with == "" {
			http.Error(w, "with is empty", http.StatusBadRequest)
			return
		}

		offsetString := r.URL.Query().Get("offset")

		if offsetString == "" {
			offsetString = "0"
		}

		offset, err := strconv.Atoi(offsetString)

		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		messages, err := dbAcces.WatchMessages(context.Background(), db.WatchMessagesParams{
			From:   user,
			To:     with,
			Offset: int32(offset),
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(messages); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func (s *Server) ReadMessages() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		dbAcces, err := s.GetDB()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user := r.URL.Query().Get("user")
		if user == "" {
			http.Error(w, "user is empty", http.StatusBadRequest)
			return
		}

		with := r.URL.Query().Get("with")
		if with == "" {
			http.Error(w, "with is empty", http.StatusBadRequest)
			return
		}

		offsetString := r.URL.Query().Get("offset")

		if offsetString == "" {
			offsetString = "0"
		}

		offset, err := strconv.Atoi(offsetString)

		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		messages, err := dbAcces.ReadMessages(context.Background(), db.ReadMessagesParams{
			To:     user,
			From:   with,
			Offset: int32(offset),
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(messages); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func (s *Server) SendMessage() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		var message db.AddPendingMessageParams

		if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
			fmt.Println(err.Error())
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		dbAcces, err := s.GetDB()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = dbAcces.AddPendingMessage(context.Background(), message)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = dbAcces.MovePendingMessages(context.Background(), message.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = dbAcces.ChangeStatus(context.Background(), db.ChangeStatusParams{
			ID:     message.ID,
			Status: "OK",
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode("OK")

	}
}

func (s *Server) GetChats() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		dbAcces, err := s.GetDB()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user := r.URL.Query().Get("user")
		if user == "" {
			http.Error(w, "user is empty", http.StatusBadRequest)
			return
		}

		offsetString := r.URL.Query().Get("offset")

		if offsetString == "" {
			offsetString = "0"
		}

		offset, err := strconv.Atoi(offsetString)

		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		chats, err := dbAcces.GetChats(context.Background(), db.GetChatsParams{
			From:   user,
			Offset: int32(offset),
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(chats); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func (s *Server) DefaultOptions() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	}
}

func (s *Server) routes() {
	// GET
	// doesnot change the state of base
	s.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "online")
	})
	s.HandleFunc("/messages/watch", s.WatchMessges()).Methods("GET")
	s.HandleFunc("/chats/get", s.GetChats()).Methods("GET")

	// change the state of base
	s.HandleFunc("/messages/read", s.ReadMessages()).Methods("GET")

	// POST
	s.HandleFunc("/messages/send", s.SendMessage()).Methods("POST")
	s.HandleFunc("/messages/send", s.DefaultOptions()).Methods("OPTIONS")
}
