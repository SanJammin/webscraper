import { expect, test } from "vitest";
import { normalizeURL } from "./crawl";

test("removes https:// from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
});

test("removes http:// from url", () => {
    expect(normalizeURL("http://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
});

test("removes trailing slash from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
});

test("removes fragment from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path#section")).toBe("www.boot.dev/blog/path");
});

test("removes query string from url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path?query=string")).toBe("www.boot.dev/blog/path");
});

test("handles uppercase letters in url", () => {
    expect(normalizeURL("HTTPS://WWW.BOOT.DEV/BLOG/PATH/")).toBe("www.boot.dev/blog/path");
});
