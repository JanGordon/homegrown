
import * as homegrown from "../frontend/"


export var Profile = (props: homegrown.Props, ctx: homegrown.Ctx) => {
    return homegrown.createHTMLNode(`
        <p>Hi, this is the profile component.</p>
        <p>Name: ${props.get("name")}</p>
        <p>Email: ${props.get("email")}</p>
        <p>Other: ${props.get("other")}</p>
    `, "hg-profile", ctx, false)
}