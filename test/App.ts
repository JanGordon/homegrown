import * as hg from "../frontend/"
import {Button} from "./Button"
import {Profile} from "./Profile"

export var App: hg.ComponentFunction = (props: hg.Props, ctx : hg.Ctx) => {
    return hg.createHTMLNode(`
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
        `, "", ctx, false)
}


