import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TaskFile {
	path: string;
	done: boolean;
	addedAt: string;
}

interface Task {
	name: string;
	files: TaskFile[];
	created: string;
}

interface TaskData {
	tasks: Record<string, Task>;
	activeTask?: string;
}

class TaskManager {
	private data!: TaskData;
	private dataFilePath: string;
	private workspaceRoot: string;

	constructor(workspaceRoot: string) {
		this.workspaceRoot = workspaceRoot;
		this.dataFilePath = path.join(workspaceRoot, '.filequest-tasks.json');
		this.load();
	}

	private toRelativePath(absolutePath: string): string {
		return path.relative(this.workspaceRoot, absolutePath);
	}

	private toAbsolutePath(relativePath: string): string {
		return path.join(this.workspaceRoot, relativePath);
	}

	private load(): void {
		if (fs.existsSync(this.dataFilePath)) {
			try {
				const content = fs.readFileSync(this.dataFilePath, 'utf8');
				this.data = JSON.parse(content);
			} catch (error) {
				console.error('Error loading task data:', error);
				this.data = { tasks: {} };
			}
		} else {
			this.data = { tasks: {} };
		}
	}

	private save(): void {
		try {
			fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data, null, 2), 'utf8');
		} catch (error) {
			console.error('Error saving task data:', error);
			vscode.window.showErrorMessage('Failed to save task data');
		}
	}

	getActiveTask(): string | undefined {
		return this.data.activeTask;
	}

	setActiveTask(taskName: string | undefined): void {
		this.data.activeTask = taskName;
		this.save();
	}

	markFileDone(taskName: string, filePath: string): boolean {
		const task = this.data.tasks[taskName];
		if (!task) {return false;}

		const relativePath = this.toRelativePath(filePath);
		const existingFile = task.files.find(f => f.path === relativePath);

		if (existingFile) {
			existingFile.done = true;
		} else {
			task.files.push({
				path: relativePath,
				done: true,
				addedAt: new Date().toISOString()
			});
			task.files.sort((a, b) => a.path.localeCompare(b.path));
		}
		this.save();
		return true;
	}

	markFileUndone(taskName: string, filePath: string): boolean {
		const task = this.data.tasks[taskName];
		if (!task) {return false;}

		const relativePath = this.toRelativePath(filePath);
		const existingFile = task.files.find(f => f.path === relativePath);

		if (existingFile) {
			existingFile.done = false;
		} else {
			task.files.push({
				path: relativePath,
				done: false,
				addedAt: new Date().toISOString()
			});
			task.files.sort((a, b) => a.path.localeCompare(b.path));
		}
		this.save();
		return true;
	}

	isFileDone(taskName: string, filePath: string): boolean {
		const task = this.data.tasks[taskName];
		if (!task) {return false;}

		const relativePath = this.toRelativePath(filePath);
		const file = task.files.find(f => f.path === relativePath);
		return file?.done ?? false;
	}

	isFileInTask(taskName: string, filePath: string): boolean {
		const task = this.data.tasks[taskName];
		if (!task) {return false;}

		const relativePath = this.toRelativePath(filePath);
		return task.files.some(f => f.path === relativePath);
	}

	createTask(taskName: string, setAsActive = false): boolean {
		if (this.data.tasks[taskName]) {
			return false;
		}
		this.data.tasks[taskName] = {
			name: taskName,
			files: [],
			created: new Date().toISOString()
		};
		if (setAsActive) {
			this.data.activeTask = taskName;
		}
		this.save();
		return true;
	}

	removeFileFromTask(taskName: string, filePath: string): boolean {
		const task = this.data.tasks[taskName];
		if (!task) {
			return false;
		}
		const relativePath = this.toRelativePath(filePath);
		const index = task.files.findIndex(f => f.path === relativePath);
		if (index > -1) {
			task.files.splice(index, 1);
			this.save();
			return true;
		}
		return false;
	}

	getTaskFiles(taskName: string): {absolutePath: string, done: boolean}[] {
		const task = this.data.tasks[taskName];
		if (!task) {
			return [];
		}
		return task.files.map(f => ({
			absolutePath: this.toAbsolutePath(f.path),
			done: f.done
		}));
	}

	getTask(taskName: string): Task | undefined {
		return this.data.tasks[taskName];
	}

	getAllTasks(): Task[] {
		return Object.values(this.data.tasks);
	}

	deleteTask(taskName: string): boolean {
		if (this.data.tasks[taskName]) {
			delete this.data.tasks[taskName];
			this.save();
			return true;
		}
		return false;
	}

	reload(): void {
		this.load();
	}

	async addDirectoryToTask(taskName: string, dirPath: string, asDone: boolean): Promise<number> {
		const task = this.data.tasks[taskName];
		if (!task) {return 0;}

		let addedCount = 0;
		const entries = await this.getFilesRecursively(dirPath);

		for (const filePath of entries) {
			const relativePath = this.toRelativePath(filePath);
			const existingFile = task.files.find(f => f.path === relativePath);

			if (!existingFile) {
				task.files.push({
					path: relativePath,
					done: asDone,
					addedAt: new Date().toISOString()
				});
				addedCount++;
			}
		}

		if (addedCount > 0) {
			task.files.sort((a, b) => a.path.localeCompare(b.path));
			this.save();
		}

		return addedCount;
	}

	private async getFilesRecursively(dirPath: string): Promise<string[]> {
		const files: string[] = [];

		const processDirectory = (dir: string) => {
			const entries = fs.readdirSync(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);

				// Skip node_modules, .git, and other common directories
				if (entry.isDirectory()) {
					const dirName = entry.name;
					if (dirName === 'node_modules' || dirName === '.git' ||
					    dirName === 'dist' || dirName === 'out' ||
					    dirName === '.vscode' || dirName.startsWith('.')) {
						continue;
					}
					processDirectory(fullPath);
				} else if (entry.isFile()) {
					files.push(fullPath);
				}
			}
		};

		processDirectory(dirPath);
		return files;
	}
}

