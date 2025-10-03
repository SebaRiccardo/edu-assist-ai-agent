# 🚀 Quick Reference Guide

## Start Development Server
```bash
npm run dev
```
Then open: http://localhost:3000

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main UI page |
| `src/app/api/check-emails/route.ts` | Email analysis API |
| `src/components/email-card.tsx` | Email display component |
| `src/lib/mock-data.ts` | Mock courses & professor |
| `src/types/index.ts` | TypeScript types |
| `.env.local` | API keys (create from .env.local.example) |

## 🎨 Email Types & Badges

| Type | Badge Color | Icon |
|------|-------------|------|
| Student Question | Blue (info) | ❓ |
| Professor Inquiry | Yellow (warning) | 👨‍🏫 |
| Administrative | Gray (outline) | 📋 |
| General | Gray (secondary) | 📧 |

## 🔑 API Keys Needed

1. **Google AI API Key** → https://ai.google.dev/
2. **Composio API Key** → https://app.composio.dev

Add to `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
COMPOSIO_API_KEY=your_key_here
```

## 📊 Mock Data Available

### Courses
1. **Algebra I** - `course-1`
2. **Calculus II** - `course-2`  
3. **Linear Algebra** - `course-3`

### Professor
- **Name**: Dr. Sarah Johnson
- **Email**: sarah.johnson@university.edu
- **ID**: prof-123

### Sample Emails (6 total)
- 2 Student questions (Algebra I, Linear Algebra)
- 1 Professor inquiry (Linear Algebra)
- 1 Administrative (Algebra I)
- 1 General (Newsletter)
- 1 Office hours request (Linear Algebra)

## 🎯 How to Use

1. **Select a Course** - Click on Algebra I, Calculus II, or Linear Algebra
2. **Check Emails** - Click the blue button
3. **View Results** - See categorized emails with confidence scores
4. **Manage Emails** - Use the ⋮ menu on each card

## 🛠️ Common Tasks

### Add a New Course
Edit `src/lib/mock-data.ts`:
```typescript
{
  id: 'course-4',
  name: 'Your Course',
  professorId: 'prof-123',
  context: 'Course description...',
  createdAt: new Date(),
}
```

### Change Email Type Colors
Edit `src/components/email-card.tsx`:
```typescript
const emailTypeConfig = {
  student_question: {
    variant: 'info', // Change this
  }
}
```

### Adjust AI Behavior
Edit prompt in `src/app/api/check-emails/route.ts`

## 📱 Component Structure

```
Page (src/app/page.tsx)
├── Header
├── Course Selection Card
│   ├── Course Grid (3 cards)
│   └── Check Emails Button
├── Statistics (2 cards)
│   ├── Total Analyzed
│   └── Course Related
└── Email Results
    └── Email Cards (EmailCard component)
        ├── Header (subject, actions)
        ├── Content (snippet, badges)
        └── Footer (timestamp)
```

## 🎨 UI Components Used

- `Card` - Container for content blocks
- `Badge` - Colored labels
- `Button` - Interactive buttons
- `DropdownMenu` - Action menus
- Icons from `lucide-react`

## 🔄 API Endpoint

**POST** `/api/check-emails`

**Request:**
```json
{
  "courseId": "course-1",
  "userId": "prof-123"
}
```

**Response:**
```json
{
  "success": true,
  "course": { "id": "...", "name": "..." },
  "emails": [...],
  "totalAnalyzed": 6,
  "totalCategorized": 4
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process or use `npm run dev -- -p 3001` |
| API key error | Check `.env.local` exists and has valid keys |
| Styling broken | Run `npm install --legacy-peer-deps` |
| Build errors | Delete `.next` folder and restart |

## 📚 Documentation

- `README.md` - Project overview
- `SETUP.md` - Detailed setup guide
- `FEATURES.md` - Feature documentation
- `IMPLEMENTATION.md` - What was built

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel AI SDK](https://ai-sdk.dev/docs)
- [Gemini API](https://ai.google.dev/docs)
- [Composio Docs](https://docs.composio.dev/)
- [shadcn/ui](https://ui.shadcn.com)

## 💡 Pro Tips

1. ✅ Read course contexts carefully - they guide AI decisions
2. ✅ Lower confidence (<70%) may need manual review
3. ✅ Try different course selections to see AI adapt
4. ✅ Check console for detailed error messages
5. ✅ Restart server after `.env.local` changes

## 🚀 Next Steps to Production

1. **Phase 1**: Add Supabase authentication
2. **Phase 2**: Connect to real Gmail via Composio
3. **Phase 3**: Implement label management
4. **Phase 4**: Add email history tracking
5. **Phase 5**: Deploy to Vercel

## 📞 Support

- Check documentation files
- Review code comments
- Check browser console for errors
- Verify API keys are correct
