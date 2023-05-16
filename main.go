package main

import (
	"fmt"
	"net/http"

	"github.com/JanGordon/homegrown/api"
	"github.com/andybalholm/brotli"

	"rogchap.com/v8go"
)

func main() {
	context := api.RenderCtx{
		Script: "./test/build.ts",
		V8Ctx:  v8go.NewContext(),
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Encoding", "br")
		api.BuildSSR(&context) // just for dev purposes rebuilds every get request but esbuild is quick so its fine
		c := brotli.HTTPCompressor(w, r)

		c.Write(api.SSR(&context, [][2]string{
			{"name", "Gopher"},
		}))
		c.Close()
	})

	http.HandleFunc("/client.js", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/javascript")
		w.Header().Set("Content-Encoding", "br")
		c := brotli.HTTPCompressor(w, r)
		c.Write(api.BuildClient("./test/client.ts"))
		c.Close()
		// this is probably overkill, but compresses with brotli for best performance
	})
	http.HandleFunc("/robots.txt", func(w http.ResponseWriter, r *http.Request) {})

	fmt.Println("listeneing on http://localhost:8080")

	http.ListenAndServe(":8080", nil)
	fmt.Println("client ::: \n\n\n\n ", string(api.BuildClient("./test/client.ts")))
}
