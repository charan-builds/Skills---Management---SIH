class FakeDocumentSnapshot:
    def __init__(self, id, data):
        self.id = id
        self._data = data
        self.exists = data is not None

    def to_dict(self):
        return self._data

class FakeDocumentReference:
    def __init__(self, collection, id):
        self.collection = collection
        self.id = id

    def get(self):
        return FakeDocumentSnapshot(self.id, self.collection._data.get(self.id))

    def set(self, data):
        self.collection._data[self.id] = data

    def update(self, data):
        if self.id in self.collection._data:
            self.collection._data[self.id].update(data)

    def delete(self):
        if self.id in self.collection._data:
            del self.collection._data[self.id]

class FakeQuery:
    def __init__(self, collection, docs):
        self.collection = collection
        self.docs = docs

    def where(self, field, op, value):
        filtered = []
        for doc in self.docs:
            if op == '==':
                if doc.get(field) == value:
                    filtered.append(doc)
            # Add other ops if needed
        return FakeQuery(self.collection, filtered)

    def limit(self, count):
        return FakeQuery(self.collection, self.docs[:count])

    def stream(self):
        for doc in self.docs:
            yield FakeDocumentSnapshot(doc.get("id", doc.get("assessment_id")), doc)

class FakeCollectionReference:
    def __init__(self, name, data_dict):
        self.name = name
        self._data = data_dict

    def document(self, id):
        return FakeDocumentReference(self, id)

    def limit(self, count):
        return FakeQuery(self, list(self._data.values())[:count])

    def where(self, field, op, value):
        return FakeQuery(self, list(self._data.values())).where(field, op, value)

    def stream(self):
        return FakeQuery(self, list(self._data.values())).stream()

    def add(self, data):
        import uuid
        doc_id = str(uuid.uuid4())
        self._data[doc_id] = data
        return None, FakeDocumentReference(self, doc_id)

class FakeFirestoreClient:
    def __init__(self, initial_data):
        self._collections = {}
        # initial_data is expected to be a dict mapping collection_name to a list of dicts.
        for coll_name, docs in initial_data.items():
            self._collections[coll_name] = {}
            for doc in docs:
                # Find an ID
                doc_id = doc.get("id") or doc.get("assessment_id") or doc.get("trainee_id")
                if not doc_id:
                    import uuid
                    doc_id = str(uuid.uuid4())
                self._collections[coll_name][doc_id] = doc

    def collection(self, name):
        if name not in self._collections:
            self._collections[name] = {}
        return FakeCollectionReference(name, self._collections[name])
    
    def batch(self):
        class FakeBatch:
            def set(self, doc_ref, data):
                doc_ref.set(data)
            def commit(self):
                pass
        return FakeBatch()
