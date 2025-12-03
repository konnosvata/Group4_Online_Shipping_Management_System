"""
Michalis – Core Field Validation module

Used to validate common fields before inserting into the database:
- Required fields
- Email format
- Password strength
- Credit card number (Luhn)
- Generic validate_input() for any form
"""

import re

def is_not_empty(value: str) -> bool:
    """Check if a value is not empty or just spaces."""
    return bool(value and str(value).strip())

def is_valid_email(email: str) -> bool:
    """Basic email format validation."""
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None

def is_strong_password(password: str) -> bool:
    """
    Password is considered strong if:
    - At least 8 characters
    - Has uppercase
    - Has lowercase
    - Has a digit
    - Has a special character
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True

def is_valid_credit_card(number: str) -> bool:
    """
    Simple credit card number validation using the Luhn algorithm.
    Accepts digits with or without spaces.
    """
    number = str(number).replace(" ", "")
    if not number.isdigit():
        return False

    total = 0
    reverse_digits = number[::-1]

    for i, d in enumerate(reverse_digits):
        n = int(d)
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        total += n

    return total % 10 == 0

def validate_input(data: dict, required_fields: list, field_types: dict | None = None) -> dict:
    """
    Generic input validator.

    - data: dict with the input (e.g., JSON from request)
    - required_fields: list of required field names
    - field_types: optional dict { field_name: "email"/"password"/"credit_card" }

    Returns:
        errors: dict { field_name: "error message" }
    """
    errors: dict[str, str] = {}

    # Required + empty checks
    for field in required_fields:
        value = data.get(field, "")
        if not is_not_empty(value):
            errors[field] = "This field is required."
            continue  # no need to further validate empty fields

    if field_types:
        for field, ftype in field_types.items():
            if field in errors:
                continue  # skip fields already failing required check

            value = data.get(field, "")

            if ftype == "email" and not is_valid_email(value):
                errors[field] = "Invalid email format."

            elif ftype == "password" and not is_strong_password(value):
                errors[field] = "Password is too weak."

            elif ftype == "credit_card" and not is_valid_credit_card(value):
                errors[field] = "Invalid credit card number."

    return errors
