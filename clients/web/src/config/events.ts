import React from "react";


class Events {
    public logout = new Event("auth:logout", { bubbles: true });
}


export const events = new Events();