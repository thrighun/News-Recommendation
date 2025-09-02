import { MongoClient } from 'mongodb'
import express from 'express'
import {newsList,reactionsList, recommendList} from './database/utils/utils.js'

const client = new MongoClient("mongodb://localhost:27017/")

await client.connect()

const app = express()
const PORT = 3000

app.use(express.static('src/website'))
app.use(express.json())

app.get('/api/articles', async (req, res) => {
  const articles = await newsList(client)
  res.json(articles)
})

app.get('/api/reactions', async (req, res) => {
  const reaction = await reactionsList(client)
  res.json(reaction)
})

app.get('/api/recommend', async (req, res) => {
  const articles = await recommendList(client)
  res.json(articles)
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