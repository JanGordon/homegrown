import * as homegrown from "../js"

export var Button = (props: homegrown.Props, ctx: homegrown.Ctx) => {
    return homegrown.createHTMLNode(`
        <button name="${props.get("name")}">${props.get("name")}
        </button>
        <a href="https://google.com">Hello</a>
        `,
    "hg-btn", ctx, false)
}