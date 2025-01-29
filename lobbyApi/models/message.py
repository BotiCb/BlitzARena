from typing import Any, Dict

class Message:
    def __init__(self, message_dict: Dict[str, Any]):
        if not isinstance(message_dict, dict):
            raise ValueError("Message must be a dictionary.")

        self.type = message_dict.get("type")
        self.data = message_dict.get("data")

        if self.type is None:
            raise ValueError("Message is missing the 'type' field.")

    def to_dict(self) -> Dict[str, Any]:
        """Convert the message back to a dictionary."""
        return {"type": self.type, "data": self.data}
