# Athletic Agency

This repository contains two Next.js applications (`admin` and `client`) and uses Supabase for the backend.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.8+)
- [pnpm](https://pnpm.io/) package manager

### Environment Setup

You need to set up environment variables for both applications before running them. Use the provided `.env.example` files as templates.

**Admin App:**
```bash
cd admin
cp .env.example .env.local
```
Update `.env.local` with your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

**Client App:**
```bash
cd client
cp .env.example .env.local
```
Update `.env.local` with your specific CMS variables and Supabase keys.

### Installation & Running Locally

Install dependencies and start the development servers individually for both projects.

**Admin App (Backoffice/Dashboard):**
```bash
cd admin
pnpm install
pnpm dev
```

**Client App (User-facing App):**
```bash
cd client
pnpm install
pnpm dev
```

Next.js will automatically run the apps on `http://localhost:3000` and `http://localhost:3001` if dev servers are running concurrently.

---

## 🛠 Git Hooks & Commit Guidelines

This project uses **Husky** to enforce coding standards and commit conventions. Below is a guide on the hooks configured and how to write proper commits using **Commitlint** and **Commitizen**.

### 🔹 **Pre-commit Hook**
- Runs ESLint to lint staged files before committing.
- Prevents commits if there are linting errors.

### 🔹 **Commit-msg Hook**
- Runs Commitlint to enforce proper commit messages.
- Prevents commits with invalid messages that do not follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

### 🔹 **Pre-push Hook**
- Builds both `client` and `admin` projects before pushing.
- If the build fails, the push is blocked to prevent broken code from reaching the repository.

---

## ✅ Writing Good Commit Messages

We use the **Conventional Commits** format. Below are examples of correct and incorrect commit messages:

### **✅ Good Commit Messages:**
```sh
feat: add user authentication
fix(admin): resolve dashboard loading issue
chore: update dependencies
refactor(client): improve form validation logic
docs: update API documentation
```

### **❌ Bad Commit Messages:**
```sh
updated files
bug fix
fixed stuff
some changes
```
💡 **Why?**
- Messages should be **clear and descriptive**.
- They should follow the **type(scope): description** format.

### **Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance (e.g., dependencies)
- `refactor`: Code changes that don’t add features or fix bugs
- `docs`: Documentation updates
- `test`: Adding or updating tests

---

## ✨ Using Commitizen for Better Commits

We have **Commitizen** installed to help with commit formatting. Instead of writing commit messages manually, you can use:

```sh
npm run commit
```

This will open an interactive prompt to guide you through writing a proper commit message.

**Example Screenshot:**
![Commitizen Screenshot](https://res.cloudinary.com/dzpjlfcrq/image/upload/v1739369621/Screenshot_2025-02-12_at_2.12.56_PM_x3tfx9.png)

---

## 🚀 Running Husky Hooks Manually (For Debugging)
If you want to test the hooks manually, you can run:
```sh
npx husky run pre-commit
npx husky run commit-msg
npx husky run pre-push
```

---

## 📌 Summary
- Always use `npm run commit` for guided commit messages.
- Make sure your commits follow the **Conventional Commits** format.
- Fix lint errors before committing.
- Ensure the build passes before pushing.

Following these guidelines ensures a **clean and maintainable** codebase. 🚀
