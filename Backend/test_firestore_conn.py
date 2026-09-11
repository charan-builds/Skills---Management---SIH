import os
import sys
import argparse

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ["ENABLE_DEMO_MODE"] = "False"

try:
    from app.firebase.config import db
    from firebase_admin import get_app
    
    app = get_app()
    project_id = app.project_id or "Unknown"
    
    print("Firebase initialization: PASS")
    print(f"Detected project: {project_id}")
    
    # Check explicitly if it matches an operator arg
    parser = argparse.ArgumentParser()
    parser.add_argument("--confirm-env", type=str, required=False)
    args = parser.parse_args()
    
    if args.confirm_env and args.confirm_env != project_id:
        print(f"ERROR: Detected project '{project_id}' does not match confirmed project '{args.confirm_env}'")
        sys.exit(1)
        
    if not db:
        print("Firestore connectivity: FAILED (db is None)")
        sys.exit(1)
        
    try:
        # Harmless read
        docs = list(db.collection("trainees").limit(1).stream())
        print("Firestore connectivity: PASS")
        print("Read-only operation: PASS")
        print("Write operation: NOT EXECUTED")
    except Exception as e:
        print(f"Firestore connectivity: FAILED ({e})")
        sys.exit(1)
        
except ValueError as e:
    print("Firebase initialization: FAILED")
    print(f"Error: {e}")
    sys.exit(1)
except Exception as e:
    print("Firebase initialization: FAILED")
    print(f"Error: {e}")
    sys.exit(1)
