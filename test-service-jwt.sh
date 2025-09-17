#!/bin/bash

# Service JWT Test Script for Banks API
# This script creates a proper service JWT and tests the banks API

set -e

BASE_URL="http://localhost:3000"
TOKEN=""

echo "🧪 Testing Banks API with Service JWT"
echo "======================================="

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

# Function to create a service JWT using Node.js
create_service_jwt() {
    echo "🔐 Creating service JWT..."
    
    # Create a temporary Node.js script to generate the JWT
    cat > /tmp/generate_jwt.js << 'EOF'
const { SignJWT } = require('jose');
const crypto = require('crypto');

// JWT Configuration
const secret = 'your-super-secret-jwt-key-at-least-32-characters-long';
const secretKey = new TextEncoder().encode(secret);

async function generateServiceJWT() {
    const jwt = new SignJWT({
        sub: 'service-auth',
        service_type: 'internal',
        permissions: ['BANKS_READ', 'BANKS_WRITE'],
        environment: 'development'
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('bank-service')
    .setExpirationTime('24h')
    .setAudience('bank-api');

    const token = await jwt.sign(secretKey);
    console.log(token);
}

generateServiceJWT().catch(console.error);
EOF

    # Generate the JWT
    TOKEN=$(node /tmp/generate_jwt.js 2>/dev/null)
    
    if [ -n "$TOKEN" ]; then
        echo "✅ Service JWT created successfully"
        echo "Token: ${TOKEN:0:50}..."
    else
        echo "❌ Failed to create service JWT"
        return 1
    fi
    
    # Clean up
    rm -f /tmp/generate_jwt.js
}

# Function to test GET banks
test_get_banks() {
    echo "📋 Testing GET banks..."
    response=$(curl -s -X GET "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "GET banks response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET banks successful"
        
        # Count banks
        count=$(echo "$response" | grep -o '"bank_id"' | wc -l)
        echo "📊 Found $count banks in database"
    else
        echo "❌ GET banks failed"
        return 1
    fi
}

# Function to test GET bank details
test_get_bank_details() {
    echo "🔍 Testing GET bank details..."
    
    # First get a bank ID from the list
    response=$(curl -s -X GET "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN")
    
    # Extract first bank ID
    bank_id=$(echo "$response" | grep -o '"bank_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$bank_id" ]; then
        echo "❌ No bank ID found in response"
        return 1
    fi
    
    echo "Testing with bank ID: $bank_id"
    
    response=$(curl -s -X GET "$BASE_URL/api/banks/$bank_id/details" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "GET bank details response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET bank details successful"
    else
        echo "❌ GET bank details failed"
        return 1
    fi
}

# Function to test GET bank groups
test_get_bank_groups() {
    echo "🏦 Testing GET bank groups..."
    response=$(curl -s -X GET "$BASE_URL/api/bank-groups" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "GET bank groups response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET bank groups successful"
        
        # Count groups
        count=$(echo "$response" | grep -o '"group_id"' | wc -l)
        echo "📊 Found $count bank groups in database"
    else
        echo "❌ GET bank groups failed"
        return 1
    fi
}

# Function to test CREATE bank
test_create_bank() {
    echo "➕ Testing CREATE bank..."
    response=$(curl -s -X POST "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "bank_id": "integration-test-bank-001",
            "name": "Integration Test Bank",
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
    
    echo "CREATE bank response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ CREATE bank successful"
        BANK_ID="integration-test-bank-001"
    else
        echo "❌ CREATE bank failed"
        return 1
    fi
}

# Function to test UPDATE bank
test_update_bank() {
    echo "✏️  Testing UPDATE bank..."
    response=$(curl -s -X PUT "$BASE_URL/api/banks/$BANK_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Integration Test Bank Updated",
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
    
    echo "UPDATE bank response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ UPDATE bank successful"
    else
        echo "❌ UPDATE bank failed"
        return 1
    fi
}

# Function to test DELETE bank
test_delete_bank() {
    echo "🗑️  Testing DELETE bank..."
    response=$(curl -s -X DELETE "$BASE_URL/api/banks/$BANK_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "DELETE bank response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ DELETE bank successful"
    else
        echo "❌ DELETE bank failed"
        return 1
    fi
}

# Main test execution
main() {
    echo "🚀 Starting service JWT API tests..."
    
    check_server
    create_service_jwt
    test_get_banks
    test_get_bank_details
    test_get_bank_groups
    test_create_bank
    test_update_bank
    test_delete_bank
    
    echo ""
    echo "🎉 All service JWT API tests passed successfully!"
    echo "======================================="
    echo "✅ API endpoints are working correctly"
    echo "✅ Service authentication is working"
    echo "✅ All CRUD operations are functional"
    echo "✅ Database integration is working"
    echo "✅ Frontend can now connect to backend with proper JWT"
}

# Run main function
main "$@"