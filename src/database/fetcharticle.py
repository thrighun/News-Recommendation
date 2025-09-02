from pymongo import MongoClient
import pandas as pd
import newspaper
from newspaper import Article

client = MongoClient("localhost", 27017)

db = client["NewsDatabase"]
collection = db["Articles"]

df = pd.DataFrame(collection.find().to_list())
df = df.drop("_id",axis=1)

papers = []

config = newspaper.Config()
config.browser_user_agent = 'Mozilla/5.0'

for i,paper in df.iterrows():
    if(not db["FullArticles"].find({"link" : paper["link"]}).to_list()):
        try:
            article = Article(paper["link"],config=config)
            article.download()
            article.parse()
            news_text = article.text
        except Exception as e:
            print(f"Failed to process {paper["link"]}: {e}")
            news_text = ""
        papers.append({"title":paper["title"],"link": paper["link"], "news":news_text})

db["FullArticles"].insert_many(papers)
client.close()