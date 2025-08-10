from pymongo import MongoClient
import pandas as pd
import newspaper
from newspaper import Article

client = MongoClient("localhost", 27017)

db = client["NewsDatabase"]
collection = db["Articles"]

df = pd.DataFrame()
last_doc = collection.find_one(sort=[('_id', -1)])

for key in last_doc.keys():
    if(key =="_id"):
        continue
    f = pd.DataFrame(last_doc[key])
    df = pd.concat([df,f],ignore_index=True)

df_no_duplicates = df.drop_duplicates(subset=['title','link'],ignore_index=True,)

papers = []

config = newspaper.Config()
config.browser_user_agent = 'Mozilla/5.0'

for i,paper in df_no_duplicates.iterrows():
    try:
        article = Article(paper["link"],config=config)
        article.download()
        article.parse()
        news_text = article.text
    except Exception as e:
        print(f"Failed to process {paper["link"]}: {e}")
        news_text = ""
    papers.append({"title":paper["title"],"link": paper["link"], "news":news_text})

db["FullArticles"].insert_one({"Full Papers": papers})
client.close()