class FileDecorationProvider implements vscode.FileDecorationProvider {
	private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
	readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

	constructor(private taskManager: TaskManager) {}

	provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
		const activeTask = this.taskManager.getActiveTask();
		if (!activeTask) {return undefined;}

		if (this.taskManager.isFileDone(activeTask, uri.fsPath)) {
			return {
				badge: '✓',
				tooltip: `Marked as done in task: ${activeTask}`,
				color: new vscode.ThemeColor('charts.green')
			};
		} else if (this.taskManager.isFileInTask(activeTask, uri.fsPath)) {
			return {
				badge: '○',
				tooltip: `In task: ${activeTask} (not done)`,
				color: new vscode.ThemeColor('charts.yellow')
			};
		}
		return undefined;
	}

	refresh(): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this._onDidChangeFileDecorations.fire(undefined as any);
	}
}

class TaskTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly itemType: 'task' | 'file',
		public readonly filePath?: string,
		public readonly taskName?: string,
		public readonly isDone?: boolean
	) {
		super(label, collapsibleState);

		if (itemType === 'file') {
			this.contextValue = 'file';
			this.command = {
				command: 'filequest.openFile',
				title: 'Open File',
				arguments: [filePath]
			};
			this.iconPath = new vscode.ThemeIcon(
				'file',
				isDone ? new vscode.ThemeColor('charts.green') : undefined
			);
			this.description = isDone ? '✓' : '';
		} else {
			this.contextValue = 'task';
			this.iconPath = new vscode.ThemeIcon('folder');
		}
	}
}

