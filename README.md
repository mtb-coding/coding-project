# CodeEdit User Guide
### v0.3.0

CodeEdit is a fully open-source, portable, persistent, and lightweight code editor built mainly on JS that runs entirely within your web browser.

---

## 📂 Project & File Management

- **New Project**: Resets the current environment and starts a fresh project.
- **Open Directory**: Use the **Open Directory** button to load an entire folder structure into the editor. Your browser will keep these files in its local storage database.
- **File Explorer**: The collapsible **File Explorer** panel on the left lets you navigate your project.
  - **Right-click** any file or folder to access context menus for Renaming, Deleting, Creating new sub-items, Copying the path, and downloading a folder as a ZIP.
  - **Double-click** any file or folder label to rename it inline — including the **root project folder**.
  - **Drag and Drop**: Drag files or folders directly into the sidebar to import them into your workspace.
- **Renaming the Project Folder**: Right-click the root folder and choose **Rename Project**, or double-click its label. This updates the display name only — all internal paths remain intact.
- **Recent Files**: A collapsible **Recent Files** panel above the File Explorer tracks the last 20 files you opened. Click any entry to reopen it; click `×` to remove it from the list. Recent files are persisted across sessions.
- **Downloading**: Click **Download Project** in the sidebar to zip your entire workspace. Right-click any folder in the tree and choose **Download Folder** to zip just that subtree. *(Note: Windows may block the unzipped result — right-click the zip, choose Properties, and click Unblock.)*

---

## ✍️ The Editor

- **Tabs**: Manage multiple open files at the top of the editor pane.
  - Right-click a tab for options including "Close Others," "Close All," and Rename (which renames the file in the explorer too).
  - An asterisk (`*`) indicates unsaved changes.
  - Use `Ctrl+Tab` / `Ctrl+Shift+Tab` to cycle between open tabs.
- **Local Search & Replace**: Press `Ctrl+F` (Find) or `Ctrl+H` (Replace) to open the floating widget in the top-right of the editor.
  - Click **Aa** (or press `Alt+C` while the widget is open) to toggle case-sensitive matching.
  - Search matches appear as yellow tick marks on the scrollbar so you can see their distribution across the whole file at a glance.
- **Global Search & Replace**: Use the header input fields to search across **every file in your project**. Click **Replace All** to perform a project-wide replacement.
- **Go to Line / Column**: Press `Ctrl+G`, click the `Ln/Col` indicator in the status bar, or use **Go to…** in the More menu. Enter a line number (e.g. `42`) or a `line:column` pair (e.g. `42:10`).
- **Formatting**: Use `Ctrl+Shift+F` or **Format Code** in the More (`···`) menu to auto-format your code. Supported languages:
  - JavaScript, JSX, TypeScript, TSX (via Prettier)
  - CSS, SCSS, Less (via Prettier)
  - HTML, XML (via Prettier)
  - Markdown (via Prettier)
  - YAML (via Prettier)
  - GraphQL (via Prettier)
  - **LaTeX** (native formatter — normalises blank lines and indents `\begin{}`/`\end{}` blocks)
- **Diff Viewer**: Click **Diff** to open a side-by-side view of your unsaved changes vs. the last saved state. Edits in the right pane are reflected back in the main editor.
- **Copy Contents**: Use **Copy Contents** in the More (`···`) menu to copy the entire file to your clipboard as plain text.
- **Auto-Save on Focus Loss**: Enable in Settings to automatically save the active file whenever you switch away from the editor.

---

## 🗂️ Toolbar

The editor toolbar is organised into three zones:

**Left — Primary actions** (always visible):

| Button | Action |
| :--- | :--- |
| `≡` | Toggle sidebar |
| **New Tab** | Open a new untitled tab |
| **Save** | Save the current file (`Ctrl+S`) |
| **Find/Replace** | Open the local search widget (`Ctrl+F`) |
| `···` | Open the **More** menu (see below) |

