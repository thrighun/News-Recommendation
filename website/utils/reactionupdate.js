export const reactions = (async()=>{
    fetch('/api/reactions').then(response=>response.json()).then(output=>{
        const reactions = {}
        const {likedArticles} = output[0]
        const {dislikedArticles} = output[0]
        reactions.likedArticles = likedArticles
        reactions.dislikedArticles = dislikedArticles
        return reactions
    })
})()