package homegrown

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	esbuild "github.com/evanw/esbuild/pkg/api"
	"rogchap.com/v8go"
)

// to implement
// for now you can copy functions from main they should be straightforward enough to understand
// if not, please open an issue

type RenderCtx struct {
	// context required for building and ssring a single page
	Script     string
	buildCache string
	V8Ctx      *v8go.Context
}

func reverse(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func BuildSSR(ctx *RenderCtx) {
	result := esbuild.Build(esbuild.BuildOptions{
		EntryPoints:       []string{ctx.Script},
		Bundle:            true,
		MinifySyntax:      false,
		MinifyWhitespace:  true,
		MinifyIdentifiers: false,
		Platform:          esbuild.PlatformDefault,
	})
	if len(result.Errors) != 0 {
		fmt.Println("error: ", result.Errors)
		os.Exit(1)
	}
	c := strings.Replace(string(result.OutputFiles[0].Contents), "(()=>{", "", 1)
	ctx.buildCache = reverse(strings.Replace(reverse(c[:len(c)-6]), reverse(`console.log(ssr(new Map([["",""]`), "", 1))
	_, err := ctx.V8Ctx.RunScript(string(ctx.buildCache), "build.js")
	if err != nil {
		fmt.Println(string(ctx.buildCache))
		panic(err)
	}
	// this builds ts file into js
}

func BuildClient(path string) []byte {
	// this simply builds the js fil inputed and returns the contents of the output file
	// used to build client but can also be used to build any file
	result := esbuild.Build(esbuild.BuildOptions{
		EntryPoints:       []string{path},
		Bundle:            true,
		MinifySyntax:      false,
		MinifyWhitespace:  false,
		MinifyIdentifiers: false,
		Target:            esbuild.ES2020,
		Platform:          esbuild.PlatformBrowser,
	})
	if len(result.Errors) != 0 {
		fmt.Println("error: ", result.Errors)
		os.Exit(1)
	}
	return result.OutputFiles[0].Contents
}

func SSR(ctx *RenderCtx, props [][2]string) []byte {
	// this runs build.js
	propBytes, err := json.Marshal(props)
	if err != nil {
		panic(err)
	}

	val, err := ctx.V8Ctx.RunScript(fmt.Sprintf("ssr(new Map(%v))", string(propBytes)), "ssr.js")
	if err != nil {
		fmt.Println(string(ctx.buildCache))
		panic(err)
	}
	p, err := val.AsPromise()
	if err != nil {
		panic(err)
	}

	return []byte(p.Result().String())
}
