#!/bin/bash

# Test Doctor Service API

BASE_URL="http://localhost:8082/api/v1/doctors"

echo "========================================="
echo "Testing Doctor Service API"
echo "========================================="
echo ""

# Test 1: Create a new doctor
echo "1. Creating a new doctor (Cardiologist)..."
DOCTOR_JSON='{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@hospital.com",
  "phone": "1234567890",
  "licenseNumber": "MD-12345",
  "specialization": "Cardiology",
  "qualification": "MD, FACC - Harvard Medical School",
  "experienceYears": 15,
  "consultationFee": 200.00,
  "department": "Cardiology",
  "roomNumber": "C-301",
  "availableDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true
}'

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "$DOCTOR_JSON")

echo "$CREATE_RESPONSE" | jq '.'
DOCTOR_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
echo "Created doctor with ID: $DOCTOR_ID"
echo ""

# Test 2: Get all doctors
echo "2. Getting all doctors..."
curl -s -X GET "$BASE_URL" | jq '.'
echo ""

# Test 3: Get doctor by ID
echo "3. Getting doctor by ID: $DOCTOR_ID..."
curl -s -X GET "$BASE_URL/$DOCTOR_ID" | jq '.'
echo ""

# Test 4: Create another doctor (Neurologist)
echo "4. Creating another doctor (Neurologist)..."
DOCTOR_JSON_2='{
  "firstName": "Michael",
  "lastName": "Chen",
  "email": "michael.chen@hospital.com",
  "phone": "9876543210",
  "licenseNumber": "MD-67890",
  "specialization": "Neurology",
  "qualification": "MD, PhD - Johns Hopkins University",
  "experienceYears": 20,
  "consultationFee": 250.00,
  "department": "Neurology",
  "roomNumber": "N-201",
  "availableDays": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "startTime": "10:00",
  "endTime": "16:00",
  "isAvailable": true
}'

CREATE_RESPONSE_2=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "$DOCTOR_JSON_2")

echo "$CREATE_RESPONSE_2" | jq '.'
DOCTOR_ID_2=$(echo "$CREATE_RESPONSE_2" | jq -r '.data.id')
echo "Created second doctor with ID: $DOCTOR_ID_2"
echo ""

# Test 5: Create third doctor (Orthopedic)
echo "5. Creating third doctor (Orthopedic)..."
DOCTOR_JSON_3='{
  "firstName": "Emily",
  "lastName": "Rodriguez",
  "email": "emily.rodriguez@hospital.com",
  "phone": "5555555555",
  "licenseNumber": "MD-11111",
  "specialization": "Orthopedics",
  "qualification": "MD, FAAOS - Stanford Medical School",
  "experienceYears": 12,
  "consultationFee": 180.00,
  "department": "Orthopedics",
  "roomNumber": "O-105",
  "availableDays": ["TUESDAY", "THURSDAY", "SATURDAY"],
  "startTime": "08:00",
  "endTime": "14:00",
  "isAvailable": true
}'

CREATE_RESPONSE_3=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "$DOCTOR_JSON_3")

echo "$CREATE_RESPONSE_3" | jq '.'
DOCTOR_ID_3=$(echo "$CREATE_RESPONSE_3" | jq -r '.data.id')
echo ""

# Test 6: Get all doctors (should show 3)
echo "6. Getting all doctors (should show 3 doctors)..."
curl -s -X GET "$BASE_URL" | jq '.'
echo ""

# Test 7: Get doctors by specialization
echo "7. Getting doctors by specialization (Cardiology)..."
curl -s -X GET "$BASE_URL/specialization/Cardiology" | jq '.'
echo ""

# Test 8: Get doctors by department
echo "8. Getting doctors by department (Neurology)..."
curl -s -X GET "$BASE_URL/department/Neurology" | jq '.'
echo ""

# Test 9: Get available doctors
echo "9. Getting all available doctors..."
curl -s -X GET "$BASE_URL/available" | jq '.'
echo ""

# Test 10: Update doctor availability
echo "10. Updating doctor availability (setting to unavailable)..."
curl -s -X PATCH "$BASE_URL/$DOCTOR_ID/availability?isAvailable=false" | jq '.'
echo ""

# Test 11: Get available doctors again (should show 2)
echo "11. Getting available doctors again (should show 2)..."
curl -s -X GET "$BASE_URL/available" | jq '.'
echo ""

# Test 12: Update doctor
echo "12. Updating doctor information..."
UPDATE_JSON='{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@hospital.com",
  "phone": "1234567890",
  "licenseNumber": "MD-12345",
  "specialization": "Cardiology",
  "qualification": "MD, FACC, FSCAI - Harvard Medical School",
  "experienceYears": 16,
  "consultationFee": 225.00,
  "department": "Cardiology",
  "roomNumber": "C-301",
  "availableDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true
}'

curl -s -X PUT "$BASE_URL/$DOCTOR_ID" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_JSON" | jq '.'
echo ""

# Test 13: Search doctors
echo "13. Searching for doctors with 'Chen'..."
curl -s -X GET "$BASE_URL/search?query=Chen" | jq '.'
echo ""

# Test 14: Search by specialization
echo "14. Searching for doctors with 'Ortho'..."
curl -s -X GET "$BASE_URL/search?query=Ortho" | jq '.'
echo ""

# Test 15: Delete a doctor (soft delete)
echo "15. Deleting doctor with ID: $DOCTOR_ID_3..."
curl -s -X DELETE "$BASE_URL/$DOCTOR_ID_3" | jq '.'
echo ""

# Test 16: Verify deletion (should show 2 doctors)
echo "16. Getting all doctors (should show 2 active doctors)..."
curl -s -X GET "$BASE_URL" | jq '.'
echo ""

# Test 17: Try to get deleted doctor (should return 404)
echo "17. Trying to get deleted doctor (should return 404)..."
curl -s -X GET "$BASE_URL/$DOCTOR_ID_3" | jq '.'
echo ""

echo "========================================="
echo "All tests completed!"
echo "========================================="
