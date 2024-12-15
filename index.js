const path = require("path")
const fs = require("fs")

// We don't need frameworks or templating engines where we are going.
const pages = {
    index: "",
    error: "",
    share: "",
    redirect: "",
}


function UpdateDyanmicPages(){
    pages.index = [fs.readFileSync(path.resolve("./pages/index.html"), "utf-8")]

    pages.error = fs.readFileSync(path.resolve("./pages/error.html"), "utf-8").split("ERROR") // We split it at ERROR so then we can do errorHTML.join(errorMsg)
    pages.share = fs.readFileSync(path.resolve("./pages/share.html"), "utf-8").split("SHARE_LINK")
    pages.redirect = fs.readFileSync(path.resolve("./pages/redirect.html"), "utf-8").split("REDIRECT_LINK")

}
UpdateDyanmicPages()
let havePagesUpdated = false
fs.watch("./pages", {"recursive": true}, ()=>{
    console.log("Pages updated")
    havePagesUpdated = true
})
setInterval(()=>{
    if(havePagesUpdated==true){
        havePagesUpdated = false
        UpdateDyanmicPages()
    }
}, 1000)

const formidable = require('express-formidable');
const express = require('express')
const { url } = require("inspector")
const app = express()
const port = 3000

let urlMap = new Map()
let urlJsonPath = path.resolve("./url.json")
if(fs.existsSync(urlJsonPath))LoadURLs()

function LoadURLs(){
    let obj = JSON.parse(fs.readFileSync(urlJsonPath, "utf-8"))
    urlMap = new Map(Object.entries(obj));
}
function SaveURLs(){
    let obj = Object.fromEntries(urlMap);
    fs.writeFileSync(urlJsonPath, JSON.stringify(obj), "utf-8")
}
setInterval(SaveURLs, 10*1000)
SaveURLs()

const randomNum = (max=100)=>Math.floor(Math.random()*max)
app.use((req, res, next)=>{
    if(req.path[1]!="q"){
        next()
        return;
    }
    let url = urlMap.get(req.path.replace("/", ""))
    if(!url){
        res.status(404)
        res.send(pages.error.join("The shorten URL you requested is invalid or no longer exists!"))
        return;
    }
    let pickedUrl = url[randomNum(100)>=url[2]?1:0]

    res.set("Cache-Control", "max-age=60")
    res.send(pages.redirect.join(pickedUrl))
})

app.use(express.static("./static"))
app.get('/', (req, res) => {
  res.send(pages.index.join(""))
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
        res.send(pages.error.join("An invalid link was provided!"))
        return;
    }
    if(req.fields.chance>100||req.fields.chance<0){
        res.status(500)
        res.send(pages.error.join("Invalid form body provided!"))
        return;
    }

    let shortenedLink = ShortenLink(req.fields.linkA, req.fields.linkB, req.fields.chance)
    if(shortenedLink==undefined){
        res.status(500)
        res.send(pages.error.join("Something went wrong when shortening your URL!"))
        return;
    }
    res.send(pages.share.join(shortenedLink))
})



app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})