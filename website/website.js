import {toDate} from "./utils/date.js"

function reactionPost(react, postId) {
    fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "reaction": react, "link" : postId })
    })
}

function removeReaction(react, link){
  fetch(`/api/reactions?reaction=${react}&link=${link}`, {
    method: 'DELETE'
})}

let likedArticles, dislikedArticles;

fetch('/api/reactions').then(response=>response.json()).then(reactions =>{
    likedArticles = reactions[0].likedArticles
    dislikedArticles = reactions[0].dislikedArticles
})

fetch('/api/articles').then(response => response.json()).then(articles => {
    const container = document.querySelector('.news')
    container.innerHTML = ''
    articles.forEach((article, index) => {
        const div = document.createElement('div')
        div.className = `article ${article.link}`
        div.id = `article-${index}`
        div.innerHTML = `
        <h2>${article.title || 'No Title'}</h2>
        <p>${article.summary || 'No Description'}</p>
        <div class="links">
            <a href="${article.link}" target="_blank">Read More</a>
             <div class="reaction">
                <span id="1-${index}" data-link="${article.link}" class="material-symbols-outlined js-button" style="font-variation-settings: 'FILL' 0;">thumb_up</span>
                <span id="0-${index}" data-link="${article.link}" class="material-symbols-outlined js-button" style="font-variation-settings: 'FILL' 0;">thumb_down</span>
            </div>
        </div>
        <div class="article-footer">
           <inline class="date">Date : ${toDate(article.published)}</inline>
            <inline class="source">Source : ${article.source}</inline>
        </div>
        `
        if(likedArticles.includes(article.link)){
            div.querySelector('#\\31-'+index).style["font-variation-settings"] = '"FILL" 1'
        }
        if(dislikedArticles.includes(article.link)){
            div.querySelector('#\\30-'+index).style["font-variation-settings"] = '"FILL" 1'
        }
        container.appendChild(div)
    })

    const button = document.querySelectorAll('.js-button')
    button.forEach(but=>{but.addEventListener('click',()=>{
        const property = but.style["font-variation-settings"]
        const value = property[property.length-1]
        but.style["font-variation-settings"] = `'FILL' ${1^value}`

        if(but.id[0]==='1'){
            if(but.style["font-variation-settings"]=='"FILL" 1'){
                reactionPost("like", but.dataset.link)
            }else if(but.style["font-variation-settings"]=='"FILL" 0'){
                removeReaction("like",but.dataset.link)
            }
        }else if(but.id[0]==='0'){
            if(but.style["font-variation-settings"]=='"FILL" 1'){
                reactionPost("dislike", but.dataset.link)
            }else if(but.style["font-variation-settings"]=='"FILL" 0'){
                removeReaction("dislike",but.dataset.link)
            }
        }

        const opposite = `${1^but.id[0]}-${but.id.split('-')[1]}`
        const oppositeElement = document.getElementById(opposite)
        const oppositeProperty = oppositeElement.style["font-variation-settings"]
        const oppositeValue = oppositeProperty[oppositeProperty.length-1]
        
        if(oppositeValue==1){
            oppositeElement.style["font-variation-settings"] = `'FILL' 0`
            if(but.id[0]==='0'){
                removeReaction("like",but.dataset.link)
            }else if(but.id[0]==='1'){
                removeReaction("dislike",but.dataset.link)
            }
        }
})})
})