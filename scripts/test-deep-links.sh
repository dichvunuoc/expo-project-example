#!/bin/bash

# Deep Link Testing Script
# This script demonstrates how to test deep links with Expo

echo "🔗 Deep Link Testing Script"
echo "================================"

# App configuration
SCHEME=${1:-"expoapp"}  # Default to 'expoapp' if no argument provided
HOST=${2:-"expoapp.example.com"}

echo "App Configuration:"
echo "  Scheme: $SCHEME"
echo "  Host: $HOST"
echo ""

# Test URLs
declare -a TEST_URLS=(
    # User profile URLs
    "$SCHEME://user/123"
    "$SCHEME://user/456?source=email&tab=posts"
    "$SCHEME://user/789?message=Welcome+back!"
    
    # Universal links for user profiles
    "https://$HOST/user/123"
    "https://$HOST/user/456?source=email"
    
    # Product URLs
    "$SCHEME://product/prod123?from=search"
    "$SCHEME://product/prod456/review"
    "https://$HOST/product/prod789?category=electronics"
    
    # Authentication URLs
    "$SCHEME://auth"
    "$SCHEME://auth/register"
    "$SCHEME://auth/verify/abc123def456"
    "https://$HOST/auth/reset?token=reset789"
    
    # Content URLs
    "$SCHEME://blog/post123?category=tech"
    "$SCHEME://category/mobile-dev"
    "$SCHEME://search?query=react+native"
    
    # Settings URLs
    "$SCHEME://settings/profile"
    "$SCHEME://settings/notifications?theme=dark"
    
    # Social URLs
    "$SCHEME://invite/invite123abc"
    "$SCHEME://share/product/prod123"
    "$SCHEME://ref/referral456def"
)

# Test function
test_deep_link() {
    local url="$1"
    echo "🚀 Testing: $url"
    
    if command -v npx &> /dev/null; then
        npx uri-scheme open "$url"
        echo "✅ Opened successfully"
    else
        echo "❌ npx not found. Please install Node.js and npm."
        echo "💡 Alternative: adb shell am start -W -a android.intent.action.VIEW -d '$url' com.example.app"
    fi
    echo ""
}

# Menu for interactive testing
show_menu() {
    echo "📱 Deep Link Testing Menu:"
    echo "1. Test User Profile URLs"
    echo "2. Test Product URLs"
    echo "3. Test Authentication URLs"
    echo "4. Test Content URLs"
    echo "5. Test Settings URLs"
    echo "6. Test Social URLs"
    echo "7. Test All URLs"
    echo "8. Custom URL"
    echo "9. Exit"
    echo ""
    read -p "Choose an option (1-9): " choice
    
    case $choice in
        1)
            echo "👤 Testing User Profile URLs..."
            test_deep_link "$SCHEME://user/123"
            test_deep_link "$SCHEME://user/456?source=email&tab=posts"
            test_deep_link "https://$HOST/user/789?message=Welcome+back!"
            ;;
        2)
            echo "🛍️ Testing Product URLs..."
            test_deep_link "$SCHEME://product/prod123"
            test_deep_link "$SCHEME://product/prod456/review"
            test_deep_link "https://$HOST/product/prod789?category=electronics"
            ;;
        3)
            echo "🔐 Testing Authentication URLs..."
            test_deep_link "$SCHEME://auth"
            test_deep_link "$SCHEME://auth/register"
            test_deep_link "$SCHEME://auth/verify/abc123def456"
            test_deep_link "https://$HOST/auth/reset?token=reset789"
            ;;
        4)
            echo "📄 Testing Content URLs..."
            test_deep_link "$SCHEME://blog/post123"
            test_deep_link "$SCHEME://category/mobile-dev"
            test_deep_link "$SCHEME://search?query=react+native"
            ;;
        5)
            echo "⚙️ Testing Settings URLs..."
            test_deep_link "$SCHEME://settings/profile"
            test_deep_link "$SCHEME://settings/notifications?theme=dark"
            ;;
        6)
            echo "🔗 Testing Social URLs..."
            test_deep_link "$SCHEME://invite/invite123abc"
            test_deep_link "$SCHEME://share/product/prod123"
            test_deep_link "$SCHEME://ref/referral456def"
            ;;
        7)
            echo "🌐 Testing All URLs..."
            for url in "${TEST_URLS[@]}"; do
                test_deep_link "$url"
                sleep 2  # Brief pause between tests
            done
            ;;
        8)
            read -p "Enter custom URL: " custom_url
            test_deep_link "$custom_url"
            ;;
        9)
            echo "👋 Exiting..."
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-9."
            ;;
    esac
}

# Check if arguments are provided
if [ $# -eq 0 ]; then
    # No arguments, show interactive menu
    show_menu
else
    # Arguments provided, test directly
    echo "🎯 Direct testing with provided arguments"
    echo ""
    
    if [ "$3" = "all" ]; then
        # Test all URLs
        for url in "${TEST_URLS[@]}"; do
            test_deep_link "$url"
        done
    else
        # Test specific URL
        test_deep_link "$1"
    fi
fi

# Additional testing commands for different platforms
echo "📋 Additional Testing Commands:"
echo ""
echo "🤖 Android Testing:"
echo "  adb shell am start -W -a android.intent.action.VIEW -d '$SCHEME://user/123' com.company.expoapp"
echo "  adb shell am start -W -a android.intent.action.VIEW -d 'https://$HOST/user/123' com.company.expoapp"
echo ""
echo "🍎 iOS Testing (with Xcode):"
echo "  xcrun simctl openurl booted '$SCHEME://user/123'"
echo "  xcrun simctl openurl booted 'https://$HOST/user/123'"
echo ""
echo "🌐 Web Testing:"
echo "  Open in browser: https://$HOST/user/123"
echo ""
echo "📱 QR Code Testing:"
echo "  Generate QR code containing the URL for mobile testing"
echo ""
echo "✨ Testing completed!"
