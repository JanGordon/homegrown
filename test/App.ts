import * as hg from "../js"
import {Button} from "./Button"
import {Profile} from "./Profile"

export var App: hg.ComponentFunction = (props: hg.Props, ctx : hg.Ctx) => {
    return hg.createHTMLNode(`
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="simple homegrown framework">
        <title>Document</title>
    </head>
    <body>
            <div style="font-size: 4em;">${hg.hydr(
                "this is the server", // runs for ssr
                Button(new Map<string, hg.Prop>([["name", "bigBtn"]]), ctx), // run on hydration
                "c", ctx
            )}</div>
            
            <button style="font-size: 5em;" id="hy">Hydrate the page</button>
            <div>
            ${hg.hydr(
                Profile(hg.mkProps([["name", "loading..."]]), ctx),
                Profile(hg.mkProps([["name", "Gopher"]]), ctx),
                "c", ctx
            )}
            </div>
            <script src="./client.js"></script>
    </body>
    </html>
        `, "", ctx, false)
}


