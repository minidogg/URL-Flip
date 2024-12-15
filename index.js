const path = require("path")
const fs = require("fs")

// We don't need frameworks or templating engines where we are going.
let errorHTML = fs.readFileSync(path.resolve("./pages/error.html"), "utf-8").split("ERROR") // We split it at ERROR so then we can do errorHTML.join(errorMsg)
let shareHTML = fs.readFileSync(path.resolve("./pages/share.html"), "utf-8").split("SHARE_LINK")
let redirectHTML = fs.readFileSync(path.resolve("./pages/redirect.html"), "utf-8").split("REDIRECT_LINK")


const formidable = require('express-formidable');
const express = require('express')
const { url } = require("inspector")
const app = express()
const port = 3000

let urlMap = new Map()
if(fs.existsSync())LoadURLs()

let urlJsonPath = path.resolve("./url.json")
function LoadURLs(){
    let object = JSON.parse(fs.readFileSync(urlJsonPath, "utf-8"))
}
function SaveURLs(){

}

// TODO: Change this to be an environment variable
const baseURL = "localhost:"+port

const randomNum = (max=100)=>Math.floor(Math.random()*max)
app.use((req, res, next)=>{
    if(req.path[1]!="q"){
        next()
        return;
    }
    let url = urlMap.get(req.path.replace("/", ""))
    if(!url){
        res.status(404)
        res.send(errorHTML.join("The shorten URL you requested is invalid or no longer exists!"))
        return;
    }
    let pickedUrl = url[randomNum(100)>=url[2]?1:0]

    res.set("Cache-Control", "max-age=60")
    res.send(redirectHTML.join(pickedUrl))
})

app.use(express.static("./static"))
app.get('/', (req, res) => {
  res.sendFile(path.resolve("./pages/index.html"))
})

function ValidateLink(link){
    if(link.length>300)return false;
    try{
        new URL(link)
        return true;
    }catch{
        return false
    }
}

const genRanString = size => [...Array(size)].map(() => Math.floor(Math.random() * 36).toString(36)).join('');
function ShortenLink(linkA, linkB, chance){
    let code = undefined;
    while(code==undefined||urlMap.has(code)){
        code = genRanString(8)
    }
    code = "q"+code
    urlMap.set(code, [linkA, linkB, chance])

    return code;
}

app.use(formidable());
app.post("/api/shorten", (req, res)=>{
    if(!ValidateLink(req.fields.linkA)||!ValidateLink(req.fields.linkB)){
        res.status(500)
        res.send(errorHTML.join("An invalid link was provided!"))
        return;
    }
    if(req.fields.chance>100||req.fields.chance<0){
        res.status(500)
        res.send(errorHTML.join("Invalid form body provided!"))
        return;
    }

    let shortenedLink = ShortenLink(req.fields.linkA, req.fields.linkB, req.fields.chance)
    if(shortenedLink==undefined){
        res.status(500)
        res.send(errorHTML.join("Something went wrong when shortening your URL!"))
        return;
    }
    res.send(shareHTML.join(shortenedLink))
})



app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})