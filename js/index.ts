
export type Prop = any

export type Props = Map<string, Prop>


export type ComponentFunction = (props: Props, ctx: Ctx) => Promise<Component>
export type HydrateableFunction = (ctx: Ctx) => Promise<Component>

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

export async function hydrate(component: HydrateableFunction, element: HTMLElement, ctx: Ctx) {
    
    var t = ctx.nodeId
    ctx.nodeId = 0
    var d = document.createElement("div")
    var doc = await component(ctx)
    d.innerHTML = doc
    console.log(doc)
    var AllHydrateables: Map<String, Element> = new Map() // lsit of all things in newPage 
    for (let n of d.querySelectorAll("[homegrown-hydrate]")) {
        console.log("herese a hyrdtaeabe;", n)
        AllHydrateables.set(n.getAttribute("homegrown-hydrate")!, n)
    }
    console.log("hydratebales", AllHydrateables)
    for (let n of element.querySelectorAll("[homegrown-hydrate]")) {
        console.log("to be hydrated in old: ", n)
        var hydratedString = AllHydrateables.get(String(parseInt(n.getAttribute("homegrown-hydrate")!)))?.innerHTML
        console.log("hydarted stirng = ", hydratedString)
        // for some reason we have to add 1 to hte hydrate omsehtings messed up somewhere else
        if (hydratedString == undefined) {
            console.log("proably means we are hydrating promise so no need to do anything right now")
        } else {
            n.innerHTML = hydratedString!

        }
    }
    ctx.nodeId = t
    // this should look for homegorwn-hydrate tags on new page and match them with the id of the same one on the current page
    // we need to do difffing to ensure there is no perfoance problems
}

export async function hydr(serverHTML: string | Promise<string>, clientHTML: string | Promise<string>, name: string, ctx: Ctx) {
    // ctx.nodeId = 0
    if (ctx.isServer) {
        if (typeof serverHTML == "string") {
            return createHTMLNode(serverHTML, name, ctx, true)
            
        }
        return createHTMLNode(await serverHTML, name, ctx, true)
        
    } else {
        if (typeof clientHTML == "string") {
            console.log("rendering node normally")
            return createHTMLNode(clientHTML, name, ctx, true)
        } else {
            console.log("rendering promise node")
            // would be better if we could somehow share state between server and client
            // but sadly, we have to rerender the server component, and then hydrate once the promise is resolved
            ctx.nodeId++
            var d = ctx.nodeId
            clientHTML
                .then((val: string)=>{
                    console.log("current nodeId in hydr", d)

                    document.querySelector("[homegrown-hydrate='"+d)!.innerHTML = val
                        
                })
            // why is this nodeId, in the sevre part it is simply adds 1 nodeId but here adds 2 so I have to minus 1 in hydrate
            // that only works for one of thesese nodes
            // but for some reason when nodeId-- it doesnt work
            // createHTMLNode(document.querySelector("[homegrown-hydrate='"+ctx.nodeId)!.innerHTML, name, ctx, true)
            // return createHTMLNode(await clientHTML, name, ctx, true)
            return "no point rendering me so ignore"
        }
        
        
    }
}



export function createHTMLNode(s: string, name: string, ctx: Ctx, needsHydration: boolean) {
    ctx.nodeId++
    console.log("current nodeId", ctx.nodeId, name, s)
    
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