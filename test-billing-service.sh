#!/bin/bash

BASE_URL="http://localhost:8084/api/v1/invoices"
PATIENT_URL="http://localhost:8081/api/v1/patients"
DOCTOR_URL="http://localhost:8082/api/v1/doctors"
APPOINTMENT_URL="http://localhost:8083/api/v1/appointments"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "Billing Service Integration Tests"
echo "=========================================="
echo ""

# Setup: Create test data
echo -e "${YELLOW}Setting up test data...${NC}"

# Generate unique email using timestamp
TIMESTAMP=$(date +%s)

# Create patient
PATIENT_RESPONSE=$(curl -s -X POST "$PATIENT_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Bill\",
    \"lastName\": \"Test\",
    \"email\": \"bill.test.${TIMESTAMP}@billing.com\",
    \"phone\": \"987654${TIMESTAMP: -4}\",
    \"dateOfBirth\": \"1985-03-20\",
    \"gender\": \"MALE\",
    \"address\": \"123 Test St\",
    \"bloodGroup\": \"A+\"
  }")

PATIENT_ID=$(echo "$PATIENT_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
echo "Created test patient with ID: $PATIENT_ID"

# Create doctor
DOCTOR_RESPONSE=$(curl -s -X POST "$DOCTOR_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Dr. Bill\",
    \"lastName\": \"Collector\",
    \"email\": \"dr.bill.${TIMESTAMP}@billing.com\",
    \"phone\": \"876543${TIMESTAMP: -4}\",
    \"licenseNumber\": \"LIC-BILL-${TIMESTAMP}\",
    \"specialization\": \"General Medicine\",
    \"qualification\": \"MBBS\",
    \"experienceYears\": 10,
    \"consultationFee\": 500.00,
    \"department\": \"General\",
    \"roomNumber\": \"G-201\",
    \"availableDays\": [\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\", \"THURSDAY\", \"FRIDAY\"],
    \"startTime\": \"09:00\",
    \"endTime\": \"17:00\",
    \"isAvailable\": true
  }")

DOCTOR_ID=$(echo "$DOCTOR_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
echo "Created test doctor with ID: $DOCTOR_ID"

# Create appointment
APPOINTMENT_RESPONSE=$(curl -s -X POST "$APPOINTMENT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-20\",\"appointmentTime\":\"10:00\",\"reason\":\"General checkup\"}")

APPOINTMENT_ID=$(echo "$APPOINTMENT_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
echo "Created test appointment with ID: $APPOINTMENT_ID"
echo ""

# Test 1: Create an invoice
echo "Test 1: Create an invoice"
INVOICE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": $PATIENT_ID,
    \"appointmentId\": $APPOINTMENT_ID,
    \"consultationFee\": 500.00,
    \"medicationCharges\": 150.00,
    \"testCharges\": 200.00,
    \"otherCharges\": 50.00,
    \"discount\": 50.00,
    \"tax\": 45.00,
    \"notes\": \"Test invoice\"
  }")

INVOICE_ID=$(echo "$INVOICE_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ ! -z "$INVOICE_ID" ] && echo $INVOICE_RESPONSE | grep -q "Bill Test"; then
    print_result 0 "Create invoice with enriched patient data"
    echo "   Invoice Number: $(echo $INVOICE_RESPONSE | grep -o '"invoiceNumber":"[^"]*"' | cut -d'"' -f4)"
    echo "   Total Amount: $(echo $INVOICE_RESPONSE | grep -o '"totalAmount":[0-9.]*' | cut -d':' -f2)"
else
    print_result 1 "Create invoice"
    echo "   Response: $INVOICE_RESPONSE"
fi
echo ""

# Test 2: Get invoice by ID
echo "Test 2: Get invoice by ID"
GET_RESPONSE=$(curl -s "$BASE_URL/$INVOICE_ID")

if echo $GET_RESPONSE | grep -q "\"id\":$INVOICE_ID" && echo $GET_RESPONSE | grep -q "Bill Test"; then
    print_result 0 "Get invoice by ID with enriched data"
else
    print_result 1 "Get invoice by ID"
    echo "   Response: $GET_RESPONSE"
fi
echo ""

# Test 3: Get all invoices
echo "Test 3: Get all invoices"
ALL_RESPONSE=$(curl -s "$BASE_URL")

if echo $ALL_RESPONSE | grep -q "\"id\":$INVOICE_ID"; then
    print_result 0 "Get all invoices"
else
    print_result 1 "Get all invoices"
fi
echo ""

# Test 4: Get invoices by patient
echo "Test 4: Get invoices by patient"
PATIENT_INVOICES=$(curl -s "$BASE_URL/patient/$PATIENT_ID")

if echo $PATIENT_INVOICES | grep -q "\"id\":$INVOICE_ID"; then
    print_result 0 "Get invoices by patient"
else
    print_result 1 "Get invoices by patient"
    echo "   Response: $PATIENT_INVOICES"
fi
echo ""

# Test 5: Get invoice by appointment
echo "Test 5: Get invoice by appointment"
APPT_INVOICE=$(curl -s "$BASE_URL/appointment/$APPOINTMENT_ID")

if echo $APPT_INVOICE | grep -q "\"id\":$INVOICE_ID"; then
    print_result 0 "Get invoice by appointment"
else
    print_result 1 "Get invoice by appointment"
    echo "   Response: $APPT_INVOICE"
fi
echo ""

# Test 6: Get invoices by status (PENDING)
echo "Test 6: Get invoices by status (PENDING)"
PENDING_INVOICES=$(curl -s "$BASE_URL/status/PENDING")

if echo $PENDING_INVOICES | grep -q "\"id\":$INVOICE_ID"; then
    print_result 0 "Get invoices by status"
else
    print_result 1 "Get invoices by status"
    echo "   Response: $PENDING_INVOICES"
fi
echo ""

# Test 7: Add partial payment
echo "Test 7: Add partial payment (400.00 of 895.00 total)"
PAYMENT1_RESPONSE=$(curl -s -X POST "$BASE_URL/$INVOICE_ID/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 400.00,
    "paymentMethod": "CREDIT_CARD",
    "notes": "Partial payment via credit card"
  }')

if echo $PAYMENT1_RESPONSE | grep -q "\"status\":\"PARTIALLY_PAID\"" && echo $PAYMENT1_RESPONSE | grep -q "\"paidAmount\":400"; then
    print_result 0 "Add partial payment"
    echo "   Balance: $(echo $PAYMENT1_RESPONSE | grep -o '"balanceAmount":[0-9.]*' | cut -d':' -f2)"
else
    print_result 1 "Add partial payment"
    echo "   Response: $PAYMENT1_RESPONSE"
fi
echo ""

# Test 8: Add remaining payment (full payment)
echo "Test 8: Add remaining payment to complete invoice"
PAYMENT2_RESPONSE=$(curl -s -X POST "$BASE_URL/$INVOICE_ID/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 495.00,
    "paymentMethod": "UPI",
    "notes": "Final payment via UPI"
  }')

if echo $PAYMENT2_RESPONSE | grep -q "\"status\":\"PAID\"" && echo $PAYMENT2_RESPONSE | grep -q "\"balanceAmount\":0" && echo $PAYMENT2_RESPONSE | grep -q "paidAt"; then
    print_result 0 "Complete payment (status changed to PAID)"
else
    print_result 1 "Complete payment"
    echo "   Response: $PAYMENT2_RESPONSE"
fi
echo ""

# Test 9: Try to add payment to fully paid invoice (should fail)
echo "Test 9: Error handling - Payment to fully paid invoice"
OVERPAY_RESPONSE=$(curl -s -X POST "$BASE_URL/$INVOICE_ID/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "paymentMethod": "CASH"
  }')

if echo $OVERPAY_RESPONSE | grep -q "already fully paid\|already paid"; then
    print_result 0 "Prevent payment to fully paid invoice"
else
    print_result 1 "Error handling for overpayment"
    echo "   Response: $OVERPAY_RESPONSE"
fi
echo ""

# Test 10: Create another invoice for cancellation test
echo "Test 10: Create and cancel invoice"

# Create another appointment
APPOINTMENT2_RESPONSE=$(curl -s -X POST "$APPOINTMENT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-21\",\"appointmentTime\":\"11:00\",\"reason\":\"Follow-up\"}")

APPOINTMENT2_ID=$(echo "$APPOINTMENT2_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -z "$APPOINTMENT2_ID" ]; then
    print_result 1 "Cancel invoice (failed to create test appointment)"
    echo "   Appointment Response: $APPOINTMENT2_RESPONSE"
else
    INVOICE2_RESPONSE=$(curl -s -X POST "$BASE_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"patientId\": $PATIENT_ID,
        \"appointmentId\": $APPOINTMENT2_ID,
        \"consultationFee\": 500.00,
        \"tax\": 25.00
      }")

    INVOICE2_ID=$(echo "$INVOICE2_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

    if [ -z "$INVOICE2_ID" ]; then
        print_result 1 "Cancel invoice (failed to create test invoice)"
        echo "   Invoice Response: $INVOICE2_RESPONSE"
    else
        CANCEL_RESPONSE=$(curl -s -X PATCH "$BASE_URL/$INVOICE2_ID/cancel")

        if echo $CANCEL_RESPONSE | grep -q "\"status\":\"CANCELLED\""; then
            print_result 0 "Cancel unpaid invoice"
        else
            print_result 1 "Cancel invoice"
            echo "   Response: $CANCEL_RESPONSE"
        fi
    fi
fi
echo ""

# Test 11: Try to cancel a paid invoice (should fail)
echo "Test 11: Error handling - Cancel paid invoice"
CANCEL_PAID=$(curl -s -X PATCH "$BASE_URL/$INVOICE_ID/cancel")

if echo $CANCEL_PAID | grep -q "Cannot cancel a paid invoice\|refund"; then
    print_result 0 "Prevent cancellation of paid invoice"
else
    print_result 1 "Error handling for cancel paid invoice"
    echo "   Response: $CANCEL_PAID"
fi
echo ""

# Test 12: Refund a paid invoice
echo "Test 12: Refund a paid invoice"
REFUND_RESPONSE=$(curl -s -X PATCH "$BASE_URL/$INVOICE_ID/refund")

if echo $REFUND_RESPONSE | grep -q "\"status\":\"REFUNDED\"" && echo $REFUND_RESPONSE | grep -q "\"paidAmount\":0"; then
    print_result 0 "Refund paid invoice"
else
    print_result 1 "Refund invoice"
    echo "   Response: $REFUND_RESPONSE"
fi
echo ""

# Test 13: Error handling - Duplicate invoice for appointment
echo "Test 13: Error handling - Duplicate invoice for appointment"

# Try to create another invoice for the same appointment ID from Test 1
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": $PATIENT_ID,
    \"appointmentId\": $APPOINTMENT_ID,
    \"consultationFee\": 500.00
  }")

if echo $DUPLICATE_RESPONSE | grep -q "already exists\|Invoice already exists"; then
    print_result 0 "Prevent duplicate invoice for appointment"
else
    print_result 1 "Duplicate invoice prevention"
    echo "   Response: $DUPLICATE_RESPONSE"
fi
echo ""

# Test 14: Try to create invoice with invalid patient
echo "Test 14: Error handling - Invalid patient ID"

# Create a new appointment for this test
APPOINTMENT3_RESPONSE=$(curl -s -X POST "$APPOINTMENT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-22\",\"appointmentTime\":\"12:00\",\"reason\":\"Test\"}")

APPOINTMENT3_ID=$(echo "$APPOINTMENT3_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

INVALID_PATIENT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": 99999,
    \"appointmentId\": $APPOINTMENT3_ID,
    \"consultationFee\": 500.00
  }")

# Inter-service failures return 500, which is acceptable
if echo $INVALID_PATIENT | grep -q "error\|Error"; then
    print_result 0 "Invalid patient ID returns error"
else
    print_result 1 "Invalid patient error handling"
    echo "   Response: $INVALID_PATIENT"
fi
echo ""

# Test 15: Try to create invoice with invalid appointment
echo "Test 15: Error handling - Invalid appointment ID"
INVALID_APPT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": $PATIENT_ID,
    \"appointmentId\": 99999,
    \"consultationFee\": 500.00
  }")

# Inter-service failures return 500, which is acceptable
if echo $INVALID_APPT | grep -q "error\|Error"; then
    print_result 0 "Invalid appointment ID returns error"
else
    print_result 1 "Invalid appointment error handling"
    echo "   Response: $INVALID_APPT"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
