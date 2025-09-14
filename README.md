# Subscription Management Dashboard

A modern, full-stack subscription management application built with Django REST API backend and React frontend. Track your subscriptions, analyze costs, and never miss a renewal again.

## Quick Start

### Prerequisites
- **Python 3.8+** (for Django backend)
- **Node.js 14+** (for React frontend)
- **npm** or **yarn** (package manager)

### What's Included vs What You Need to Set Up
**✅ Included (tracked in git):**
- Database with sample data (`db.sqlite3`)
- Source code and configuration files
- Requirements and package files

**⚠️ Not included (gitignored - you need to create):**
- Virtual environment (`backend/venv/`)
- Node modules (`frontend/node_modules/`)
- Environment files (`.env`)
- Build artifacts and logs

### 1. Clone and Setup
```bash
git clone <repository-url>
cd subscription-dashboard
```

### 2. Quick Setup (Windows - Recommended)
```bash
# Option A: Use batch files (easiest)
setup.bat  # Installs all dependencies
run.bat    # Starts both servers

# Option B: Use npm scripts (Windows only)
cd frontend
npm run setup  # Installs both frontend and backend dependencies
npm run dev    # Starts both frontend and backend servers
```

### 3. Manual Setup (Alternative)
**Backend Setup:**
```bash
cd backend

# Create virtual environment (venv/ is gitignored)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Database is already set up with sample data (db.sqlite3 is tracked)
# If you need to reset the database:
# python manage.py migrate
# python manage.py load_sample_data

# Start server
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies (node_modules/ is gitignored)
npm install

# Start development server
npm start
```

**Servers run at:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Features

### Dashboard Overview
- **Cost Analytics**: Total monthly/yearly spending with category breakdown
- **Renewal Alerts**: 7-day upcoming renewal notifications
- **Subscription Management**: Add, edit, delete subscriptions with full CRUD operations
- **Savings Calculator**: Compare monthly vs yearly billing cycles
- **Interactive Charts**: Visual spending analysis with pie charts and trends
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

###  Backend Features
- **RESTful API**: Clean, predictable API design
- **Data Validation**: Comprehensive input validation and error handling
- **Admin Interface**: Easy data management through Django admin
- **Auto-renewal Calculation**: Automatically calculates next renewal dates
- **Soft Deletes**: Preserves data integrity with is_active flag

## Sample Data

The application comes with 5 sample subscriptions:
1. **Netflix** - $15.99/month - Entertainment
2. **Spotify Premium** - $9.99/month - Music
3. **Adobe Creative Cloud** - $52.99/month - Software
4. **Microsoft 365** - $99.99/year - Productivity
5. **Gym Membership** - $49.99/month - Health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions/` | List all active subscriptions |
| POST | `/api/subscriptions/` | Create new subscription |
| GET | `/api/subscriptions/{id}/` | Get specific subscription |
| PUT/PATCH | `/api/subscriptions/{id}/` | Update subscription |
| DELETE | `/api/subscriptions/{id}/` | Soft delete subscription |
| GET | `/api/subscriptions/stats/` | Get analytics and statistics |
| GET | `/api/subscriptions/categories/` | Get list of all categories |

## Technology Stack

### Backend
- **Django 5.2.6** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (development)
- **django-cors-headers** - CORS support

### Frontend
- **React 18** - UI framework
- **Material-UI 5** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **date-fns** - Date utilities


### API Testing
```bash
# Test API endpoints
curl http://localhost:8000/api/subscriptions/
curl http://localhost:8000/api/subscriptions/stats/
```

##  Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt
```

**Frontend won't start:**
```bash
# Check Node.js version
node --version  # Should be 14+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API connection issues:**
- Ensure Django server is running on port 8000
- Check CORS settings in Django settings
- Verify API endpoints: `http://localhost:8000/api/`

**Database issues:**
```bash
# Reset database (if needed)
# Note: db.sqlite3 is tracked and included with sample data
cd backend
python manage.py migrate
python manage.py load_sample_data
```

## Key Features Explained

### Auto-Renewal Calculation
The system automatically calculates renewal dates based on billing cycles:
- **Monthly**: Adds 1 month to start date
- **Yearly**: Adds 1 year to start date

### Cost Analytics
- **Monthly Equivalent**: Converts yearly costs to monthly for comparison
- **Yearly Equivalent**: Converts monthly costs to yearly for comparison
- **Category Breakdown**: Groups spending by subscription categories

### Renewal Alerts
- Highlights subscriptions renewing within 7 days
- Color-coded urgency levels
- Quick access to edit or manage subscriptions

### Savings Calculator
- Compares monthly vs yearly billing cycles
- Shows potential savings from switching
- Provides smart recommendations

## UI/UX Features

### Responsive Design
- **Mobile**: < 768px (stacked layout, card view)
- **Tablet**: 768px - 1024px (hybrid layout)
- **Desktop**: > 1024px (full grid layout)


## Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **React Documentation**: https://reactjs.org/docs/
- **Material-UI Documentation**: https://mui.com/
- **Django REST Framework**: https://www.django-rest-framework.org/

## Success Checklist

- [ ] Django backend running on port 8000
- [ ] React frontend running on port 3000
- [ ] API endpoints returning data
- [ ] Dashboard displaying subscriptions
- [ ] Can add/edit/delete subscriptions
- [ ] Charts and analytics working
- [ ] Mobile responsive design
- [ ] Admin interface accessible

---
