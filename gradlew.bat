@echo off
REM Gradle wrapper launcher untuk Windows
set APP_HOME=%~dp0
set WRAPPER_JAR=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

if exist "%WRAPPER_JAR%" (
    java -cp "%WRAPPER_JAR%" org.gradle.wrapper.GradleWrapperMain %*
) else (
    echo ERROR: gradle-wrapper.jar not found at %WRAPPER_JAR%
    echo Please download from: https://services.gradle.org/gradle/8.10.2-bin.zip
    exit /b 1
)
