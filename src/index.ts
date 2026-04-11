import { crawlSiteAsync } from "./crawl.js";
import { writeJSONReport } from "./report.js";

async function main() {
    const args = process.argv.slice(2);
    if (args.length > 3) {
        console.error("Too many arguments provided.");
        process.exit(1);
    } else if (args.length < 3) {
        console.error("Insufficient arguments provided.");
        process.exit(1);
    }

    const baseURL = args[0];
    const maxConcurrency = parseInt(args[1]);
    const maxPages = parseInt(args[2]);

    console.log(`Crawler is starting at base URL: ${baseURL}`);
    const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);
    console.log("Finished crawling.");
    writeJSONReport(pages, "report.json");
}

main();