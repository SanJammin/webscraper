export function normalizeURL(url: string): string {
    const urlObj = new URL(url);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    return hostPath.toLowerCase().replace(/\/$/, "");
}

// REMOVE THIS AFTER TESTING
// console.log(normalizeURL("https://www.boot.dev/blog/path/"));