import {toDate} from "./utils/date.js"
import {reactionPost, removeReaction} from "./utils/reactionupdate.js"

function display(articles,k){
    const container = document.querySelector('.news')
    container.innerHTML = ''
    for(let i=k; i<k+10;i++){
        const div = document.createElement('div')
        div.className = `article ${articles[i].link}`
        div.id = `article-${i}`
        div.innerHTML = `
        <h2>${articles[i].title || 'No Title'}</h2>
        <p>${articles[i].summary || 'No Description'}</p>
        <div class="links">
            <a href="${articles[i].link}" target="_blank">Read More</a>
                <div class="reaction">
                <span id="1-${i}" data-link="${articles[i].link}" class="material-symbols-outlined js-button" style="font-variation-settings: 'FILL' 0;">thumb_up</span>
                <span id="0-${i}" data-link="${articles[i].link}" class="material-symbols-outlined js-button" style="font-variation-settings: 'FILL' 0;">thumb_down</span>
            </div>
        </div>
        <div class="article-footer">
            <inline class="date">Date : ${toDate(articles[i].published)}</inline>
            <inline class="source">Source : ${articles[i].source}</inline>
        </div>
        `
        if(likedArticles.includes(articles[i].link)){
            div.querySelector('#\\31-'+i).style["font-variation-settings"] = '"FILL" 1'
        }
        if(dislikedArticles.includes(articles[i].link)){
            div.querySelector('#\\30-'+i).style["font-variation-settings"] = '"FILL" 1'
        }
        container.appendChild(div)
    }
    
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
}

let likedArticles, dislikedArticles
let recommendArticles

await fetch('/api/reactions').then(response=>response.json()).then(reactions =>{
    likedArticles = reactions[0].likedArticles
    dislikedArticles = reactions[0].dislikedArticles
    return fetch('/api/recommend')
}).then(response=>response.json()).then(recommend => {
    recommendArticles = recommend
    return fetch('/api/articles')
}).then(response => response.json()).then(articles => {
    display(articles,0)
    document.querySelector('.menu-news').onclick = () => {
        display(articles,0)
        document.querySelector('.menu-news').classList.add('menu-highlight')
        document.querySelector('.menu-recommend').classList.remove('menu-highlight')
    }
    document.querySelector('.menu-recommend').onclick = () => {
        display(recommendArticles,0)
        document.querySelector('.menu-recommend').classList.add('menu-highlight')
        document.querySelector('.menu-news').classList.remove('menu-highlight')
    }
})
