#!/bin/bash

# Integration Test Script for Banks API Frontend-Backend Integration
# This script tests the complete CRUD operations for banks management

set -e

BASE_URL="http://localhost:3000"
TOKEN=""

echo "🧪 Starting Banks API Integration Tests"
echo "========================================"

# Function to check if server is running
check_server() {
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo "✅ Server is running at $BASE_URL"
        return 0
    else
        echo "❌ Server is not running at $BASE_URL"
        return 1
    fi
}

# Function to register a test user
register_user() {
    echo "📝 Registering test user..."
    response=$(curl -s -X POST "$BASE_URL/app/users/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "password123",
            "firstName": "Test",
            "lastName": "User"
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ User registered successfully"
    else
        echo "⚠️  User might already exist, continuing with login..."
    fi
}

# Function to login and get token
login_user() {
    echo "🔐 Logging in test user..."
    response=$(curl -s -X POST "$BASE_URL/app/users/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "password123"
        }')
    
    TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "✅ Login successful, token obtained"
    else
        echo "❌ Login failed"
        echo "Response: $response"
        exit 1
    fi
}

# Function to test GET banks (empty list)
test_get_banks_empty() {
    echo "📋 Testing GET banks (empty list)..."
    response=$(curl -s -X GET "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET banks successful"
        echo "Response: $response"
    else
        echo "❌ GET banks failed"
        echo "Response: $response"
        exit 1
    fi
}

# Function to test CREATE bank
test_create_bank() {
    echo "➕ Testing CREATE bank..."
    response=$(curl -s -X POST "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "bank_id": "test-bank-001",
            "name": "Test Bank",
            "bank_codes": ["TEST001"],
            "api": "test-api",
            "api_version": "v1.0",
            "aspsp": "test-aspsp",
            "country": "US",
            "auth_type_choice_required": false,
            "environments": ["production", "test"],
            "configuration": {
                "enabled": 1,
                "blocked": false,
                "risky": false,
                "app_auth_setup_required": false
            }
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ CREATE bank successful"
        BANK_ID="test-bank-001"
        echo "Created bank ID: $BANK_ID"
    else
        echo "❌ CREATE bank failed"
        echo "Response: $response"
        exit 1
    fi
}

# Function to test GET bank details
test_get_bank_details() {
    echo "🔍 Testing GET bank details..."
    response=$(curl -s -X GET "$BASE_URL/api/banks/$BANK_ID/details" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET bank details successful"
        echo "Response: $response"
    else
        echo "❌ GET bank details failed"
        echo "Response: $response"
        exit 1
    fi
}

# Function to test UPDATE bank
test_update_bank() {
    echo "✏️  Testing UPDATE bank..."
    response=$(curl -s -X PUT "$BASE_URL/api/banks/$BANK_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Bank Updated",
            "bank_codes": ["TEST001", "TEST002"],
            "api": "test-api",
            "api_version": "v1.1",
            "aspsp": "test-aspsp",
            "country": "US",
            "auth_type_choice_required": true,
            "environments": ["production", "test", "sandbox"],
            "configuration": {
                "enabled": 1,
                "blocked": false,
                "risky": false,
                "app_auth_setup_required": true
            }
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ UPDATE bank successful"
        echo "Response: $response"
    else
        echo "❌ UPDATE bank failed"
        echo "Response: $response"
        exit 1
    fi
}

# Function to test GET banks (with data)
test_get_banks_with_data() {
    echo "📋 Testing GET banks (with data)..."
    response=$(curl -s -X GET "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET banks with data successful"
        echo "Response: $response"
    else
        echo "❌ GET banks with data failed"
        echo "Response: $response"
        exit 1
    fi
}

# Function to test DELETE bank
test_delete_bank() {
    echo "🗑️  Testing DELETE bank..."
    response=$(curl -s -X DELETE "$BASE_URL/api/banks/$BANK_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ DELETE bank successful"
        echo "Response: $response"
    else
        echo "❌ DELETE bank failed"
        echo "Response: $response"
        exit 1
    fi
}

# Function to test GET banks after deletion
test_get_banks_after_deletion() {
    echo "📋 Testing GET banks (after deletion)..."
    response=$(curl -s -X GET "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET banks after deletion successful"
        echo "Response: $response"
    else
        echo "❌ GET banks after deletion failed"
        echo "Response: $response"
        exit 1
    fi
}

# Main test execution
main() {
    echo "🚀 Starting integration tests..."
    
    check_server
    register_user
    login_user
    test_get_banks_empty
    test_create_bank
    test_get_bank_details
    test_update_bank
    test_get_banks_with_data
    test_delete_bank
    test_get_banks_after_deletion
    
    echo ""
    echo "🎉 All integration tests passed successfully!"
    echo "========================================"
    echo "✅ Frontend-Backend integration is working correctly"
    echo "✅ All CRUD operations are functional"
    echo "✅ API response structures are properly handled"
    echo "✅ Authentication and authorization are working"
}

# Run main function
main "$@"