class TaskTreeDataProvider implements vscode.TreeDataProvider<TaskTreeItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	private flatView = false;
	private selectedTask: string | undefined;

	constructor(private taskManager?: TaskManager) {}

	setTaskManager(taskManager: TaskManager | undefined): void {
		this.taskManager = taskManager;
		this.refresh();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	toggleViewMode(): void {
		this.flatView = !this.flatView;
		this.refresh();
	}

	setSelectedTask(taskName: string | undefined): void {
		this.selectedTask = taskName;
		this.refresh();
	}

	getTreeItem(element: TaskTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: TaskTreeItem): Thenable<TaskTreeItem[]> {
		if (!element) {
			const manager = this.taskManager;
			if (!manager) {
				return Promise.resolve([]);
			}
			const tasks = manager.getAllTasks();
			if (tasks.length === 0) {
				return Promise.resolve([]);
			}

			if (this.selectedTask) {
				const files = manager.getTaskFiles(this.selectedTask);
				return Promise.resolve(this.getFileItems(files, this.selectedTask));
			}

			return Promise.resolve(
				tasks.map(task => {
					const files = manager.getTaskFiles(task.name);
					const doneCount = files.filter(f => f.done).length;
					const activeMarker = manager.getActiveTask() === task.name ? ' ★' : '';
					const label = `${task.name}${activeMarker} (${doneCount}/${files.length})`;
					return new TaskTreeItem(
						label,
						vscode.TreeItemCollapsibleState.Collapsed,
						'task',
						undefined,
						task.name
					);
				})
			);
		} else if (element.itemType === 'task' && element.taskName) {
			if (!this.taskManager) {
				return Promise.resolve([]);
			}
			const files = this.taskManager.getTaskFiles(element.taskName);
			return Promise.resolve(this.getFileItems(files, element.taskName));
		}

		return Promise.resolve([]);
	}

	private getFileItems(files: {absolutePath: string, done: boolean}[], taskName: string): TaskTreeItem[] {
		if (this.flatView) {
			return files.map(file => {
				return new TaskTreeItem(
					path.basename(file.absolutePath),
					vscode.TreeItemCollapsibleState.None,
					'file',
					file.absolutePath,
					taskName,
					file.done
				);
			});
		} else {
			return files.map(file => {
				return new TaskTreeItem(
					path.basename(file.absolutePath),
					vscode.TreeItemCollapsibleState.None,
					'file',
					file.absolutePath,
					taskName,
					file.done
				);
			});
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Filequest extension is now active!');

	let taskManager: TaskManager | undefined;
	let decorationProvider: FileDecorationProvider | undefined;
	let taskTreeDataProvider: TaskTreeDataProvider | undefined;
	let fileWatcher: vscode.FileSystemWatcher | undefined;

	const getTaskManager = (showNoWorkspaceError = true): TaskManager | undefined => {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			if (showNoWorkspaceError) {
				vscode.window.showErrorMessage('No workspace folder open. Please open a folder to use Filequest.');
			}
			return undefined;
		}
		if (!taskManager) {
			taskManager = new TaskManager(workspaceRoot);
			decorationProvider = new FileDecorationProvider(taskManager);
			taskTreeDataProvider?.setTaskManager(taskManager);

			// Watch for external changes to the database file
			const dataFilePattern = new vscode.RelativePattern(workspaceRoot, '.filequest-tasks.json');
			fileWatcher = vscode.workspace.createFileSystemWatcher(dataFilePattern);

			const reloadAndRefresh = () => {
				taskManager?.reload();
				decorationProvider?.refresh();
				taskTreeDataProvider?.refresh();
			};

			fileWatcher.onDidChange(reloadAndRefresh);
			fileWatcher.onDidCreate(reloadAndRefresh);
			fileWatcher.onDidDelete(reloadAndRefresh);

			context.subscriptions.push(
				vscode.window.registerFileDecorationProvider(decorationProvider),
				fileWatcher
			);
		}
		return taskManager;
	};

	if (!taskTreeDataProvider) {
		taskTreeDataProvider = new TaskTreeDataProvider();
		context.subscriptions.push(
			vscode.window.registerTreeDataProvider('filequestTaskView', taskTreeDataProvider)
		);
	}

	getTaskManager(false);

	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			getTaskManager(false);
		})
	);

	const markFileDone = vscode.commands.registerCommand('filequest.markFileDone', async (uri?: vscode.Uri) => {
		const manager = getTaskManager();
		if (!manager) {return;}

		const filePath = uri?.fsPath || vscode.window.activeTextEditor?.document.uri.fsPath;
		if (!filePath) {
			vscode.window.showErrorMessage('No file selected');
			return;
		}

		let taskName = manager.getActiveTask();

		if (!taskName) {
			const tasks = manager.getAllTasks();
			if (tasks.length === 0) {
				const newTaskName = await vscode.window.showInputBox({
					prompt: 'No tasks exist. Create a new task',
					placeHolder: 'task-name'
				});
				if (!newTaskName) {return;}
				manager.createTask(newTaskName, true);
				taskName = newTaskName;
			} else {
				const choices = [...tasks.map(t => t.name), '$(add) Create new task'];
				const selected = await vscode.window.showQuickPick(choices, {
					placeHolder: 'Select a task to add this file to'
				});
				if (!selected) {return;}

				if (selected === '$(add) Create new task') {
					const newTaskName = await vscode.window.showInputBox({
						prompt: 'Enter task name',
						placeHolder: 'task-name'
					});
					if (!newTaskName) {return;}
					manager.createTask(newTaskName, true);
					taskName = newTaskName;
				} else {
					taskName = selected;
					manager.setActiveTask(taskName);
				}
			}
		}

		// Check if it's a directory
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			const count = await manager.addDirectoryToTask(taskName, filePath, true);
			decorationProvider?.refresh();
			taskTreeDataProvider?.refresh();
			vscode.window.showInformationMessage(`Added ${count} files as done from ${path.basename(filePath)} to ${taskName}`);
		} else {
			manager.markFileDone(taskName, filePath);
			decorationProvider?.refresh();
			taskTreeDataProvider?.refresh();
			vscode.window.showInformationMessage(`Marked as done in ${taskName}: ${path.basename(filePath)}`);
		}
	});

	const markFileUndone = vscode.commands.registerCommand('filequest.markFileUndone', async (uri?: vscode.Uri) => {
		const manager = getTaskManager();
		if (!manager) {return;}

		const filePath = uri?.fsPath || vscode.window.activeTextEditor?.document.uri.fsPath;
		if (!filePath) {
			vscode.window.showErrorMessage('No file selected');
			return;
		}

		let taskName = manager.getActiveTask();

		if (!taskName) {
			const tasks = manager.getAllTasks();
			if (tasks.length === 0) {
				const newTaskName = await vscode.window.showInputBox({
					prompt: 'No tasks exist. Create a new task',
					placeHolder: 'task-name'
				});
				if (!newTaskName) {return;}
				manager.createTask(newTaskName, true);
				taskName = newTaskName;
			} else {
				const choices = [...tasks.map(t => t.name), '$(add) Create new task'];
				const selected = await vscode.window.showQuickPick(choices, {
					placeHolder: 'Select a task to add this file to'
				});
				if (!selected) {return;}

				if (selected === '$(add) Create new task') {
					const newTaskName = await vscode.window.showInputBox({
						prompt: 'Enter task name',
						placeHolder: 'task-name'
					});
					if (!newTaskName) {return;}
					manager.createTask(newTaskName, true);
					taskName = newTaskName;
				} else {
					taskName = selected;
					manager.setActiveTask(taskName);
				}
			}
		}

		// Check if it's a directory
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			const count = await manager.addDirectoryToTask(taskName, filePath, false);
			decorationProvider?.refresh();
			taskTreeDataProvider?.refresh();
			vscode.window.showInformationMessage(`Added ${count} files from ${path.basename(filePath)} to ${taskName}`);
		} else {
			manager.markFileUndone(taskName, filePath);
			decorationProvider?.refresh();
			taskTreeDataProvider?.refresh();
			vscode.window.showInformationMessage(`Added to ${taskName}: ${path.basename(filePath)}`);
		}
	});

	const createTask = vscode.commands.registerCommand('filequest.createTask', async () => {
		const manager = getTaskManager();
		if (!manager) {return;}
		const taskName = await vscode.window.showInputBox({
			prompt: 'Enter task name',
			placeHolder: 'my-task'
		});

		if (!taskName) {
			return;
		}

		const setActive = await vscode.window.showQuickPick(['Yes', 'No'], {
			placeHolder: 'Set as active task?'
		});

		if (manager.createTask(taskName, setActive === 'Yes')) {
			decorationProvider?.refresh();
			taskTreeDataProvider?.refresh();
			vscode.window.showInformationMessage(`Task created: ${taskName}${setActive === 'Yes' ? ' (active)' : ''}`);
		} else {
			vscode.window.showErrorMessage(`Task already exists: ${taskName}`);
		}
	});

	const setActiveTask = vscode.commands.registerCommand('filequest.setActiveTask', async () => {
		const manager = getTaskManager();
		if (!manager) {return;}

		const tasks = manager.getAllTasks();
		if (tasks.length === 0) {
			vscode.window.showErrorMessage('No tasks available');
			return;
		}

		const currentActive = manager.getActiveTask();
		const choices = [...tasks.map(t => ({
			label: t.name,
			description: t.name === currentActive ? '(current)' : ''
		})), { label: '$(circle-slash) Clear active task', description: '' }];

		const selected = await vscode.window.showQuickPick(choices, {
			placeHolder: 'Select active task'
		});

		if (!selected) {return;}

		if (selected.label === '$(circle-slash) Clear active task') {
			manager.setActiveTask(undefined);
			vscode.window.showInformationMessage('Active task cleared');
		} else {
			manager.setActiveTask(selected.label);
			vscode.window.showInformationMessage(`Active task: ${selected.label}`);
		}

		decorationProvider?.refresh();
		taskTreeDataProvider?.refresh();
	});

	const listTasks = vscode.commands.registerCommand('filequest.listTasks', () => {
		const manager = getTaskManager();
		if (!manager) {return;}

		const tasks = manager.getAllTasks();
		if (tasks.length === 0) {
			vscode.window.showInformationMessage('No tasks found');
			return;
		}

		const activeTask = manager.getActiveTask();
		const taskInfo = tasks.map(t => {
			const files = manager.getTaskFiles(t.name);
			const doneCount = files.filter(f => f.done).length;
			const activeMarker = t.name === activeTask ? ' ★' : '';
			return `${t.name}${activeMarker} (${doneCount}/${files.length} done)`;
		}).join('\n');

		vscode.window.showInformationMessage(taskInfo);
	});

	const showTaskFiles = vscode.commands.registerCommand('filequest.showTaskFiles', async () => {
		const manager = getTaskManager();
		if (!manager) {return;}

		const tasks = manager.getAllTasks();
		if (tasks.length === 0) {
			vscode.window.showErrorMessage('No tasks available');
			return;
		}

		const taskName = await vscode.window.showQuickPick(
			tasks.map(t => t.name),
			{ placeHolder: 'Select a task' }
		);

		if (!taskName) {
			return;
		}

		const files = manager.getTaskFiles(taskName);
		if (files.length === 0) {
			vscode.window.showInformationMessage(`No files in task: ${taskName}`);
			return;
		}

		const fileInfo = files.map(f => {
			const status = f.done ? '✓' : '○';
			return `${status} ${path.basename(f.absolutePath)}`;
		}).join('\n');

		vscode.window.showInformationMessage(`Task: ${taskName}\n${fileInfo}`);
	});

	const deleteTask = vscode.commands.registerCommand('filequest.deleteTask', async () => {
		const manager = getTaskManager();
		if (!manager) {return;}

		const tasks = manager.getAllTasks();
		if (tasks.length === 0) {
			vscode.window.showErrorMessage('No tasks available');
			return;
		}

		const taskName = await vscode.window.showQuickPick(
			tasks.map(t => t.name),
			{ placeHolder: 'Select a task to delete' }
		);

		if (!taskName) {
			return;
		}

		if (manager.deleteTask(taskName)) {
			taskTreeDataProvider?.refresh();
			vscode.window.showInformationMessage(`Task deleted: ${taskName}`);
		}
	});

	const refreshTaskView = vscode.commands.registerCommand('filequest.refreshTaskView', () => {
		taskManager?.reload();
		decorationProvider?.refresh();
		taskTreeDataProvider?.refresh();
	});

	const toggleViewMode = vscode.commands.registerCommand('filequest.toggleViewMode', () => {
		taskTreeDataProvider?.toggleViewMode();
	});

	const removeFileFromTask = vscode.commands.registerCommand('filequest.removeFileFromTask', async (item: TaskTreeItem) => {
		const manager = getTaskManager();
		if (!manager || !item.filePath || !item.taskName) {return;}

		if (manager.removeFileFromTask(item.taskName, item.filePath)) {
			taskTreeDataProvider?.refresh();
			vscode.window.showInformationMessage(`Removed ${path.basename(item.filePath)} from task: ${item.taskName}`);
		}
	});

	const openFile = vscode.commands.registerCommand('filequest.openFile', async (filePath: string) => {
		if (!filePath) {return;}
		const uri = vscode.Uri.file(filePath);
		await vscode.window.showTextDocument(uri);
	});

	context.subscriptions.push(
		markFileDone,
		markFileUndone,
		createTask,
		setActiveTask,
		listTasks,
		showTaskFiles,
		deleteTask,
		refreshTaskView,
		toggleViewMode,
		removeFileFromTask,
		openFile
	);
}
