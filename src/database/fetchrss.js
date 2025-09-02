import { MongoClient } from "mongodb"
import Parser from "rss-parser"
import { insertNews } from "./utils/utils.js"

const parser = new Parser()

const client = new MongoClient("mongodb://localhost:27017/")
await client.connect()
const col =  client.db("NewsDatabase").collection("User")

async function fetchNews(){
    const links = await col.findOne({"_id":"links"})
    let rssNews = []
    const uniqueLinks = new Set()

    const rssRequest = async (link,source) => {
        const arr = []
        const feed = await parser.parseURL(link)
        feed.items.forEach((item) =>{
            if(item.link && !uniqueLinks.has(item.link)){
                arr.push({"title":item.title,"link":item.link,"summary":item.content,"published":item.pubDate,"source":source})
                uniqueLinks.add(item.link)
            }
        })
        return arr
    }
 
    for(const [source,link] of Object.entries(links)){
        if(source==="_id"){
            continue
        }
        for(const l of link){
            const arr = await rssRequest(l,source)
            rssNews = rssNews.concat(arr)
        }
    }
    return rssNews
}

const rssNews = await fetchNews()

await insertNews(client, rssNews)

client.close()
