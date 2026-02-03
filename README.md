
# Mark - File Task Manager

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Track your file progress visually across tasks.** Perfect for code reviews, refactoring projects, and team collaboration.

Mark helps you organize files into tasks and track their completion status with visual badges in VS Code's file explorer. Whether you're reviewing code, refactoring a large codebase, or coordinating work across your team, Mark keeps you organized.

## ✨ Features

- **📋 Task Management** - Create tasks and organize files into logical groups
- **✅ Visual Progress** - See completion status with color-coded badges (✓ done, ○ in progress)
- **🎯 Active Task** - Set an active task for quick file marking without menus
- **📁 Bulk Operations** - Add entire directories recursively with one click
- **🔄 Git-Friendly** - Store task data in `.mark-tasks.json` for team sharing
- **🎨 Sidebar View** - Dedicated sidebar showing all tasks with progress tracking
- **⌨️ CLI Support** - Scriptable commands for automation and AI agent integration
- **🌳 Smart Filtering** - Automatically excludes `node_modules`, `.git`, and other build artifacts

## 🎬 Quick Start

1. **Create a task**: Command Palette → "Mark: Create New Task"
2. **Set it as active** when prompted
3. **Right-click files or folders** in Explorer → "Mark: Mark File as Done"
4. **Track progress** in the Mark sidebar (checklist icon in Activity Bar)

## 💡 Use Cases

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

Access commands via Command Palette (Ctrl+Shift+P / Cmd+Shift+P) or terminal:

- **Mark: Create New Task** - Create a new task and optionally set it as active
- **Mark: Set Active Task** - Set which task you're currently working on
- **Mark: Mark File as Done** - Add file to active task and mark as done (or create task if none exists)
- **Mark: Mark File as Undone** - Add file to active task without done status
- **Mark: List All Tasks** - Show all tasks with their progress (★ indicates active task)
- **Mark: Show Files in Task** - View all files in a specific task
- **Mark: Delete Task** - Delete a task
- **Mark: Remove File from Task** - Remove a file from a task

## Usage

### Quick Start
1. Create a task: Command Palette → "Mark: Create New Task"
2. Set it as active when prompted
3. Right-click files in Explorer → "Mark: Mark File as Done"
4. Files are added to the active task with a green checkmark (✓)
5. View your tasks in the Mark sidebar (checklist icon in Activity Bar)

### Working with Tasks
- Files belong to tasks and have a done/undone state within each task
- Set an active task to quickly add files without selecting a task each time
- Active task files show badges in the Explorer: ✓ (done) or ○ (in task)
- The sidebar shows all tasks with the active task marked with ★

### CLI Usage
All commands can be executed from the terminal or via AI agents:
```bash
# These are the command IDs that can be executed programmatically
mark.createTask
mark.setActiveTask
mark.markFileDone
mark.markFileUndone
mark.listTasks
mark.deleteTask
```

## Data Storage

Task data is stored in `.mark-tasks.json` in your workspace root. You can:
- Commit this file to share task status with your team
- Add it to `.gitignore` if you want to keep it local

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**thebadking**
- GitHub: [@thebadking](https://github.com/thebadking)

## 🐛 Issues

Found a bug or have a feature request? [Open an issue](https://github.com/thebadking/mark-vscode/issues)

## Development

- Run `npm install` to install dependencies
- Run `npm run compile` to compile the extension
- Press F5 to open a new VS Code window with the extension loaded
- Make changes and reload the window to test

---

**Enjoy using Mark!** ⭐ Star the repo if you find it useful!
