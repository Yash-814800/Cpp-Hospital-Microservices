#!/bin/bash

# Test Patient Service API

BASE_URL="http://localhost:8081/api/v1/patients"

echo "========================================="
echo "Testing Patient Service API"
echo "========================================="
echo ""

# Test 1: Create a new patient
echo "1. Creating a new patient..."
PATIENT_JSON='{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "address": "123 Main St, New York, NY 10001",
  "bloodGroup": "O+",
  "emergencyContact": "9876543210",
  "medicalHistory": "No major illnesses",
  "allergies": "None"
}'

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "$PATIENT_JSON")

echo "$CREATE_RESPONSE" | jq '.'
PATIENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
echo "Created patient with ID: $PATIENT_ID"
echo ""

# Test 2: Get all patients
echo "2. Getting all patients..."
curl -s -X GET "$BASE_URL" | jq '.'
echo ""

# Test 3: Get patient by ID
echo "3. Getting patient by ID: $PATIENT_ID..."
curl -s -X GET "$BASE_URL/$PATIENT_ID" | jq '.'
echo ""

# Test 4: Update patient
echo "4. Updating patient..."
UPDATE_JSON='{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.updated@example.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "address": "456 Updated Ave, New York, NY 10002",
  "bloodGroup": "O+",
  "emergencyContact": "9876543210",
  "medicalHistory": "Updated: Annual checkup completed",
  "allergies": "Peanuts"
}'

curl -s -X PUT "$BASE_URL/$PATIENT_ID" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_JSON" | jq '.'
echo ""

# Test 5: Search patients
echo "5. Searching for patients with 'John'..."
curl -s -X GET "$BASE_URL/search?query=John" | jq '.'
echo ""

# Test 6: Create another patient
echo "6. Creating another patient..."
PATIENT_JSON_2='{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "5555555555",
  "dateOfBirth": "1985-08-20",
  "gender": "FEMALE",
  "address": "789 Oak St, Los Angeles, CA 90001",
  "bloodGroup": "A+",
  "emergencyContact": "5554443333",
  "medicalHistory": "Diabetes Type 2",
  "allergies": "Penicillin"
}'

CREATE_RESPONSE_2=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "$PATIENT_JSON_2")

echo "$CREATE_RESPONSE_2" | jq '.'
PATIENT_ID_2=$(echo "$CREATE_RESPONSE_2" | jq -r '.data.id')
echo "Created second patient with ID: $PATIENT_ID_2"
echo ""

# Test 7: Get all patients again
echo "7. Getting all patients again (should show 2 patients)..."
curl -s -X GET "$BASE_URL" | jq '.'
echo ""

# Test 8: Delete a patient (soft delete)
echo "8. Deleting patient with ID: $PATIENT_ID..."
curl -s -X DELETE "$BASE_URL/$PATIENT_ID" | jq '.'
echo ""

# Test 9: Verify patient is deleted
echo "9. Verifying patient is deleted (should show only 1 patient)..."
curl -s -X GET "$BASE_URL" | jq '.'
echo ""

# Test 10: Try to get deleted patient (should return 404)
echo "10. Trying to get deleted patient (should return 404)..."
curl -s -X GET "$BASE_URL/$PATIENT_ID" | jq '.'
echo ""

echo "========================================="
echo "All tests completed!"
echo "========================================="
