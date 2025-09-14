#!/bin/bash

echo "Starting Subscription Dashboard Backend..."
echo

# Check if virtual environment exists
if [ ! -d "venv_new" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv_new
    echo "Installing dependencies..."
    venv_new/bin/python -m pip install -r requirements.txt
else
    echo "Virtual environment found."
fi

# Run migrations
echo "Running database migrations..."
venv_new/bin/python manage.py migrate

# Load sample data
echo "Loading sample data..."
venv_new/bin/python manage.py load_sample_data

# Start server
echo
echo "Starting Django development server..."
echo "API will be available at: http://localhost:8000/"
echo "Admin interface: http://localhost:8000/admin/"
echo "Username: admin, Password: admin123"
echo
echo "Press Ctrl+C to stop the server"
echo
venv_new/bin/python manage.py runserver
