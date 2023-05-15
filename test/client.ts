import {App} from "./App"
import * as homegrown from "../frontend/"

var ctx = {
    isServer: false,
    needsHydration: false,
    nodeId: 0,
}
document.getElementById("hy")?.addEventListener("click", ()=>{homegrown.hydrate((c: homegrown.Ctx)=>App(new Map<string, homegrown.Prop>([
    ["home", "no"]
]), c), document.body, ctx)})

// homegrown.hydrate((c: homegrown.Ctx)=>App(new Map<string, homegrown.Prop>([
//     ["home", "no"]
// ]), c), document.body, ctx)

