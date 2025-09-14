# Technical Decisions & Development Journey

## Overview

This document outlines my actual technical decisions, challenges, and thought process while building the Subscription Management Dashboard for the aajil SA take-home assessment. This is my honest account of what I built, why I made certain choices, and where I struggled.

## My Starting Point

### Background Context
- **Django Experience**: Somewhat beginner - this was my first Django project to build from scratch.
- **React Experience**: Comfortable and familiar with React
- **Python Background**: I use Python regularly for data structures and algorithms practice, but rarely for web development projects
- **Project Expectation**: Initially thought this would be straightforward - "just a simple backend connected to a frontend with a database"

### Initial Reaction to Requirements
When I first read the requirements, I honestly thought it looked pretty straightforward. Build some CRUD operations, add a few calculations, hook up a frontend. Seemed manageable.

## Technology Stack Decisions

### Backend: Django + Django REST Framework

**Why I Chose This**: Django was required for the assessment.

**Refreshing Django Knowledge**: Since it had been a while since I'd worked with Django, I had to revise and remember how the framework components worked. The syntax felt familiar, but I needed to remember how models, views, serializers, and URLs all connect together.

**What I Liked**: Once I got the hang of it, I really enjoyed the backend work. It felt good to use Python for building something substantial instead of just solving algorithm problems. The ORM made database operations pretty intuitive once I understood the patterns.

### Frontend: React with Material-UI

**Why React**: This was an easy choice. I'm comfortable with React, and since I was already learning Django from scratch, I wanted to use something familiar for the frontend. I briefly considered trying to do everything in Python with Django templates, but decided that would be too much new stuff at once.

**Why Material-UI**: Honestly, I just wanted components that looked decent without spending time on custom CSS. I knew MUI would give me a professional-looking interface quickly, and the documentation is solid.

### Database: SQLite

**Why SQLite**: Pure convenience. That's literally the only reason. I wanted something that required zero setup so I could focus on learning Django and building features. I knew it wasn't a "production" choice, but for this assessment it was perfect.

## Architecture Decisions

### Data Model Design

I kept the data model pretty simple:

```python
class Subscription(models.Model):
    name = models.CharField(max_length=200)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=10, choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')])
    start_date = models.DateField()
    renewal_date = models.DateField()
    category = models.CharField(max_length=50, blank=True, null=True)
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    yearly_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**My Thinking**: I wanted to keep it straightforward. The only real decision I made was using `DecimalField` for cost (to avoid floating point issues with money) and adding an `is_active` flag instead of actually deleting records (seemed like good practice for keeping historical data). I also added `monthly_price` and `yearly_price` as optional fields to make the savings calculations easier.

**The Migration Headache**: I forgot to run migrations when I added a couple of fields later in development. Spent way too much time debugging why my new fields weren't showing up before I realized I'd skipped that step. Not my finest moment.

## AI Tool Usage - The Real Story

Let me be completely transparent about how I used AI and where it helped vs. hurt:

### Where AI Actually Helped

1. **Virtual Environment Setup**: AI suggested using `venv` for the Django backend, which was new to me. This was actually really helpful advice.

2. **Project Structure**: AI helped me understand how to organize a Django project and suggested a logical component structure for React.

3. **Skeleton Code**: AI was great for generating boilerplate - basic model structures, API endpoints, component templates. Saved me a lot of typing.

4. **Django Concepts**: When I was confused about how serializers worked or how to structure views, AI explanations were actually pretty helpful.

5. **This document**: AI helped me write this document with better vocabulary and structure.

### Where AI Failed Me (And I Had to Fix It)

1. **Chart Implementation**: AI gave me code for charts that just didn't work. The data wasn't being passed correctly to the chart components, and it took me forever to figure out the right format. I honestly hated dealing with charts - it was the most frustrating part of the project.

2. **Date Calculation Logic**: AI gave me date calculation code that only worked correctly for the first month. I caught this when I saw renewal dates showing as "-500 days" which was obviously wrong. Had to fix the logic to properly handle different billing cycles.

3. **Savings Calculation**: AI's initial savings calculation was completely wrong. It just summed up yearly vs monthly costs instead of doing the proper "what if all subscriptions were monthly vs yearly" comparison. I had to think through the logic myself and manually implement the correct calculation.

### How I Validated AI Suggestions

**Manual Testing**: I tested everything manually. When something looked off (like those negative renewal days), I dug into the code to understand what was actually happening.

**Understanding Before Using**: If AI gave me code I didn't understand, I either researched it or rewrote it in a way that made sense to me. I didn't want to ship code I couldn't explain.

**Iterative Fixes**: When AI solutions were partially wrong, I used them as starting points but debugged and fixed the issues myself.

## Development Process & Challenges

### What I Built First
I started with the Django backend - models, then basic API endpoints. I wanted to get the data layer working before touching the frontend.

### Real Challenges I Faced

1. **Refreshing Django concepts**: Remembering how models, views, serializers, and URLs connect took some time, but came back to me fairly quickly.

2. **Chart Integration**: Getting the data from my API into the right format for charts was surprisingly annoying. The chart library expected data in a specific structure that didn't match my API responses naturally.

3. **Migration Issues**: Forgetting to run migrations when I added new fields caused debugging headaches.

### What I Enjoyed
- **Backend Logic**: I really enjoyed building the calculation logic and API endpoints. It felt good to use Python for something substantial.
- **Problem Solving**: Fixing the savings calculation and date logic was straightforward once I identified what was wrong.

## Technical Decisions I'm Proud Of

### API Design
I built a comprehensive API with advanced features:
- Standard CRUD endpoints for subscriptions with soft delete functionality
- Custom analytics endpoint (`/stats/`) with complex calculations for total costs, category breakdowns, and spending trends
- Categories endpoint (`/categories/`) for dynamic category management
- Manual renewal date update endpoint (`/update_renewal_date/`) for flexible subscription management
- Advanced serializers with computed fields like `days_until_renewal`, `monthly_equivalent_cost`, and `savings_opportunity`
- Comprehensive validation including cross-field validation for pricing options
- Proper error handling and status codes throughout

### Component Structure
I broke the React frontend into logical components that each had a single responsibility. Nothing fancy, but clean and maintainable.

## What I Would Do Differently

### If I Started Over
- Refresh Django concepts upfront instead of remembering them as I went
- Choose a simpler charting solution
- Set up proper error handling from the beginning instead of adding it later

### Features I Wanted But Didn't Implement
- deploying the dashboard with docker on a remote server

## Key Takeaways

### What I Learned
- Django is actually pretty nice once you understand the patterns
- AI is helpful for boilerplate but you need to validate everything
- Manual testing catches issues that look fine in code
- Using Python for web development felt natural and enjoyable

### About AI Collaboration
- AI is great for explaining concepts and generating starting code
- Always test AI suggestions thoroughly - they often have subtle bugs
- Don't use code you don't understand, even if it works
- AI suggestions work best when you can validate and improve them

### Personal Growth
This project pushed me outside my comfort zone with Django while letting me leverage my React knowledge. The combination of learning something new while building something functional was really satisfying. Even the frustrating parts (like those charts) taught me valuable lessons about debugging and persistence.

## Final Thoughts

This was a genuinely fun project that taught me a lot. While I used AI tools somewhat, the most important decisions and problem-solving came from my own thinking and debugging. The broken AI code actually forced me to understand the underlying concepts better, which was probably a good thing in the end.

The most satisfying part was building something functional that solves a real problem, especially coming from a background of mostly algorithmic programming.

I really enjoyed this type of assessment - it mirrors real-world development much more than typical DSA questions and actually lets you build something meaningful.