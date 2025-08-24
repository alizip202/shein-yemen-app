@echo off
chcp 65001 >nul
cls

echo ===============================================
echo        🏪 شين اليمن PWA - تطبيق جوال
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python غير مثبت على النظام
    echo.
    echo يرجى تثبيت Python 3.7 أو أحدث من:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python متوفر على النظام

REM Change to backend directory
cd /d "%~dp0backend"

echo.
echo 🚀 بدء تشغيل خادم شين اليمن PWA...
echo.
echo 🌐 الروابط المتاحة:
echo    - الخادم: http://localhost:8000
echo    - التطبيق PWA: http://localhost:8000
echo.
echo 📱 ميزات PWA:
echo    - قابل للتثبيت على الهاتف
echo    - يعمل بدون اتصال
echo    - إشعارات فورية
echo    - تجربة تطبيق أصلي
echo.
echo 📝 تعليمات التثبيت:
echo    1. افتح الرابط في المتصفح
echo    2. اضغط على "تثبيت التطبيق"
echo    3. استمتع بتجربة التطبيق الأصلي
echo.
echo ===============================================

REM Start the Python server
python simple_server.py

echo.
echo 🛑 تم إيقاف الخادم
pause

