# Test Cases for Registration Validation (Michalis)

## Test 1 - Valid Registration
POST /api/register
{
  "name": "Michalis",
  "email": "michalis@example.com",
  "password": "StrongP@ss1"
}
Expected: 201 Created

---

## Test 2 - Weak Password
{
  "name": "Test",
  "email": "test@example.com",
  "password": "123"
}
Expected: 400 (Password too weak)

---

## Test 3 - Invalid Email
{
  "name": "Test",
  "email": "wrong-email",
  "password": "StrongP@ss1"
}
Expected: 400 (Invalid email format)

---

## Test 4 - Missing Fields
{
  "name": "",
  "email": "",
  "password": ""
}
Expected: 400 (Fields required)

---

## Test 5 - Duplicate Email
Register same email twice
Expected: 400 (Email already registered)
