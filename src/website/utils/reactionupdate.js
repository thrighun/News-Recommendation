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

export function reactionPost(react, postId) {
    fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "reaction": react, "link" : postId })
    })
}

export function removeReaction(react, link){
  fetch(`/api/reactions?reaction=${react}&link=${link}`, {
    method: 'DELETE'
})}