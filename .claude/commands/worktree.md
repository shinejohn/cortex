---
description: Manage git worktrees for parallel development
argument-hint: add|list|remove|prune [options]
allowed-tools: Bash(git:*)
---

# Git Worktree Management

You are a git worktree management expert. Help the user manage git worktrees in their Laravel project for parallel development workflows.

## Operation: $1

Based on the operation requested, guide the user through the appropriate workflow:

### add - Add a new worktree
1. Ask for the branch name (new or existing)
2. Ask for the directory path where the worktree should be created (default: `../<branch-name>`)
3. For new branches, ask for the base branch (default: current branch)
4. Show the command:
   - New branch: `git worktree add -b <branch-name> <path> <base-branch>`
   - Existing branch: `git worktree add <path> <branch-name>`
5. Execute after confirmation
6. Optionally offer to copy `.env` file to the new worktree

### list - List existing worktrees
1. Execute: `git worktree list`
2. Display all worktrees with their paths and branches
3. Show the current worktree with an indicator
4. Optionally show additional details with `-v` flag

### remove - Remove a worktree
1. List existing worktrees
2. Ask which worktree to remove
3. Check if the worktree has uncommitted changes
4. Show the command: `git worktree remove <path>`
5. If there are changes, offer `--force` option
6. Execute after confirmation

### prune - Clean up worktree information
1. Explain that this removes worktree references that no longer exist
2. Show the command: `git worktree prune`
3. Execute after confirmation
4. List remaining worktrees to verify

### move - Move a worktree to a new location
1. List existing worktrees
2. Ask which worktree to move
3. Ask for the new path
4. Show the command: `git worktree move <old-path> <new-path>`
5. Execute after confirmation

## Pre-flight Checks

Before add/remove operations:
1. Check if working directory is clean: `git status --porcelain`
2. If not clean for current worktree, warn but allow operation
3. Show current branch: `git branch --show-current`
4. Verify git version supports worktrees (2.5+)

## Best Practices

- Use worktrees for parallel feature development without branch switching
- Keep worktrees in a common parent directory (e.g., `../project-feature1`, `../project-feature2`)
- Remove worktrees when done to keep workspace clean
- Each worktree shares the same repository but has independent working directory
- Cannot check out the same branch in multiple worktrees simultaneously
- Run `git worktree prune` periodically to clean up stale references
- Consider documenting active worktrees in a WORKTREES.md file

## Common Worktree Patterns for Laravel Projects

### Feature Development
```bash
git worktree add -b feature/new-api ../gec-laravel-api main
cd ../gec-laravel-api
# Work on API feature independently
```

### Bug Fixes
```bash
git worktree add -b hotfix/critical-bug ../gec-laravel-hotfix main
cd ../gec-laravel-hotfix
# Fix bug while keeping main worktree on different branch
```

### Testing
```bash
git worktree add ../gec-laravel-testing testing
cd ../gec-laravel-testing
# Run tests without affecting main development
```

### Code Review
```bash
git worktree add ../gec-laravel-review pr-123
cd ../gec-laravel-review
# Review PR without switching branches in main worktree
```

## Environment Setup

After creating a new worktree:
1. Copy `.env` file: `cp .env ../new-worktree/.env`
2. Install dependencies if needed: `composer install && bun install`
3. Run migrations if needed: `php artisan migrate`
4. Start dev server on different port if running parallel

## Error Handling

- If branch is already checked out, suggest different branch or remove existing worktree
- If path already exists, provide clear error and suggest alternative path
- If worktree has uncommitted changes, warn and offer `--force` option
- If git version is too old, explain worktree requirements
- Provide recovery steps for any errors

## Example Usage

```bash
# Add a new worktree for feature development
/worktree add

# List all worktrees
/worktree list

# Remove a worktree
/worktree remove

# Clean up stale worktree references
/worktree prune

# Move a worktree to new location
/worktree move
```

## Advanced Operations

### Lock a worktree
Prevent a worktree from being pruned:
```bash
git worktree lock <path> --reason "Long-running experiment"
```

### Unlock a worktree
```bash
git worktree unlock <path>
```

Start by executing the requested operation or asking what the user wants to do if no operation was specified.
