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
  // Check if the URL starts with "q" or "i" because if it doesn't that means it isn't a shortened URL.
  if (req.path[1] !== "q" && req.path[1] !== "i") {
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

  // Determine if it's an instant link
  const isInstant = req.path[1] === "i";

  let pickedUrl = url[url[2] > 0 && randomNum(100) >= url[2] ? 1 : 0];

  if (isInstant) {
    res.redirect(pickedUrl);
  } else {
    res.set("Cache-Control", "max-age=60");
    res.send(pages.redirect.join(pickedUrl));
  }
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
  const redirectCode = "q" + code; // Redirect link
  const instantCode = "i" + code; // Instant link

  // Store both links in the map
  urlMap.set(redirectCode, [linkA, linkB, chance, Date.now()]);
  urlMap.set(instantCode, [linkA, linkB, chance, Date.now(), true]); // Instant redirect flag

  return { redirectCode, instantCode };
}

app.use(formidable());
app.post("/shorten", (req, res) => {
  const { linkA, linkB, chance } = req.fields;

  if (!ValidateLink(linkA) || (linkB && !ValidateLink(linkB))) {
    return res
      .status(400)
      .send(pages.error.join("An invalid link was provided!"));
  }

  const linkBChance = linkB ? Math.max(0, Math.min(100, chance || 0)) : 0;

  const { redirectCode, instantCode } = ShortenLink(
    FixURL(linkA),
    FixURL(linkB),
    linkBChance
  );

  if (!redirectCode || !instantCode) {
    return res
      .status(500)
      .send(pages.error.join("Something went wrong when shortening your URL!"));
  }

  recentlyCreatedLinks.unshift(redirectCode);
  res.send(
    pages.share.join(
      `<a href="/${redirectCode}">/${redirectCode}</a> or instant link: <a href="/${instantCode}">/${instantCode}</a>`
    )
  );
});

app.get("/advertise", (req, res) => {
  res.send(pages.advertise.join(""));
});

// 404
app.use((req,res,next)=>{
  res.status(404)
  res.send(pages.error.join("404! We couldn't find the resource you requested!"));
})

// Start the express server
app.listen(port, () => {
  console.log(`Server started on port http://localhost:${port}`);
});
