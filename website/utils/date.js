export const toDate = (string)=>{
    const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const date = new Date(string)
    return `${month[date.getMonth()]}, ${date.getDate().toString().padStart(2, '0')} ${date.getFullYear()}`;
}