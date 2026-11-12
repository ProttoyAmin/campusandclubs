import { APP_NAME } from "../config/constants";

export type PageMeta = {
    title: string;
    description: string;
    keywords?: string;
    ogImages?: string;
    status?: number;
};


export function setTag(selector: string, attr: "name" | "propery", key: string, content: string | null): void {
    let el = document.head.querySelector<HTMLMetaElement>(selector);

    if (content === null || content === undefined) {
        if (el) el.remove();
        return
    }

    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key)
        document.head.appendChild(el)
    }
    el.setAttribute("content", content);
}


export function applyMeta(meta: PageMeta): void {
    document.title = meta.title;
    setTag(`meta[name="description"]`, "name", "description", meta.description ?? null);
}

export async function getPageMeta(url: string): Promise<PageMeta> {
    const { pathname } = new URL(url, "http://localhost");

    if (pathname === '/') {
        return {
            title: `Home | ${APP_NAME}`,
            description: "Welcome to my site.",
        };
    }

    if (pathname === '/@/chats') {
        return {
            title: `Chats | ${APP_NAME}`,
            description: "TODO",
        };
    }


    return { title: APP_NAME, description: "TODO", status: 200 };
}


export function renderMeta(meta: PageMeta): string {
    const parts: string[] = [];

    parts.push(`<title>${escapeHtml(meta.title)}</title>`);

    if (meta.description) {
        parts.push(
            `<meta name="description" content="${escapeHtml(meta.description)}" />`
        );
    }
    return parts.join("\n")

    return `
        <title>${meta.title}</title>
        <meta name="description" content="${meta.description}" />
        ${meta.keywords ? `<meta name="keywords" content="${meta.keywords}" />` : ''}
        ${meta.ogImages ? `<meta property="og:image" content="${meta.ogImages}" />` : ''}
    `;
}

function escapeHtml(s: string): string {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}