from pymongo import MongoClient
import pandas as pd
import numpy as np
import re
import string
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend(top):
    client = MongoClient("localhost", 27017)

    db = client["NewsDatabase"]
    collection = db["FullArticles"]

    new_df = pd.DataFrame()

    for doc in collection.find():
        articles_list = doc.get("Full Papers", [])
        f = pd.DataFrame(articles_list)
        new_df = pd.concat([new_df,f],ignore_index=True)

    df_no_duplicates = new_df.drop_duplicates(subset=['Title','Link'],ignore_index=True,)

    data = pd.Series(df_no_duplicates["News"])

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

    likedIndexes = new_df[new_df["Link"].isin(likedArticles)].index
    dislikedIndexes = new_df[new_df["Link"].isin(dislikedArticles)].index

    user_profile = X[likedIndexes].mean(axis=0) - X[dislikedIndexes].mean(axis=0)

    similarities = cosine_similarity(np.array(user_profile), X.toarray()).flatten()

    for idx in likedIndexes:
        similarities[idx] = -1

    top_indices = similarities.argsort()[::-1][:top]
    top_indices_scores = similarities[similarities.argsort()[::-1][:top]]
    print("Recommended articles:", top_indices)
    print("scores",top_indices_scores)

    for i in likedIndexes:
        print(df_no_duplicates.iloc[i]["Title"])

    print("\n")
    print("\n")

    for i in top_indices:
        print(df_no_duplicates.iloc[i]["Link"])

    client.close()