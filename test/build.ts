import {App} from "./App"
import * as homegrown from "../frontend/"


function ssr(props: homegrown.Props) {
    return App(props, {
        isServer: true,
        nodeId: 0,
    })
}

console.log(ssr(new Map<string, homegrown.Prop>([["",""]])))