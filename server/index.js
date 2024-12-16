// Built-In Imports
import path from "path";
import fs from "fs";

// Node Module Imports
import formidable from "express-formidable";
import express from "express";

// Local Imports
import { pages } from "./pages.js";
import {
  urlMap,
  recentlyCreatedLinksHTML,
  recentlyCreatedLinks,
  ValidateLink,
  FixURL,
} from "./url.js";
import { randomNum, genRanString } from "./util.js";

// Setup express server
const app = express();
const port = 3000;

// Handling for shortened URLs
app.use((req, res, next) => {
  // Check if the URL starts with "q" because if it doesn't that means it isn't a shortened URL.
  if (req.path[1] != "q") {
    next();
    return;
  }

  // Attempt to get the URL from the Map so we can use its data to decide what to respond with.
  let url = urlMap.get(req.path.replace("/", ""));

  // Check if the URL is undefined and send an error to the client so we don't create any vulnerabilities.
  if (!url) {
    res.status(404); // Set status to 404 so browsers know that the request failed
    res.send(
      // We join pages.error because it is an array that when joined with an error message, will have an error message appear on its HTML.
      pages.error.join(
        "The shortened URL you requested is invalid or no longer exists!"
      )
    );
    return;
  }
  // We generate a random number and then check if it's bigger than the chance which is in index 2
  let pickedUrl = url[url[2] > 0 && randomNum(100) >= url[2] ? 1 : 0];

  // Set cache to one minute so someone doesn't lose the link to an accidental refresh.
  res.set("Cache-Control", "max-age=60");
  // We send a joined pages.redirect because pages.redirect is an array that when joined with a URL, will have the URL appear in its HTML
  res.send(pages.redirect.join(pickedUrl));
});

// Send Static Files
app.use(express.static("./static"));

// Send the index.html
app.get("/", (req, res) => {
  res.send(pages.index.join(recentlyCreatedLinksHTML));
});

function ShortenLink(linkA, linkB, chance) {
  let code = undefined;
  while (code == undefined || urlMap.has(code)) {
    code = genRanString(8);
  }
  code = "q" + code;
  urlMap.set(code, [linkA, linkB, chance, Date.now()]);

  return code;
}

app.use(formidable());
app.post("/shorten", (req, res) => {
  if (
    !ValidateLink(req.fields.linkA) ||
    (req.fields.linkB != "" && !ValidateLink(req.fields.linkB))
  ) {
    res.status(500);
    res.send(pages.error.join("An invalid link was provided!"));
    return;
  }
  if (req.fields.linkB == "") req.fields.chance = 0;
  if (req.fields.chance > 100 || req.fields.chance < 0) {
    res.status(500);
    res.send(pages.error.join("Invalid form body provided!"));
    return;
  }
  let shortenedLink = ShortenLink(
    FixURL(req.fields.linkA),
    FixURL(req.fields.linkB),
    Math.ceil(req.fields.chance)
  );
  if (shortenedLink == undefined) {
    res.status(500);
    res.send(
      pages.error.join("Something went wrong when shortening your URL!")
    );
    return;
  }
  recentlyCreatedLinks.unshift(shortenedLink);
  res.send(pages.share.join(shortenedLink));
});

// Start the express server
app.listen(port, () => {
  console.log(`Server started on port http://localhost:${port}`);
});
