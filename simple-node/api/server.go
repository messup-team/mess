package api

import (
	"context"
	"database/sql"
	"encoding/json"
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

func (s *Server) ReadMessages() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		dbAcces, err := s.GetDB()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user := r.URL.Query().Get("user")
		if user == "" {
			http.Error(w, err.Error(), http.StatusBadRequest)
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

		messages, err := dbAcces.GetMessages(context.Background(), db.GetMessagesParams{
			From:   user,
			Offset: int32(offset),
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for _, message := range messages {
			err = dbAcces.ReadMessageById(context.Background(), message.ID)
			if err != nil {
				return
			}
		}

		if err := json.NewEncoder(w).Encode(messages); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func (s *Server) ReadMessagesWith() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		dbAcces, err := s.GetDB()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user := r.URL.Query().Get("user")
		if user == "" {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		userWith := r.URL.Query().Get("userWith")
		if userWith == "" {
			http.Error(w, err.Error(), http.StatusBadRequest)
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

		messages, err := dbAcces.GetMessagesWith(context.Background(), db.GetMessagesWithParams{
			From:   user,
			To:     userWith,
			Offset: int32(offset),
		})

		for _, message := range messages {
			err = dbAcces.ReadMessageById(context.Background(), message.ID)
			if err != nil {
				return
			}
		}

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

func (s *Server) GetChats() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		dbAcces, err := s.GetDB()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		user := r.URL.Query().Get("user")
		if user == "" {
			http.Error(w, err.Error(), http.StatusBadRequest)
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

		messages, err := dbAcces.GetChats(context.Background(), db.GetChatsParams{
			From:   user,
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
		w.Header().Set("Content-Type", "application/json")

		var message db.AddPendingMessageParams

		if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
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

		err = dbAcces.ProceedMessage(context.Background(), message.ID)
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

	}
}

func (s *Server) routes() {
	// GET
	s.HandleFunc("/messages/read", s.ReadMessages()).Methods("GET")
	s.HandleFunc("/messages/read-with", s.ReadMessagesWith()).Methods("GET")
	s.HandleFunc("/chats/get", s.GetChats()).Methods("GET")

	// POST
	s.HandleFunc("/messages/send", s.SendMessage()).Methods("POST")
}
