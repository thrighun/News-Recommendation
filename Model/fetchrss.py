import feedparser
from pymongo import MongoClient

client = MongoClient("localhost", 27017)

db = client["NewsDatabase"]
collection = db["User"]

all_links = collection.find_one({"RSS Links":{"$exists": True}})

source = all_links.get("RSS Links")

news = {}

for key,link in source.items():
    feed = feedparser.parse(link)
    allarticles = []
    for entry in feed.entries:
        article = {"title": entry.title, "link": entry.link, "summary": entry.summary,
                "published": entry.published, "source": key}
        allarticles.append(article)
    news[key] = allarticles


db = client["NewsDatabase"]
collection = db["Articles"]

collection.insert_one(news)

client.close()