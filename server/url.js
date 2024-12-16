// Built-In Imports
import path from "path";
import fs from "fs";

// Local Imports
export let urlMap = new Map();
let urlJsonPath = path.resolve("./url.json");
if (fs.existsSync(urlJsonPath)) LoadURLs();

// Recently created links
export let recentlyCreatedLinks = [];
export let recentlyCreatedLinksHTML = "";

// Load the URLs
function LoadURLs() {
  let obj = JSON.parse(fs.readFileSync(urlJsonPath, "utf-8"));
  urlMap = new Map(Object.entries(obj));
}
// Save the URLs
function SaveURLs() {
  let obj = Object.fromEntries(urlMap);
  fs.writeFileSync(urlJsonPath, JSON.stringify(obj), "utf-8");

  recentlyCreatedLinks = recentlyCreatedLinks.slice(0, 10);
  recentlyCreatedLinksHTML = recentlyCreatedLinks
    .map((e) => `<a href="/${e}">/${e}</a>`)
    .join("");
}
setInterval(SaveURLs, 10 * 1000);
SaveURLs();

// Fix the URL
export function FixURL(link) {
  return link.startsWith("http://") || link.startsWith("https://")
    ? link
    : `https://${link}`;
}

// Check if the link is valid
export function ValidateLink(link) {
  const url = new URL(link, "http://example.com");
  return (
    url.protocol === "http:" ||
    (url.protocol === "https:" && url.hostname !== "example.com")
  );
}
