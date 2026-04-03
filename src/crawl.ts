import { JSDOM } from "jsdom";

export function normalizeURL(url: string): string {
    const urlObj = new URL(url);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    return hostPath.toLowerCase().replace(/\/$/, "");
}

export function getHeadingFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const h1 = dom.window.document.querySelector("h1");
    const h2 = dom.window.document.querySelector("h2");
    if (h1) {
        return h1.textContent?.trim() || "";
    } else if (h2) {
        return h2.textContent?.trim() || "";
    } else {
        return "";
    }
}