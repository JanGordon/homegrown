package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/andybalholm/brotli"

	esbuild "github.com/evanw/esbuild/pkg/api"
	"rogchap.com/v8go"
)

type renderCtx struct {
	script     string
	buildCache string
	v8Ctx      *v8go.Context
}

func main() {
	context := renderCtx{
		script: "./test/build.ts",
		v8Ctx:  v8go.NewContext(),
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Encoding", "br")
		buildSSR(&context) // just for dev purposes rebuilds every get request but esbuild is quick so its fine
		c := brotli.HTTPCompressor(w, r)

		c.Write(ssr(&context, [][2]string{
			{"name", "Gopher"},
		}))
		c.Close()
	})

	http.HandleFunc("/client.js", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/javascript")
		w.Header().Set("Content-Encoding", "br")
		c := brotli.HTTPCompressor(w, r)
		c.Write(buildClient("./test/client.ts"))
		c.Close()
	})

	fmt.Println("listeneing on http://localhost:8080")

	http.ListenAndServe(":8080", nil)
	fmt.Println("client ::: \n\n\n\n ", string(buildClient("./test/client.ts")))
}

func reverse(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func buildClient(path string) []byte {
	result := esbuild.Build(esbuild.BuildOptions{
		EntryPoints:       []string{path},
		Bundle:            true,
		MinifySyntax:      true,
		MinifyWhitespace:  true,
		MinifyIdentifiers: true,
	})
	if len(result.Errors) != 0 {
		fmt.Println("error: ", result.Errors)
		os.Exit(1)
	}
	return result.OutputFiles[0].Contents
}

func buildSSR(ctx *renderCtx) {
	result := esbuild.Build(esbuild.BuildOptions{
		EntryPoints:       []string{ctx.script},
		Bundle:            true,
		MinifySyntax:      true,
		MinifyWhitespace:  true,
		MinifyIdentifiers: false,
	})
	if len(result.Errors) != 0 {
		fmt.Println("error: ", result.Errors)
		os.Exit(1)
	}
	c := strings.Replace(string(result.OutputFiles[0].Contents), "(()=>{", "", 1)
	ctx.buildCache = reverse(strings.Replace(reverse(c[:len(c)-6]), reverse(`console.log(ssr(new Map([["",""]])));`), "", 1))
	_, err := ctx.v8Ctx.RunScript(string(ctx.buildCache), "build.js")
	if err != nil {
		fmt.Println(string(ctx.buildCache))
		panic(err)
	}
	// this builds ts file into js
}

func ssr(ctx *renderCtx, props [][2]string) []byte {
	// this runs build.js
	propBytes, err := json.Marshal(props)
	if err != nil {
		panic(err)
	}

	_, err = ctx.v8Ctx.RunScript(fmt.Sprintf("var n = ssr(new Map(%v))", string(propBytes)), "ssr.js")
	if err != nil {
		fmt.Println(string(ctx.buildCache))
		panic(err)
	}
	val, err := ctx.v8Ctx.RunScript("n", "val.js")
	if err != nil {
		panic(err)
	}
	return []byte(val.String())
}
