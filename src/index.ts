function main() {
    const args = process.argv.slice(2);
    if (args.length > 1) {
        console.error("Too many arguments provided.");
        process.exit(1);
    } else if (args.length < 1) {
        console.error("No argument provided.");
        process.exit(1);
    }
    
    const baseURL = args[0];
    console.log(`Crawler is starting at base URL: ${baseURL}`);
    process.exit(0);
}

main();