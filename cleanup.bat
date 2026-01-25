@echo off
echo ========================================
echo SkillBridge254 - Safe Cleanup Script
echo ========================================
echo.
echo This will remove 66+ redundant files:
echo - 50+ old test/debug scripts
echo - 10+ duplicate enhancement scripts
echo - 3 temporary test files
echo - 2 debug HTML files
echo - 2 miscellaneous files
echo.
echo All files will be moved to _cleanup_backup folder first.
echo You can restore them if needed.
echo.
set /p confirm="Continue with cleanup? (Y/N): "

if /i not "%confirm%"=="Y" (
    echo Cleanup cancelled.
    pause
    exit /b 0
)

echo.
echo Creating backup folder...
if not exist "_cleanup_backup" mkdir "_cleanup_backup"
if not exist "_cleanup_backup\backend_scripts" mkdir "_cleanup_backup\backend_scripts"
if not exist "_cleanup_backup\root_files" mkdir "_cleanup_backup\root_files"
if not exist "_cleanup_backup\public_files" mkdir "_cleanup_backup\public_files"

echo.
echo [1/4] Cleaning backend scripts...
cd learner-pwa\backend\scripts

REM Duplicate Enhancement Scripts
for %%f in (enhanceAllModules.js enhanceAllModulesComplete.js enhanceContentWithAPI.js enhanceInternetBasicsModule.js enhanceMobileBasicsModule.js enhanceModulesCorrect.js enhanceModulesFinal.js enhanceRemainingModules.js enhanceViaAPI.js simpleEnhancement.js) do (
    if exist "%%f" (
        echo Moving %%f...
        move "%%f" "..\..\..\..\_cleanup_backup\backend_scripts\" >nul 2>&1
    )
)

REM Old Video Fix Scripts
for %%f in (addYourVideos.js finalVideoFix.js fixAllVideos.js fixVideoUrls.js updateModuleVideos.js updateWithProvidedVideos.js validateVideoLinks.js testVideoUrls.js videoDiagnostics.js) do (
    if exist "%%f" (
        echo Moving %%f...
        move "%%f" "..\..\..\..\_cleanup_backup\backend_scripts\" >nul 2>&1
    )
)

REM Redundant Test Scripts
for %%f in (testAdminAPI.js testAdminModules.js testCertificateGeneration.js testChatbot.js testContentDeliverySystem.js testContentDiagnostics.js testCourseContent.js testCourseDisplay.js testEndpoints.js testEnhancedContentAPI.js testEnhancedContentModels.js testEnhancement.js testFrontendIntegration.js testLogin.js testSearchCertificates.js verifyAllFeatures.js verifyFrontendReady.js checkModuleDetails.js checkModules.js debugModules.js) do (
    if exist "%%f" (
        echo Moving %%f...
        move "%%f" "..\..\..\..\_cleanup_backup\backend_scripts\" >nul 2>&1
    )
)

REM Old Migration Scripts
for %%f in (addUnsplashImages.js migrateModulesForEnhancement.js seedEnhancedCourses.js setupTextBasedLearning.js validateEnhancedModules.js generateEnhancedContent.js) do (
    if exist "%%f" (
        echo Moving %%f...
        move "%%f" "..\..\..\..\_cleanup_backup\backend_scripts\" >nul 2>&1
    )
)

REM Backup/Diagnostic Files
for %%f in (seedModules.backup.js enhanced-mobile-basics-content.json diagnoseChatbot.js fixPasswordsCorrectly.js) do (
    if exist "%%f" (
        echo Moving %%f...
        move "%%f" "..\..\..\..\_cleanup_backup\backend_scripts\" >nul 2>&1
    )
)

cd ..\..\..

echo.
echo [2/4] Cleaning root test files...
cd learner-pwa

for %%f in (test-offline-assessment.js test-offline-certificates.js debug-courseContent.js build_log.txt) do (
    if exist "%%f" (
        echo Moving %%f...
        move "%%f" "..\_cleanup_backup\root_files\" >nul 2>&1
    )
)

cd ..

echo.
echo [3/4] Cleaning debug HTML files...
cd learner-pwa\public

for %%f in (debug.html video-test.html) do (
    if exist "%%f" (
        echo Moving %%f...
        move "%%f" "..\..\..\_cleanup_backup\public_files\" >nul 2>&1
    )
)

cd ..\..

echo.
echo [4/4] Cleaning miscellaneous files...
if exist "unspash API kEYS.png" (
    echo Moving unspash API kEYS.png...
    move "unspash API kEYS.png" "_cleanup_backup\root_files\" >nul 2>&1
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Files moved to: _cleanup_backup\
echo.
echo Backup structure:
echo - _cleanup_backup\backend_scripts\  (50+ files)
echo - _cleanup_backup\root_files\       (4 files)
echo - _cleanup_backup\public_files\     (2 files)
echo.
echo To restore files, simply move them back from _cleanup_backup.
echo To permanently delete, remove the _cleanup_backup folder.
echo.
echo Remaining essential scripts:
echo - learner-pwa\backend\scripts\seedModules.js
echo - learner-pwa\backend\scripts\createAdmin.js
echo - learner-pwa\backend\scripts\setupDatabase.js
echo - learner-pwa\backend\scripts\dbStatus.js
echo - learner-pwa\backend\scripts\listUsers.js
echo - learner-pwa\backend\scripts\resetPassword.js
echo - learner-pwa\backend\scripts\createSampleUser.js
echo - learner-pwa\backend\scripts\courses-seed.json
echo.
pause