**More (`···`) menu** — secondary and less-frequent actions:
- Download File
- Format Code `Ctrl+Shift+F`
- Go to Line… `Ctrl+G`
- Copy Contents
- Save All `Ctrl+Shift+S`
- Download Project (ZIP)
- Close All Tabs

**Right — View toggles**:

| Button | Action |
| :--- | :--- |
| **Diff** | Toggle diff viewer |
| **Preview** | Toggle live preview pane |
| **Settings** | Open editor settings |

---

## 👁️ Preview Mode

Click **Preview** (or use the Command Palette) to open the split-pane live preview. Supported file types:

- **HTML** — renders the page in real time. *(Linked external CSS/JS files are not resolved.)*
- **Markdown** — renders headers, formatting, blockquotes, tables, and code blocks with dark-theme styling.
- **LaTeX (`.tex`)** — renders document structure, sectioning, math (via KaTeX), itemize/enumerate lists, tables, bold/italic, footnotes, `\href`, and verbatim blocks. Title, author, and date are extracted from the preamble automatically.

The preview pane is resizable — drag the divider between the editor and preview to adjust the split.

---

## 🚀 Command Palette

Press `Ctrl+Shift+P` to open the Command Palette. Type to filter commands (e.g. "save," "format," "preview," "diff") and press `Enter` to execute. All major actions are accessible here without needing to remember their shortcuts.

---

## ⚙️ Settings

Open **Settings** from the toolbar or Command Palette to configure:

- Auto-close tags / match brackets / auto-close brackets
- Editor theme (Dark Monokai, Dracula, Solarized, Light)
- Tab width (2, 4, or 8 spaces)
- Word wrap
- Fold gutter
- File templates (pre-fills new files with boilerplate for their file type)
- Auto-save session
- Auto-save on focus loss

---

## 📄 Supported File Types

CodeEdit provides syntax highlighting for a wide range of languages including JavaScript, TypeScript, JSX/TSX, Python, HTML, CSS/SCSS/Less, JSON, Markdown, YAML, SQL, Shell, C/C++, Java, PHP, Ruby, Go, Rust, Swift, Kotlin, Lua, Perl, R, Vue, Svelte, GraphQL, **LaTeX (`.tex`, `.bib`)**, and more.

File icons in the explorer reflect the file type — `.tex` files are shown with 📐 and `.bib` files with 📚.

**File templates**: When creating a new file, CodeEdit pre-fills it with sensible boilerplate based on the extension — including a full `\documentclass{article}` skeleton for `.tex` files and a BibTeX entry template for `.bib` files. Disable this in Settings if you prefer blank files.

---

## 🛠️ Managing Versions (Workspace Isolation)

Because CodeEdit persists your work in your browser's database, you may want to keep your "Working" version separate from your "Stable" version.

1. Open `js/globals.js`.
2. Update the `VERSION` constant (e.g. `"0.3.1"`).
3. CodeEdit will treat this as a completely separate workspace, isolating your files, tabs, and session state from other versions.

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Open Command Palette** | `Ctrl+Shift+P` |
| **Save Current File** | `Ctrl+S` |
| **Save All Files** | `Ctrl+Shift+S` |
| **New Untitled Tab** | `Ctrl+N` |
| **New File** | `Ctrl+Shift+N` |
| **New Folder** | `Ctrl+Shift+D` |
| **Close Tab** | `Ctrl+W` |
| **Cycle Tabs Forward** | `Ctrl+Tab` |
| **Cycle Tabs Backward** | `Ctrl+Shift+Tab` |
| **Format Document** | `Ctrl+Shift+F` |
| **Find in File** | `Ctrl+F` |
| **Replace in File** | `Ctrl+H` |
| **Toggle Case Sensitive (Find)** | `Alt+C` *(widget open)* |
| **Go to Line / Column** | `Ctrl+G` |
| **Toggle Comment** | `Ctrl+/` |
| **Global Search Focus** | `Ctrl+Shift+G` |

---

*Pro-tip: CodeEdit is persistent. Close your browser tab and come back later — your files, folders, open tabs, and recent file history will be exactly where you left them.*
