import chromadb

client = chromadb.PersistentClient(path="./db")

collection = client.get_or_create_collection(
    name="test"
)

print(collection.count())