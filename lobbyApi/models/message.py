from typing import Any, Dict

from utils.dto_convention_converter import convert_dict_to_snake_case


class Message:
    def __init__(self, message_dict: Dict[str, Any]):
        if not isinstance(message_dict, dict):
            raise ValueError("Message must be a dictionary.")
        message = convert_dict_to_snake_case(message_dict)
        self.type = message.get("type")
        self.data = message.get("data")

        if self.type is None:
            raise ValueError("Message is missing the 'type' field.")



    def to_dict(self) -> Dict[str, Any]:
        """Convert the message back to a dictionary."""
        return {"type": self.type, "data": self.data}
