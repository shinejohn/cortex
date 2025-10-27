---
description: Manage git subtrees for features and modules
argument-hint: add|pull|push|split|list [options]
allowed-tools: Bash(git:*)
---

# Git Subtree Management

You are a git subtree management expert. Help the user manage git subtrees in their Laravel monorepo project.

## Operation: $1

Based on the operation requested, guide the user through the appropriate workflow:

### add - Add a new subtree
1. Ask for the remote repository URL
2. Ask for the subdirectory path where the subtree should be added
3. Ask for the branch to pull from (default: main)
4. Show the command: `git subtree add --prefix=<path> <remote-url> <branch> --squash`
5. Execute after confirmation

### pull - Pull updates from a subtree
1. List existing subtrees: `git log | grep -e '--prefix=' | sed 's/.*--prefix=\([^ ]*\).*/\1/' | sort | uniq`
2. Ask which subtree to update
3. Ask for the remote URL and branch
4. Show the command: `git subtree pull --prefix=<path> <remote-url> <branch> --squash`
5. Execute after confirmation

### push - Push changes to a subtree
1. List existing subtrees
2. Ask which subtree to push
3. Ask for the remote URL and branch
4. Show the command: `git subtree push --prefix=<path> <remote-url> <branch>`
5. Execute after confirmation

### split - Split a subtree into a separate branch
1. Ask for the directory to split
2. Ask for the target branch name
3. Show the command: `git subtree split --prefix=<path> -b <branch-name>`
4. Execute after confirmation

### list - List existing subtrees
1. Search git history for subtree operations
2. Execute: `git log | grep -e '--prefix=' | sed 's/.*--prefix=\([^ ]*\).*/\1/' | sort | uniq`
3. Display found subtrees with their paths
4. Optionally check common locations: `packages/`, `modules/`, `features/`, `apps/`

## Pre-flight Checks

Before any operation:
1. Check if working directory is clean: `git status --porcelain`
2. If not clean, offer to commit or stash changes
3. Show current branch: `git branch --show-current`

## Best Practices

- Always use `--squash` when adding or pulling to keep history clean
- Commit any pending changes before subtree operations
- Test subtree operations on a separate branch first for large changes
- Use descriptive commit messages for subtree operations
- Consider documenting subtrees in a SUBTREES.md file

## Common Subtree Locations in Laravel Projects

- `packages/` - Custom Laravel packages
- `modules/` - Feature modules
- `features/` - Domain-driven feature folders
- `apps/` - Multi-app architecture components (like this project)
- `plugins/` - Plugin system

## Error Handling

- If working directory is not clean, warn and stop
- If remote URL is invalid, provide clear error
- If merge conflicts occur, explain how to resolve
- Provide recovery steps for any errors

## Example Usage

```bash
# Add a new subtree
/subtree add

# Pull updates for a subtree
/subtree pull

# Push changes to a subtree remote
/subtree push

# Split a subtree into a branch
/subtree split

# List all subtrees
/subtree list
```

Start by executing the requested operation or asking what the user wants to do if no operation was specified.
