@echo off
setlocal

echo Running database migrations...

REM Get database connection details from environment variables or use defaults
set DB_HOST=%DB_HOST%
if "%DB_HOST%"=="" set DB_HOST=localhost

set DB_PORT=%DB_PORT%
if "%DB_PORT%"=="" set DB_PORT=5432

set DB_NAME=%DB_NAME%
if "%DB_NAME%"=="" set DB_NAME=fintech

set DB_USER=%DB_USER%
if "%DB_USER%"=="" set DB_USER=postgres

set DB_PASSWORD=%DB_PASSWORD%
if "%DB_PASSWORD%"=="" set DB_PASSWORD=postgres

REM Check if psql is available
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: psql command not found. Please install PostgreSQL client tools.
    echo Download PostgreSQL from https://www.postgresql.org/download/
    exit /b 1
)

REM Set password for psql
set PGPASSWORD=%DB_PASSWORD%

REM Test database connection
echo Testing database connection...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Could not connect to database. Please check your database settings and ensure the database is running.
    echo Host: %DB_HOST%
    echo Port: %DB_PORT%
    echo Database: %DB_NAME%
    echo User: %DB_USER%
    exit /b 1
)

REM Run migrations in order
for %%f in (.\migrations\*.sql) do (
    echo Running migration: %%f
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f %%f
    if %errorlevel% neq 0 (
        echo Error running migration: %%f
        exit /b 1
    )
)

echo Database migrations completed successfully!