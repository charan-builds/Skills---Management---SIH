import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

from app.core.config import settings


if not firebase_admin._apps:
    service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        try:
            cert_dict = json.loads(service_account_json)
            cred = credentials.Certificate(cert_dict)
        except Exception:
            cred_path = settings.get_firebase_credentials_path()
            cred = credentials.Certificate(cred_path)
    else:
        cred_path = settings.get_firebase_credentials_path()
        cred = credentials.Certificate(cred_path)

    firebase_admin.initialize_app(cred)

db = firestore.client()