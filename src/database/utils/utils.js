export async function insertLink(client,name,link){
    const col = client.db("NewsDatabase").collection("User")
    await col.updateOne({"_id":"links"},{$addToSet : {[name]: link}})
}

export async function insertNews(client,arr){
    const col = client.db("NewsDatabase").collection("Articles")
    try{
        await col.insertMany(arr,{ordered:false})
    }catch(e){
        console.log("Some failed to insert due to duplicates.")
    }
}

export async function newsList(client){
  const col = client.db("NewsDatabase").collection("Articles")
  const papers = await col.find().toArray()
  return papers
}

export async function reactionsList(client){
  const col = client.db("NewsDatabase").collection("User")
  const reaction = await col.find({"_id":"reactions"}).toArray()  
  return reaction
}

export async function recommendList(client){
  let col = client.db("NewsDatabase").collection("User")
  const links = await col.find({"_id":"recommend"}).toArray()
  col = client.db("NewsDatabase").collection("Articles")
  const papers = await col.find({link:{$in: links[0]["Articles"]}}).toArray()
  return papers
}