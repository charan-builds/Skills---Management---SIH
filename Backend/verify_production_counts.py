import os
from app.firebase.config import db
from app.core.config import settings

def print_count(collection_name):
    count = len(list(db.collection(collection_name).stream()))
    print(f"{collection_name}: {count}")

def verify():
    # Force production mode just in case
    os.environ['ENABLE_DEMO_MODE'] = 'false'
    print(f"ENABLE_DEMO_MODE: {settings.ENABLE_DEMO_MODE} (should be False)")
    print("Reading production Firestore...")

    collections = [
        "trainees",
        "programmes",
        "skills",
        "role_benchmarks",
        "employers",
        "assessments",
        "employment",
        "outcomes",
        "employer_verifications",
        "employer_feedback",
        "followups",
        "consents",
        "interventions"
    ]

    for col in collections:
        try:
            print_count(col)
        except Exception as e:
            print(f"{col}: ERROR ({e})")

if __name__ == "__main__":
    verify()
