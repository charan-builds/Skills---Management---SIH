import pytest
from unittest.mock import MagicMock

def test_production_firestore_isolation():
    """
    Ensures that write-oriented methods on Firestore are mocked
    so that tests cannot mutate production data.
    """
    from google.cloud.firestore_v1.document import DocumentReference
    
    # Create a dummy doc ref
    doc = DocumentReference("test", "test")
    
    # Call the mocked set method and expect RuntimeError
    with pytest.raises(RuntimeError) as exc_info:
        doc.set({"test": "data"})
    
    assert "ENABLE_DEMO_MODE failed" in str(exc_info.value)
