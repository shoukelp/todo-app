# 📝 Todo List App

A simple and responsive To-Do list web application built using React and Supabase. Allows users to manage tasks with authentication and data storage features both online and locally (guest mode).

**[User Guide](docs/user_guide.md) | [Local Installation](docs/local_installation.md)**

## Demo

[https://shoukelp.github.io/todo-app/](https://shoukelp.github.io/todo-app/)

## Features

- ✅ Add, edit, delete and mark tasks as completed/unfinished.
- 🎨 Set task priority (High, Medium, Low) indicated by color.
- 🔍 Filter tasks by status (All, Active, Completed).
- 🗃️ Sort tasks by creation date (Newest/Last) or alphabetically (A-Z/Z-A).
- Flexible login options:
    - Google OAuth (Quick login with Google account).
    - Email & Password (Manual registration and login).
    - Guest Mode (Use the app without login, data is temporarily stored in browser cookies).
- ☁️ Automatic synchronization to Supabase database upon login, ensuring data is secure and available everywhere.
- Responsive design for a good experience on both desktop and mobile.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.