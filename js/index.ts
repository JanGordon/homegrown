
export type Prop = any

export type Props = Map<string, Prop>


export type ComponentFunction = (props: Props, ctx: Ctx) => Component
export type HydrateableFunction = (ctx: Ctx) => Component

export type Component = string

export type Ctx = {
    isServer: boolean,
    nodeId: number,
}

export function createComponent(component: ComponentFunction, props: Props, ctx: Ctx) {
    return component(props, ctx)
}

export function clientSideRender(component: Component, n: HTMLElement, ctx: Ctx) {
    if (!ctx.isServer) {
        n.innerHTML = component
    } else {
        console.error("can't render client side on server!")
    }
    
}

export function hydrate(component: HydrateableFunction, element: HTMLElement, ctx: Ctx) {
    
    var t = ctx.nodeId
    ctx.nodeId = 0
    var d = document.createElement("div")
    d.innerHTML = component(ctx)
    console.log(d.innerHTML)
    var AllHydrateables: Map<String, Element> = new Map() // lsit of all things in newPage 
    for (let n of d.querySelectorAll("[homegrown-hydrate]")) {
        AllHydrateables.set(n.getAttribute("homegrown-hydrate")!, n)
    }
    console.log("hydratebales", AllHydrateables)
    for (let n of element.querySelectorAll("[homegrown-hydrate]")) {
        n.innerHTML = AllHydrateables.get(n.getAttribute("homegrown-hydrate")!)!.innerHTML
    }
    ctx.nodeId = t
    // this should look for homegorwn-hydrate tags on new page and match them with the id of the same one on the current page
    // we need to do difffing to ensure there is no perfoance problems
}

export function hydr(serverHTML: string, clientHTML: string | Promise<string>, name: string, ctx: Ctx) {
    // ctx.nodeId = 0
    if (ctx.isServer) {
        return createHTMLNode(serverHTML, name, ctx, true)
    } else {
        if (typeof clientHTML == "string") {
            return createHTMLNode(clientHTML, name, ctx, true)
        } else {
            // would be better if we could somehow share state between server and client
            // but sadly, we have to rerender the server component, and then hydrate once the promise is resolved
            var d = createHTMLNode(serverHTML, name, ctx, true)
            var tmpEl = document.createElement("div")
            tmpEl.innerHTML = d
            clientHTML
                .then((val: string)=>{
                    document.querySelector("[homegrown-hydrate='"+tmpEl.children[0].getAttribute("homegrown-hydrate")+"']")!.innerHTML = val
                        
                })
            return d
        }
        
        
    }
}



export function createHTMLNode(s: string, name: string, ctx: Ctx, needsHydration: boolean) {
    ctx.nodeId++
    if (needsHydration) {
        if (name == "") {
            console.error("needs name for hydratable component")
        }
        return "<" +name+" homegrown-hydrate='"+ ctx.nodeId + "'>" + s + "</" +name+ ">"
    } else if (name == "") {
        return s
    } else {
        return "<" +name+ ">" + s + "</" +name+ ">"
    }
    
    
    
    
}


export function mkProps(p: [string, Prop][])  : Map<string, Prop> {
    return new Map<string, Prop>(p)
}

export var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");