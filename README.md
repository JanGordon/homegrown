# homegrown
## A stupidly simple frontend framework with ssr support

(I did write better documentation but I lost it somehow...)

# Setup

Install node module:

    npm install homegrownjs
    
To setup the backend with ssr, I would reccomend using the go backend which has all the processing setup. Use the code in the `main.go` file in the example project: [homegrown-homepage](https://github.com/JanGordon/homegrown-homepage). It would proably be easier to clone the project and then edit the files in the pages/root to follow along with the simple tutorial.

# Tutorial
Each component is simply a function that returns an html component:

    export function TestComponent(props: hg.Props, ctx hg.Ctx) {
        return `
            here be dragons
        `

    }

## Use Props
Simply access the props map as you would for any other js map:

    export async function TestComponent(props: hg.Props, ctx: hg.Ctx) {
        return `
            here be dragons and ${props.get("propName")}
        `
    }

## Hydrate promises on resolve
To hydrate the piece of the page once the promise has resolved we use the `hg.hydr` function:
    
    function sleep(time: number) {
        return new Promise<null>((resolve, reject)=>{setTimeout(()=>{resolve(null)}, time)})
    }
    
    var fetchPost = async () => {
            await sleep(5000) // simulate doing some processing
            return fetch("https://jsonplaceholder.typicode.com/posts/1").then((val: Response) => val.text())
        }
    
    
    export async function TestComponent(props: hg.Props, ctx: hg.Ctx) {
        return `
            here be dragons and ${props.get("name")}
            ${await hg.hydr(
                "This is from the server. Hello!",
                fetchPost(), "componentNameGoesHere", ctx
            )}
        `
    }




