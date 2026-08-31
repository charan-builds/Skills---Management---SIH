import os
import sys

# Add Backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.firebase.repository import FirestoreRepository

print("Loading demo data...")
data = FirestoreRepository._load_local_demo_data()
print(f"Data keys: {data.keys()}")
print(f"Trainees count in raw JSON: {len(data.get('trainees', []))}")
print(f"Programmes count in raw JSON: {len(data.get('programmes', []))}")
print(f"Employers count in raw JSON: {len(data.get('employers', []))}")
print(f"Jobs count in raw JSON: {len(data.get('jobs', []))}")
print(f"Skills count in raw JSON: {len(data.get('skills', []))}")

print("\nFetching via Repository methods:")
trainees = FirestoreRepository.get_trainees()
print(f"get_trainees() count: {len(trainees)}")

programmes = FirestoreRepository.get_programmes()
print(f"get_programmes() count: {len(programmes)}")

jobs = FirestoreRepository.get_jobs()
print(f"get_jobs() count: {len(jobs)}")

try:
    skills = FirestoreRepository.get_skills()
    print(f"get_skills() count: {len(skills)}")
except Exception as e:
    print(f"get_skills() failed: {e}")
    
try:
    interventions = FirestoreRepository.get_interventions()
    print(f"get_interventions() count: {len(interventions)}")
except Exception as e:
    print(f"get_interventions() failed: {e}")
