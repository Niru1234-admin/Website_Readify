# Readify – Interactive Reading Platform 

**Creator:** Sivaraja Nirushan 
**Student ID:** CB016274
**Module Code:** COMK2561 
**Assignment 3 – Front-End Web Development Project**  

---

## Project Overview  
Readify is an interactive reading platform designed to encourage and support reading habits for users of all ages.The website provides book discovery tools, reading progress tracking, recommendations, and a calm reading environment through interactive and engaging features. 
This project is a fully functional **multi-page responsive website** built using only **HTML, CSS, and JavaScript**.  
---

## Website Structure  
The project includes the following pages:  

1. **Home Page**  
   - Hero section with auto-rotating book quotes (JavaScript)
   - Responsive navigation bar with animated hamburger menu
   - Author of the Day feature (date-based JavaScript logic)
   - Footer with newsletter subscription (stored using localStorage) 

2. **Explorer Page**  
   - Books displayed as interactive cards (image, title, author) 
   - Search and filter by genre, title, or author
   - Clickable cards open a modal containing:
        Synposis, Ratings and reviews table, Book data stored using JSON / JavaScript objects

3. **Recommender Page**  
   - Dropdown filters for:  Genre and Book length (short / medium / long)
   - Random book recommendation using JavaScript
   - “Pick Again” button with animation  
   - Option to save books to a personal reading list (localStorage)

4. **Flow Page**  
   - Cozy ambient sounds (toggle on/off) 
   - Track completed books 
   - Reading-focused, distraction-free experience
   - Progress stored using localStorage

5. **Tracker Page**  
   - User inputs: Total pages, Pages read andReading speed
   - JavaScript calculates: Completion percentage, Estimated finishing time
   - Results shown using a progress bar or animated counter
   - Reading progress saved in localStorage  

6. **Games Page**  
   - Games to relax the mind 
   - A memory focused game and writing speed calculation game. 
   - Time based games  

 7. **Feedback Page**  
   - Fully validated form: Name, Email and Message 
   - Feedback saved in localStorage with confirmation message 
   - FAQ accordion section using JavaScript

---

## Technologies Used  
- **HTML5** (semantic structure)  
- **CSS3** (Flexbox, Grid, animations, responsive design)  
- **JavaScript (ES6)** (DOM manipulation, timers, form validation, localStorage)  
- **Remixicons** (icons)  
- **Google Fonts** (Noto Sans, Oswald and Ubuntu)  

---

## Features Implemented  
- Fully responsive design (mobile, tablet, desktop)
- Auto-rotating quotes and daily author logic
- Interactive book cards with modals
- Reading progress calculator with visual feedback
- Random book generator with saved reading list
- Ambient reading sounds
- Form validation and persistent storage
- FAQ accordion interactions
- Progressive Web App (PWA) support

---

## Testing & Validation

- The website was tested using the following tools:
- W3C HTML Validator – No critical errors
- W3C CSS Validator – Standards-compliant CSS
- WAVE Accessibility Tool – Improved accessibility compliance
- Google Lighthouse – Performance, accessibility, SEO, best practices
- Responsive Testing – Mobile, tablet, and desktop screen sizes

## Deployment  
The website is hosted using **GitHub Pages**.  
**Live Link:** [https://niru1234-admin.github.io/Website_Readify/] 

---
 
## Repository Structure

/Website_Readify
│── index.html
│── explorer.html
│── tracker.html
│── recommender.html
│── flow.html
│── feedback.html
│
├── css/
│   ├── reset.css
│   ├── styles.css
│
├── javascript/
│   ├── main.js
│   ├── explorer.js
│   ├── tracker.js
│
├── assets/
│   ├── images/
│   ├── icons/
│
└── manifest.json


