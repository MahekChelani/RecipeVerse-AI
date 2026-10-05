# 🍳 RecipeVerse AI - Setup & Submission Instructions

## 📌 Quick Reference

This document is your **complete guide** to setting up and submitting RecipeVerse AI for college practical evaluation.

---

## 🎯 What You Have

A **full-stack recipe application** with:
- ✅ **Frontend**: React + Redux + Tailwind CSS
- ✅ **Backend**: Express + MongoDB + Mongoose
- ✅ **Database**: MongoDB Atlas with 14 recipes
- ✅ **API**: 5 REST endpoints (CRUD + list)

**All 4 Experiments Completed**: Responsive UI, Hooks, Redux, REST API

---

## 🚀 SETUP (5 Minutes)

### Terminal 1: Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

**Expected**:
```
✅ MongoDB connected successfully
✅ 14 recipes inserted successfully
RecipeVerse backend running on port 5000
```

✋ **Keep this terminal open**

### Terminal 2: Frontend Setup

```bash
npm install
npm run dev
```

**Expected**:
```
Local: http://localhost:5173/
```

### Browser: Verify

Open: **http://localhost:5173**

You should see: 14 recipe cards loading ✅

---

## 📋 Documentation Files

| File | Purpose |
|------|---------|
| **COLLEGE_SUBMISSION_REPORT.md** | Complete answer to all college requirements (A-M) |
| **EXPERIMENT_GUIDE.md** | Detailed testing guide + screenshot instructions |
| **SETUP_INSTRUCTIONS.md** | This file - quick reference |

**👉 For College Submission**: Read **COLLEGE_SUBMISSION_REPORT.md** first

---

## 🔍 What Changed (Experiment 4)

### Files Modified:
1. **src/components/Recipes.jsx**
   - Added: API integration via `useEffect` hook
   - Added: Loading and error states
   - Changed: Hardcoded recipes → MongoDB fetch
   - Kept: All Redux, modal, search, favorites functionality

2. **backend/package.json**
   - Added: `"seed": "node seed.js"` script

