from typing import Any

# Temporary in-memory storage.
# Sessions are lost when the application restarts.
sessions: dict[str, dict[str, Any]] = {}