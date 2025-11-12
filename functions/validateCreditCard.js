function validateCreditCard(cardNumber) {
  // Remove spaces or dashes
  cardNumber = cardNumber.replace(/\D/g, "");

  // Check if the card number has exactly 16 digits
  if (cardNumber.length !== 16) {
    return false;
  }

  let sum = 0;
  let alternate = false;

  // Loop through the digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cardNumber[i], 10);

    if (alternate) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }
    sum += n;
    alternate = !alternate;
  }

  // Valid if sum is divisible by 10
  return sum % 10 === 0;
}

// Example use:
console.log(validateCreditCard("4532015112830366")); // true (valid)
console.log(validateCreditCard("1234567890123456")); // false (invalid)
