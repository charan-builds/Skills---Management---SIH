import os
import json
import logging
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

from app.core.config import settings

logger = logging.getLogger(__name__)

db = None

def is_firebase_available() -> bool:
    return db is not None

if settings.ENABLE_DEMO_MODE:
    # Demo mode is deliberately self-contained. Do not initialize an available
    # Firebase credential here: otherwise demo activity could reach a live project.
    logger.info("Demo mode enabled; Firebase initialization is disabled.")
elif not firebase_admin._apps:
    service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    cred = None

    if service_account_json:
        try:
            cert_dict = json.loads(service_account_json)
            cred = credentials.Certificate(cert_dict)
            logger.info("Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT_JSON environment variable.")
        except Exception as e:
            logger.warning(f"Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

    if cred is None:
        cred_path = settings.get_firebase_credentials_path()
        if cred_path and Path(cred_path).exists() and Path(cred_path).is_file():
            try:
                cred = credentials.Certificate(cred_path)
                logger.info(f"Loaded Firebase credentials from file: {cred_path}")
            except Exception as e:
                logger.warning(f"Failed to load credentials from {cred_path}: {e}")

    if cred is not None:
        try:
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            logger.warning(f"Failed to initialize firebase_admin: {e}")
            db = None
    else:
        logger.warning("No valid Firebase credentials found.")
        db = None
else:
    try:
        db = firestore.client()
    except Exception as e:
        logger.warning(f"Failed to obtain existing firestore client: {e}")
        db = None
