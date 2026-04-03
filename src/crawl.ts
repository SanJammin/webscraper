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

export function getFirstParagraphFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const p = dom.window.document.querySelector("p");
    const main = dom.window.document.querySelector("main");
    if (main) {
        const mainP = main.querySelector("p");
        if (mainP) {
            return mainP.textContent?.trim() || "";
        }
    }
    
    if (p) {
        return p.textContent?.trim() || "";
    }

    return "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[];