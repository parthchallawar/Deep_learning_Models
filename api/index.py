import sys
import os

# Append paths absolutely so that Vercel finds both backend module and root dependencies
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, ".."))
sys.path.append(os.path.join(BASE_DIR, "..", "backend"))

from backend.main import app