### Files Created:
1. **backend/seed.js** - Populate MongoDB with 14 recipes
2. **backend/.gitignore** - Security (don't commit .env)
3. **COLLEGE_SUBMISSION_REPORT.md** - Your submission answer
4. **EXPERIMENT_GUIDE.md** - Testing guide

### Files Unchanged:
- ✅ backend/server.js
- ✅ backend/models/Recipe.js
- ✅ backend/routes/recipeRoutes.js
- ✅ All UI components
- ✅ Redux store and slices

---

## ✅ Verification Checklist

### Backend Running?
```bash
curl http://localhost:5000/
# Should respond: {"message": "...success...", "status": "success"}
```

### Database Populated?
```bash
curl http://localhost:5000/api/recipes | grep -o '"count":[0-9]*'
# Should show: "count":14
```

### Frontend Displaying?
- Open http://localhost:5173
- Should see 14 recipe cards
- No errors in browser console

### Search Working?
- Type "Indian" in search bar
- Should filter to 3 recipes
- Type "Breakfast" → 2 recipes

### Redux Working?
- Click heart icon on any recipe
- Heart turns orange ✅
- Click "View Recipe"
- Adjust servings with +/- buttons
- Quantities scale automatically ✅

---

## 🎓 For College Submission

### What to Submit:

**1. Project Files** (automatic with git):
```
recipe-app-exp2/
├── backend/
│   ├── models/Recipe.js ✅
│   ├── routes/recipeRoutes.js ✅
│   ├── server.js ✅
│   ├── seed.js ✅ (NEW)
│   ├── package.json ✅ (MODIFIED)
│   └── .gitignore ✅ (NEW)
├── src/
│   ├── components/Recipes.jsx ✅ (MODIFIED)
│   ├── redux/
│   │   ├── store.js ✅
│   │   └── recipeSlice.js ✅
│   └── ... (all other files unchanged)
└── COLLEGE_SUBMISSION_REPORT.md ✅ (NEW - READ THIS)
```

**2. Screenshots** (capture 10-15 per experiment guide)
- Use instructions in EXPERIMENT_GUIDE.md
- Show frontend, modal, error states, backend terminal

**3. Documentation** (already created):
- COLLEGE_SUBMISSION_REPORT.md → Your answer sheet (A-M)
- EXPERIMENT_GUIDE.md → Testing procedures
- This file → Quick reference

---

## ❓ FAQ

### Q: Where do I find the answers to college questions?
**A**: See **COLLEGE_SUBMISSION_REPORT.md** sections A-M

### Q: How do I test the API?
**A**: See **EXPERIMENT_GUIDE.md** → "TESTING GUIDE" section

### Q: What screenshots should I take?
**A**: See **EXPERIMENT_GUIDE.md** → "M. Screenshots to Take"

### Q: Why do I get "recipes are loading"?
**A**: Backend is starting. Wait 2-3 seconds. See EXPERIMENT_GUIDE.md debugging section.

### Q: Why do I get an error on the frontend?
**A**: Backend isn't running. Check Terminal 1. See EXPERIMENT_GUIDE.md debugging.

### Q: Can I run only the frontend?
**A**: No. Frontend needs backend running. Start backend first (Terminal 1).

### Q: Can I delete or modify recipes?
**A**: Yes! Use POST/PUT/DELETE endpoints. Run `npm run seed` to reset.

### Q: How do I verify MongoDB has data?
**A**: See COLLEGE_SUBMISSION_REPORT.md section K → "How to Verify MongoDB Data"

### Q: What if I need to reset the database?
**A**: Run `npm run seed` again. It clears and reinserts 14 recipes.

---

## 🐛 Quick Debugging

### Frontend shows "Loading recipes..." forever
- Check Terminal 1: Backend must be running
- Run: `curl http://localhost:5000/` to test backend

### Frontend shows error message
- Check MongoDB connection in `backend/.env`
- Ensure MongoDB Atlas credentials are correct
- Check browser console for details

### API returns 500 error
- Check backend logs in Terminal 1
- Verify MongoDB connection
- Check if recipes collection exists

### Recipes don't filter by search
- Ensure useDebounce hook is working (see hooks file)
- Try refreshing page
- Check browser console for errors

### Serving quantities don't adjust
- Open Redux DevTools browser extension
- Click +/- buttons
- Check if increaseServings action is dispatched
- Verify getQuantity calculation

---

## 📚 File Descriptions

### backend/seed.js
- **What**: Script to populate MongoDB
- **How**: `npm run seed`
- **Creates**: 14 international recipes
- **Where**: MongoDB Atlas, recipeverse database, recipes collection

### backend/.gitignore
- **What**: Prevents committing .env and node_modules
- **Why**: Keep credentials secure
- **Contains**: .env, node_modules/, .vscode/, logs/

### src/components/Recipes.jsx
- **What**: Main recipe display component (MODIFIED)
- **Changed**: Now fetches from `http://localhost:5000/api/recipes`
- **Kept**: Redux favorites, serving controls, modal, search
- **Added**: Loading spinner, error handling, data transformation

### COLLEGE_SUBMISSION_REPORT.md
- **What**: Answers to all college questions (A-M)
- **Read this for**: Complete submission guidance
- **Contains**: 
  - A: Experiment 1 recap
  - B: Experiment 2 recap
  - C: Experiment 3 recap
  - D: Experiment 4 details
  - E-M: Exact commands, APIs, testing, screenshots

---

## 🎬 Step-by-Step for Submission Day

### Before Class:
1. ✅ Run setup above
2. ✅ Verify all 14 recipes load
3. ✅ Test search, favorites, servings
4. ✅ Take screenshots per guide
5. ✅ Have COLLEGE_SUBMISSION_REPORT.md ready

### During Evaluation:
1. ✅ Show running backend server
2. ✅ Show running frontend with recipes
3. ✅ Show MongoDB database with 14 recipes
4. ✅ Demo: Search filtering
5. ✅ Demo: Favorites (Redux)
6. ✅ Demo: Serving adjustments
7. ✅ Show code in backend and frontend
8. ✅ Show API requests in Postman/curl
9. ✅ Answer questions using COLLEGE_SUBMISSION_REPORT.md

---

## 💡 Pro Tips

**Tip 1**: Keep both terminals (backend + frontend) open during demo
- Shows backend running and logging requests
- Shows frontend auto-updating with live data

**Tip 2**: Use MongoDB Atlas web console during demo
- Click Collections → recipeverse → recipes
- Shows actual data stored in cloud database

**Tip 3**: Use Postman for API demo
- Show each endpoint (GET all, GET one, POST, PUT, DELETE)
- Shows that backend works independently

**Tip 4**: Use browser DevTools for Redux demo
- Install Redux DevTools browser extension
- Shows state changes when clicking favorites/servings

**Tip 5**: Have EXPERIMENT_GUIDE.md open on laptop
- Quick reference for testing procedures
- Helps when professor asks specific questions

---

## 📞 Support

### If something breaks:
1. Stop all terminals (Ctrl+C)
2. Run setup again from top
3. Check debugging section in EXPERIMENT_GUIDE.md
4. Check browser console and server logs

### Common fixes:
- **"Port 5000 already in use"**: Kill process using port
- **"MongoDB connection error"**: Check .env MONGO_URI
- **"Recipes not loading"**: Restart backend with `npm run seed`
- **"Redux not working"**: Refresh page and check DevTools

---

## ✨ You're All Set!

Your project is **100% complete** with:
- ✅ Responsive UI (Experiment 1)
- ✅ React Hooks (Experiment 2)
- ✅ Redux State (Experiment 3)
- ✅ REST API + MongoDB (Experiment 4)
- ✅ Complete Documentation (This guide)
- ✅ Testing Guide (EXPERIMENT_GUIDE.md)
- ✅ Submission Answers (COLLEGE_SUBMISSION_REPORT.md)

**Good luck with your college practical! 🎓**

---

*Last Updated: 2024*
*Status: Ready for Submission ✅*
