#!/bin/bash

clear

echo "==============================================="
echo "        🏪 شين اليمن PWA - تطبيق جوال"
echo "==============================================="
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python غير مثبت على النظام"
        echo
        echo "يرجى تثبيت Python 3.7 أو أحدث:"
        echo "- Ubuntu/Debian: sudo apt install python3"
        echo "- CentOS/RHEL: sudo yum install python3"
        echo "- macOS: brew install python3"
        echo
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Python متوفر على النظام"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to backend directory
cd "$SCRIPT_DIR/backend"

echo
echo "🚀 بدء تشغيل خادم شين اليمن PWA..."
echo
echo "🌐 الروابط المتاحة:"
echo "   - الخادم: http://localhost:8000"
echo "   - التطبيق PWA: http://localhost:8000"
echo
echo "📱 ميزات PWA:"
echo "   - قابل للتثبيت على الهاتف"
echo "   - يعمل بدون اتصال"
echo "   - إشعارات فورية"
echo "   - تجربة تطبيق أصلي"
echo
echo "📝 تعليمات التثبيت:"
echo "   1. افتح الرابط في المتصفح"
echo "   2. اضغط على 'تثبيت التطبيق'"
echo "   3. استمتع بتجربة التطبيق الأصلي"
echo
echo "==============================================="

# Start the Python server
$PYTHON_CMD simple_server.py

echo
echo "🛑 تم إيقاف الخادم"

