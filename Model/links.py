from pymongo import MongoClient

client = MongoClient("localhost", 27017)

db = client["NewsDatabase"]
collection = db["User"]

source = {'Hindu' : 'https://www.thehindu.com/news/national/feeder/default.rss',
          'Hindu Telangana': 'https://www.thehindu.com/news/national/telangana/feeder/default.rss',
          'Hindu Andhra': 'https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss',
          'ESPN Sports': 'https://www.espn.in/espn/rss/news/rss.xml',
          'Science Daily':'https://www.sciencedaily.com/rss/all.xml',
          'News Scientist':'https://www.newscientist.com/feed/home/'}


collection.insert_one({'_id':'Links','RSS Links':source})

client.close()