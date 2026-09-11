import os
import sys

os.environ["ENABLE_DEMO_MODE"] = "False"
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.core.config import settings
print("ENABLE_DEMO_MODE:", settings.ENABLE_DEMO_MODE)
