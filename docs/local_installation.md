# Local Installation & Usage

## Requirements

- [Node.js & npm/yarn](https://nodejs.org/) (LTS version recommended)
- [Supabase account](https://supabase.com/) (Backend-as-a-Service platform)
- [Google Cloud Console account](https://console.cloud.google.com/) (Only if you want to enable Google OAuth)

---

## Cloning Repository

```bash
git clone [https://github.com/shoukelp/todo-app.git](https://github.com/shoukelp/todo-app.git)
cd todo-app
``` 

## Dependency Installation

```bash
npm install
# or if using yarn:
# yarn install
```

## Supabase Setup & Database Structure

- Create a new project in the Supabase Dashboard.
- Go to the SQL Editor section in your Supabase project.
- Copy and run the following SQL script to create the todos table and set Row Level Security (RLS):
```SQL
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, 
    text TEXT NOT NULL CHECK (char_length(text) > 0),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos (user_id);
CREATE INDEX IF NOT EXISTS todos_priority_idx ON public.todos (priority);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual read access" ON public.todos;
CREATE POLICY "Allow individual read access"
ON public.todos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual insert access" ON public.todos;
CREATE POLICY "Allow individual insert access"
ON public.todos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual update access" ON public.todos;
CREATE POLICY "Allow individual update access"
ON public.todos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual delete access" ON public.todos;
CREATE POLICY "Allow individual delete access"
ON public.todos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## Configure .env

- In the root directory of your project (todo-app/), create a new file called .env.
- Copy the Project URL and Anon Key from the Supabase Dashboard (Settings > API).
- Fill the .env file as follows (replace with your values):

Code snippet

```
REACT_APP_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

> [!Warning]
> Make sure the variable name (e.g. REACT_APP_SUPABASE_URL) matches the one used in your code (src/hooks/useAuth.js). Let's assume your code is already customized for REACT_APP_ or you will customize it.

## Running a Local Application

Open a terminal in the todo-app/ directory and run it:

```Bash
npm run dev
# or if using yarn:
# yarn dev
# or if still using the create-react-app configuration:
# npm start
```

The application will run and can be accessed via http://localhost:3000 (or another port if 3000 is already used).