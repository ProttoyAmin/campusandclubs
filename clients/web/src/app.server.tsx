import { renderToString } from "react-dom/server";
import App from "./App";
import './App.css';
import { StaticRouter } from "react-router-dom";

export async function render(url: string) {
    return renderToString(
        <StaticRouter location={url}>
            <App />
        </StaticRouter>
    )
}