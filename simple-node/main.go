package main

import (
	"kotsmile/mess/simple-node/api"
	"net/http"
)

func main() {
	server := api.NewServer()
	http.ListenAndServe(":8080", server)
}
