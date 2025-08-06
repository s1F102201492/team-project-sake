from pymongo import MongoClient
import sys

client = MongoClient('mongo', 27017, serverSelectionTimeoutMS=5000)
try:
    client.admin.command('ping')
    db = client['mydb']
    result = db.test.insert_one({'msg': 'connected'})
    doc = db.test.find_one({'_id': result.inserted_id})
    print("MongoDB 接続 OK:", doc)
    sys.exit(0)
except Exception as e:
    print("MongoDB 接続失敗:", e)
    sys.exit(1)
