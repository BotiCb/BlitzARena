import re

def snake_to_camel(snake_str: str) -> str:
    """Converts a snake_case string to camelCase."""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def convert_dict_to_camel_case(input_data) -> any:
    """Recursively converts all keys in nested structures to camelCase."""
    if isinstance(input_data, dict):
        return {
            snake_to_camel(key): convert_dict_to_camel_case(value)
            for key, value in input_data.items()
        }
    elif isinstance(input_data, list):
        return [convert_dict_to_camel_case(item) for item in input_data]
    elif hasattr(input_data, '__dict__'):
        return convert_dict_to_camel_case(vars(input_data))
    else:
        return input_data


def camel_to_snake(camel_str: str) -> str:
    """Converts a camelCase string to snake_case."""
    return re.sub(r'(?<!^)(?=[A-Z])', '_', camel_str).lower()


def convert_dict_to_snake_case(input_data) -> any:
    """Recursively converts all keys in nested structures to snake_case."""
    if isinstance(input_data, dict):
        return {
            camel_to_snake(key): convert_dict_to_snake_case(value)
            for key, value in input_data.items()
        }
    elif isinstance(input_data, list):
        return [convert_dict_to_snake_case(item) for item in input_data]
    elif hasattr(input_data, '__dict__'):
        return convert_dict_to_snake_case(vars(input_data))
    else:
        return input_data