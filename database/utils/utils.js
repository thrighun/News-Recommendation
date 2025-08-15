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
