---
description: Guide to committing code using Conventional Commits standard
---

Follow these steps to ensure clean, meaningful, and standardized git commits.

## 1. Stage Changes Thoughtfully
Don't just `git add .`. Review what you are adding.
```bash
git status
git diff           # View changes to be staged
git add <filename> # Add specific files related to one logical change
```

## 2. Commit Message Structure
Use the **Conventional Commits** format:
`<type>(<scope>): <subject>`

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope (Optional)
The scope provides additional context given in parenthesis.
- Examples: `feat(auth)`, `fix(header)`, `refactor(be-connection)`

### Subject
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

## 3. Examples

**Good:**
```bash
git commit -m "feat(auth): implement login with JWT token"
git commit -m "fix(student-dashboard): resolve loading spinner issue"
git commit -m "refactor: migrate onNavigate to useNavigate hook"
git commit -m "chore: add .gitignore for frontend"
```

**Bad:**
- `git commit -m "update"` (Too vague)
- `git commit -m "Fixed bug"` (What bug?)
- `git commit -m "Completed tasks"` (Which tasks?)

## 4. Full Commit (for complex changes)
If the change needs more explanation, use a body:
```bash
git commit
```
(This opens your editor)
```
feat(router): integration of react-router-dom v6

- Replaced manual routing in App.tsx
- Added ProtectedRoute component for role-based access
- Updated all dashboards to use automatic navigation

Resolves: #123
```

## 5. Pre-push Check
Before pushing, verify your history looks clean:
```bash
git log --oneline -n 5
```
