def validate_credit_card(card_number: str) -> bool:
    # Remove any non-digit characters (spaces, dashes)
    card_number = ''.join(filter(str.isdigit, card_number))

    # Check if it's exactly 16 digits
    if len(card_number) != 16:
        return False

    total = 0
    alternate = False

    # Luhn Algorithm
    for digit in reversed(card_number):
        n = int(digit)
        if alternate:
            n *= 2
            if n > 9:
                n -= 9
        total += n
        alternate = not alternate

    return total % 10 == 0


# Example use
print(validate_credit_card("4532015112830366"))  # True
print(validate_credit_card("1234567890123456"))  # False
