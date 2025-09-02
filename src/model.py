from pymongo import MongoClient
import pandas as pd
import numpy as np
import re
import string
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend(top=10):
    client = MongoClient("localhost", 27017)

    db = client["NewsDatabase"]
    collection = db["FullArticles"]

    df = pd.DataFrame(collection.find().to_list())
    df = df.drop("_id",axis=1)

    data = pd.Series(df["news"])

    for i,art in enumerate(data):
        text_no_punct = art.translate(str.maketrans('', '', string.punctuation))
        text_no_numbers = re.sub(r'\d+', '', text_no_punct)
        words = text_no_numbers.split()
        stemmer = PorterStemmer()
        stemmed_words = [stemmer.stem(word) for word in words]
        data[i] = ' '.join(stemmed_words)

    vectorizer = CountVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data)

    collection = db["User"]
    source = collection.find_one({"likedArticles":{"$exists": True}})
    likedArticles = source.get("likedArticles")

    source = collection.find_one({"dislikedArticles":{"$exists": True}})
    dislikedArticles = source.get("dislikedArticles")

    likedIndexes = df[df["link"].isin(likedArticles)].index
    meanlikedIndexes =  X[likedIndexes].mean(axis=0) if len(likedIndexes) > 0 else np.zeros(X[0].shape)

    dislikedIndexes = df[df["link"].isin(dislikedArticles)].index
    meandislikedIndexes = X[dislikedIndexes].mean(axis=0) if len(dislikedArticles) > 0 else np.zeros(X[0].shape)
    
    user_profile = meanlikedIndexes - meandislikedIndexes

    similarities = cosine_similarity(np.array(user_profile), X.toarray()).flatten()

    for idx in likedIndexes:
        similarities[idx] = -1

    top_indices = similarities.argsort()[::-1][:top]
    #top_indices_scores = similarities[similarities.argsort()[::-1][:top]]

    recommendList = []
    for i in top_indices:
        recommendList.append(df.iloc[i]["link"])

    collection = db["User"]
    collection.update_one({"_id":"recommend"},{"$set":{"Articles":recommendList}},upsert=True)

    client.close()
    return 

recommend()