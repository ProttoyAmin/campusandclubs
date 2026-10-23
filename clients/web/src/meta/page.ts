import { APP_NAME } from "../config/constants";

export type PageMeta = {
    title: string;
    description: string;
    keywords?: string;
    ogImages?: string;
    status?: number;
};


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
    return `
        <title>${meta.title}</title>
        <meta name="description" content="${meta.description}" />
        ${meta.keywords ? `<meta name="keywords" content="${meta.keywords}" />` : ''}
        ${meta.ogImages ? `<meta property="og:image" content="${meta.ogImages}" />` : ''}
    `;
}