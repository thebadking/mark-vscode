# Filequest - File Task Manager

![Filequest Logo](images/full_logo_bg.png)

![Version](https://img.shields.io/badge/version-0.1.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Track your file progress visually across tasks.** Perfect for code reviews, refactoring projects, and team collaboration.

Filequest helps you organize files into tasks and track their completion status with visual badges in VS Code's file explorer. Whether you're reviewing code, refactoring a large codebase, or coordinating work across your team, Filequest keeps you organized.

## Features

- **Task Management** - Create tasks and organize files into logical groups
- **Visual Progress** - See completion status with color-coded badges (✓ done, ○ in progress)
- **Active Task** - Set an active task for quick file marking without menus
- **Bulk Operations** - Add entire directories recursively with one click
- **Git-Friendly** - Store task data in `.filequest-tasks.json` for team sharing
- **Sidebar View** - Dedicated sidebar showing all tasks with progress tracking
- **Auto-Sync** - Automatically detects external changes to the task file
- **CLI Support** - Scriptable commands for automation and AI agent integration
- **Smart Filtering** - Automatically excludes `node_modules`, `.git`, and other build artifacts

## Quick Start

1. **Create a task**: Command Palette → "Filequest: Create New Task"
2. **Set it as active** when prompted
3. **Right-click files or folders** in Explorer → "Filequest: Mark File as Done"
4. **Track progress** in the Filequest sidebar (checklist icon in Activity Bar)

## Use Cases

### Code Reviews
- Create a task for each pull request
- Mark files as reviewed with a single click
- Track review progress across large PRs
- Share review status with your team via git

### Refactoring Projects
- Organize files by refactoring stage
- Track which files have been updated
- Coordinate parallel refactoring work
- Avoid duplicate effort across team members

### Learning Codebases
- Create tasks for different features/modules
- Mark files as understood while exploring
- Build a mental map of the codebase
- Resume exploration sessions seamlessly

### Documentation
- Track which files need documentation
- Mark files as documented
- Coordinate documentation efforts
- Ensure complete coverage

## Commands

Access commands via Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

| Command | Description |
|---------|-------------|
| Filequest: Create New Task | Create a new task and optionally set it as active |
| Filequest: Set Active Task | Set which task you're currently working on |
| Filequest: Mark File as Done | Add file to active task and mark as done |
| Filequest: Mark File as Undone | Add file to active task without done status |
| Filequest: List All Tasks | Show all tasks with their progress |
| Filequest: Show Files in Task | View all files in a specific task |
| Filequest: Delete Task | Delete a task |
| Filequest: Remove File from Task | Remove a file from a task |
| Filequest: Refresh Task View | Reload task data from disk |
| Filequest: Toggle Flat/Tree View | Switch between view modes |

## Usage

### Working with Tasks
- Files belong to tasks and have a done/undone state within each task
- Set an active task to quickly add files without selecting a task each time
- Active task files show badges in the Explorer: ✓ (done) or ○ (in task)
- The sidebar shows all tasks with the active task marked with ★

### Programmatic Usage
Commands can be executed via VS Code's command API:
```
filequest.createTask
filequest.setActiveTask
filequest.markFileDone
filequest.markFileUndone
filequest.listTasks
filequest.showTaskFiles
filequest.deleteTask
filequest.removeFileFromTask
filequest.refreshTaskView
filequest.toggleViewMode
```

## Data Storage

Task data is stored in `.filequest-tasks.json` in your workspace root. You can:
- Commit this file to share task status with your team
- Add it to `.gitignore` if you want to keep it local

The extension automatically detects external changes to this file and syncs the UI.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**thebadking**
- GitHub: [@thebadking](https://github.com/thebadking)

## Issues

Found a bug or have a feature request? [Open an issue](https://github.com/thebadking/mark-vscode/issues)

## Development

```bash
npm install
npm run compile
```

Press F5 to open a new VS Code window with the extension loaded.
