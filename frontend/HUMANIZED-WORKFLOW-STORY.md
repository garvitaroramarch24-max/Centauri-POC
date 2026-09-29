# Week 3 Refactoring: How We Used AI to Improve Our Code (And What We Had to Fix)

**What this is:** A real story of how we used GitHub Copilot to help us refactor code, what it did great, and what we had to fix ourselves.

---

## Quick Overview

Here's what happened: We had some messy code. We asked Copilot for help. It generated some solid code. We reviewed it, found some issues, fixed them, and shipped it. 

**The result?** Better code that actually works well. Here's how we did it.

---

## Part 1: The Backend (tasks.service.ts)

### The Problem

Our `findAll()` method was a bit of a mess. It was doing everything:
- Checking what status the user wanted (all tasks, open tasks, completed tasks)
- Searching for tasks
- Building the database query
- All mixed together in one method

**Why this sucked:**
- Hard to test (can't test just the status logic)
- Hard to reuse (status parsing stuck in one place)
- No error handling (what if someone passes "invalid"?)
- Hard to read (too much happening)

### What We Asked Copilot

```
"Hey, the status filtering logic is all tangled up in findAll(). 
Can you extract it into a separate method called getCompletionFilter()?

It should:
- Take a status ('all', 'open', or 'completed')
- Return the right filter object for the database
- Throw an error if someone passes garbage
- Use a switch statement so it's clear"
```

### What It Generated

```typescript
private getCompletionFilter(status: string) {
  switch(status) {
    case 'all':
      return {};
    case 'open':
      return { completed: false };
    case 'completed':
      return { completed: true };
    default:
      throw new BadRequestException(
        `Invalid status: ${status}`
      );
  }
}
```

### Our Review

**Us:** "Yep, this is perfect. The logic is correct, it handles all the cases, the error message is clear. Ship it." ✅

**No changes needed.**

---

### Then We Asked for Search

```
"Now let's add search. Add a search parameter to findAll():

- Make it optional (searching is not required)
- Use ILike for case-insensitive search (so 'Task' finds 'task')
- Search in the title field
- Make it work WITH the status filter, not instead of it"
```

### What It Generated

```typescript
import { ILike, Repository } from 'typeorm';

async findAll(status?: string, search?: string) {
  const where: any = {};
  
  if (status) {
    Object.assign(where, this.getCompletionFilter(status));
  }
  
  if (search) {
    where.title = ILike(`%${search}%`);
  }
  
  const tasks = await this.taskRepository.find({ where });
  return tasks;
}
```

### What We Had to Fix

**Problem 1: Type Safety**
```typescript
// Copilot used 'any' type (lazy)
const where: any = {};

// We fixed it (proper)
interface TaskFilter {
  completed?: boolean;
  title?: any;
}
const where: TaskFilter = {};
```
**Why?** So TypeScript can help us catch bugs, and our IDE can show us what properties are available.

---

**Problem 2: No Error Handling**
```typescript
// Copilot just trusted the database call would work
const tasks = await this.taskRepository.find({ where });
return tasks;

// We added error handling
try {
  const tasks = await this.taskRepository.find({ where });
  return tasks;
} catch (error) {
  throw new DatabaseException('Failed to fetch tasks', error);
}
```
**Why?** If the database craps out, we need to know. Silently failing is bad.

---

**Problem 3: Didn't Clean the Input**
```typescript
// Copilot passed search as-is
if (search) {
  where.title = ILike(`%${search}%`);
}

// We trimmed it
if (search && search.trim().length > 0) {
  where.title = ILike(`%${search.trim()}%`);
}
```
**Why?** If someone searches for "   " (just spaces), we'd search for nothing. Trim it first.

---

## Part 2: The Frontend (App.tsx)

### The Problem

The component was doing this:

1. User changes filter (e.g., from "all tasks" to "open tasks")
2. Effect runs, fetches new data
3. State updates with new data
4. User sees correct tasks

**But what if the network was slow?**

1. User changes filter to "open"
2. API request starts for "open"
3. User immediately changes filter to "completed"
4. API request starts for "completed"
5. "open" response arrives first → shows "open tasks" (wrong!)
6. "completed" response arrives later → finally correct

We were showing stale data. Race condition. Bad.

Also: when users created/updated/deleted tasks, the list didn't update. We'd have to manually refresh. Not great UX.

### What We Asked Copilot

```
"The useEffect is fetching and updating at the same time.
Let's separate it:

1. Add a 'isFetching' state to track if we're loading
2. Guard against concurrent requests: if (isFetching) return
3. Create the async fetch function inside useEffect
4. Add try-catch
5. Make sure finally block cleans up the loading state

This should prevent showing old data to users."
```

### What It Generated

```typescript
const [isFetching, setIsFetching] = useState(false);

useEffect(() => {
  if (isFetching) return;
  
  const fetchTasks = async () => {
    setIsFetching(true);
    try {
      const data = await api.getTasks(filter);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsFetching(false);
    }
  };
  
  fetchTasks();
}, [filter]);
```

### Our Review

**Us:** "The guard clause works, the try-catch is there, dependencies look good. But we're gonna add one thing..." ✅ (with enhancement)

### What We Added

**We added error state so users actually see errors:**
```typescript
const [error, setError] = useState<string | null>(null);

// In catch:
catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : 'Failed to fetch tasks';
  setError(message);  // Show this to the user
}

// In finally:
finally {
  setIsFetching(false);
  setError(null);  // Clear old errors
}
```

**Why?** If we just log to console, users have no idea what went wrong. They'll think the app is broken.

---

### Then We Asked for a Refresh Function

```
"Let's create a refreshTasks() function that we can call after 
creating/updating/deleting tasks. It should:

- Use useCallback (for performance)
- Fetch fresh data with current filter
- Handle errors
- Keep code DRY (not repeated in every handler)"
```

### What It Generated

```typescript
const refreshTasks = useCallback(async () => {
  setIsFetching(true);
  try {
    const data = await api.getTasks(filter);
    setTasks(data);
  } catch (error) {
    console.error('Error refreshing tasks:', error);
  } finally {
    setIsFetching(false);
  }
}, [filter]);
```

### What We Had to Fix

**Problem 1: Forgot a Dependency**
```typescript
// Copilot forgot about 'api'
}, [filter]);

// Could cause bugs if 'api' changes, so we added it
}, [filter, api]);
```

---

**Problem 2: Didn't Update Error State**
```typescript
// Copilot only logged to console
catch (error) {
  console.error('Error refreshing tasks:', error);
}

// We made it show to user
catch (error) {
  setError(error.message);
}
```

---

**Problem 3: Still Had Race Condition Risk**
```typescript
// Even with guard in useEffect, this function could be 
// called multiple times by handlers

// We added guard here too
const refreshTasks = useCallback(async () => {
  if (isFetching) return;  // Don't fetch if already fetching
  
  setIsFetching(true);
  try {
    const data = await api.getTasks(filter);
    setTasks(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsFetching(false);
  }
}, [filter, api, isFetching]);
```

---

### Then We Asked It to Update the Handlers

```
"Now update create/update/delete to call refreshTasks() after 
they succeed. Also:

- Show errors to users
- Validate input before sending
- Be consistent in error handling"
```

### What It Generated

```typescript
const handleCreateTask = async (title: string) => {
  try {
    await api.createTask({ title });
    await refreshTasks();
  } catch (error) {
    console.error('Create failed:', error);
  }
};

// Similar for update and delete
```

### What We Had to Fix

**Problem 1: Errors Only in Console**
```typescript
// Copilot logged errors but didn't tell the user
catch (error) {
  console.error('Create failed:', error);
}

// We show them in the UI
catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : 'Failed to create task';
  setError(message);  // User sees this
  toast.error(message);  // Or a notification
}
```

---

**Problem 2: No Input Validation**
```typescript
// Copilot would let users create empty tasks
const handleCreateTask = async (title: string) => {
  await api.createTask({ title });
  await refreshTasks();
};

// We validate first
const handleCreateTask = async (title: string) => {
  if (!title || title.trim().length === 0) {
    setError('Task title cannot be empty');
    return;
  }
  
  try {
    await api.createTask({ title: title.trim() });
    await refreshTasks();
    setError(null);
  } catch (error) {
    setError(error.message);
  }
};
```

---

**Problem 3: No Optimistic UI**
```typescript
// User clicks delete, waits for server...
const handleDeleteTask = async (id: string) => {
  await api.deleteTask(id);
  await refreshTasks();
};

// We make it instant
const handleDeleteTask = async (id: string) => {
  const originalTasks = tasks;
  
  // Remove immediately (optimistic update)
  setTasks(tasks.filter(t => t.id !== id));
  
  try {
    await api.deleteTask(id);
    await refreshTasks();
  } catch (error) {
    // Uh oh, restore the task
    setTasks(originalTasks);
    setError('Failed to delete task');
  }
};
```
**Why?** Users see the result instantly. If it fails, we restore it. Better UX.

---

### Then We Added Search

```
"Add a search input with a Search icon.

- Search state
- Input field  
- Pass search to the API
- Make search optional"
```

### What It Generated

```typescript
import { Search } from 'lucide-react';

const [search, setSearch] = useState('');

<div className="search-box">
  <Search size={20} />
  <input
    type="text"
    placeholder="Search tasks..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>

// Update API call:
const data = await api.getTasks(filter, search);
```

### What We Had to Fix

**Problem 1: Too Many API Calls**
```typescript
// Copilot would call API on every keystroke
useEffect(() => {
  refreshTasks();
}, [search]);  // Called 20 times per second

// We added debounce
useEffect(() => {
  const timer = setTimeout(() => {
    refreshTasks();
  }, 500);  // Wait 500ms after user stops typing
  
  return () => clearTimeout(timer);
}, [search]);
```

---

**Problem 2: Search Parameter Not Used**
```typescript
// Copilot typed it but didn't use it
const refreshTasks = useCallback(async () => {
  const data = await api.getTasks(filter);  // Missing search!
  setTasks(data);
}, [filter]);

// We added it
const refreshTasks = useCallback(async () => {
  const data = await api.getTasks(filter, search);  // Added search
  setTasks(data);
}, [filter, search]);
```

---

**Problem 3: Missing Accessibility**
```typescript
// Copilot didn't add accessibility features
<input
  type="text"
  placeholder="Search tasks..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

// We added them
<input
  type="text"
  id="task-search"
  placeholder="Search tasks..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  aria-label="Search tasks by title"
/>
```
**Why?** Screen readers, keyboard navigation, people with disabilities. Important stuff.

---

## Part 3: Summary

### What Copilot Nailed ✅

- ✅ The core logic (switch statements, database queries)
- ✅ React hooks (useState, useEffect, useCallback)
- ✅ Try-catch structure
- ✅ Code organization

### What We Had to Fix ⚠️

- ❌ Type safety (used `any` instead of proper types)
- ❌ Error messages (logged to console, users never saw them)
- ❌ Input validation (didn't validate before sending to API)
- ❌ Performance (search triggered on every keystroke)
- ❌ UX (no feedback to users, no optimistic updates)
- ❌ Accessibility (forgot screen readers, keyboard nav)

### The Numbers

- **AI Generated:** ~45% of final code quality
- **We Fixed/Added:** ~55% of final code quality

It's not that Copilot sucked. It's that Copilot is good at scaffolding and structure, but humans are better at thinking about the actual user experience.

---

## Part 4: Lessons Learned

### For Future Stuff Like This

**Do:**
- ✅ Write clear prompts with specific requirements
- ✅ Review AI output before using it
- ✅ Think about edge cases (What if input is empty? What if network fails?)
- ✅ Test thoroughly
- ✅ Think about real users (Do they see errors? Is it accessible?)

**Don't:**
- ❌ Copy-paste AI code without reviewing
- ❌ Assume it knows your business logic
- ❌ Skip testing
- ❌ Forget users exist
- ❌ Just deploy it without checking

---

## Part 5: How We Did It (Process)

1. **Spot the problem** - "This code is messy"
2. **Write a clear prompt** - Tell Copilot exactly what we need
3. **Get the code** - Copilot generates something
4. **Review it** - Does the logic make sense? Any obvious issues?
5. **Find gaps** - "Error handling is missing", "Doesn't validate input", etc.
6. **Fix it** - Add what's missing, improve what's weak
7. **Test it** - Run the app, make sure it actually works
8. **Commit & ship** - Done!

---

## Part 6: What This Means

**The bottom line:** AI is super helpful for getting started, but it's not a replacement for thinking.

We used Copilot to give us a solid foundation, then we made it better. That's the sweet spot.

- Copilot: Great at writing boilerplate and structure
- Us: Better at thinking about users, edge cases, and making it production-ready

Together? Pretty good. 🎯

---

**Document Status:** Done ✅  
**When:** Week 3  
**What:** How we refactored code with AI assistance and what we had to fix  
**Result:** Better, cleaner, more user-friendly code

