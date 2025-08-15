import { MongoClient } from 'mongodb'
import express from 'express'

const client = new MongoClient("mongodb://localhost:27017/")

await client.connect()

const app = express()
const PORT = 3000
app.use(express.static('website'))
app.use(express.json())

async function run(){
  const db = client.db("NewsDatabase")
  const col = db.collection("Articles")
  const papers = await col.find().toArray()
  return papers
}

async function react(){
  const db = client.db("NewsDatabase")
  const col = db.collection("User")
  const reaction = await col.find({"_id":"reactions"}).toArray()  
  return reaction
}

async function startServer(){
  app.get('/api/articles', async (req, res) => {
    const articles = await run()
    res.json(articles)
  })
  
  app.get('/api/reactions', async (req, res) => {
    const reaction = await react()
    res.json(reaction)
  })
  
  app.post('/api/reactions', async (req, res) => {
    const db = client.db("NewsDatabase")
    const col = db.collection("User")
    const { link } = req.body
    const { reaction } = req.body
    if(reaction==="like"){
      await col.updateOne(
      { _id: "reactions" },
      { $addToSet: { likedArticles: link } })
      res.json({ success: true })
    }else if(reaction==="dislike"){
      await col.updateOne(
      { _id: "reactions" },
      { $addToSet: { dislikedArticles: link } })
      res.json({ success: true })
    }
  })

  app.delete('/api/reactions', async (req, res) => {
    const {reaction,link} = req.query
    const db = client.db("NewsDatabase")
    const col = db.collection("User")
    if(reaction==="like"){
      await col.updateOne(
      { _id: "reactions" },
      { $pull: { likedArticles: link } })
      res.json({ success: true })
    }else if(reaction==="dislike"){
      await col.updateOne(
      { _id: "reactions" },
      { $pull: { dislikedArticles: link } })
      res.json({ success: true })
    }
  })

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  //open(`http://localhost:${PORT}`)
}

startServer()