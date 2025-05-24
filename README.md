

## 📘 `README.md`

````markdown
# Luma App

Luma is a board game companion web app that helps users understand and play games better through interactive tutorials, smart rule-books, community features, and accessibility tools.

---
## 🚀 Getting Started

Follow these steps to get the project running locally with Tailwind CSS and Live Server.

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/luma-app.git
cd luma-app
````

---

### 2. Install dependencies

Make sure Node.js is installed, then run:

```bash
npm install
```

---

### 3. Start Tailwind CLI in watch mode

This will compile Tailwind classes into CSS every time you make changes.

```bash
npm run dev
```

If that doesn’t work, run this manually:

```bash
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

> This generates the CSS file that the HTML pages use.

---

### 4. Open the app with Live Server

* Open the project in VS Code
* Go to the `views` folder
* Right-click on `index.html` (or any page)
* Select **"Open with Live Server"**

Your changes will update live as you save.

---

## 📁 Project Structure

```
luma-app/
├── config/               # Firebase setup
├── js/                   # App logic and routing
├── public/               # Static assets
├── src/
│   ├── input.css         # Tailwind directives + custom CSS
│   └── output.css        # Compiled Tailwind CSS (auto-generated)
├── views/                # HTML pages
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   └── ...
├── tailwind.config.js    # Tailwind content scanning config
├── package.json
└── README.md
```

---

## ✅ Scripts

In `package.json`:

```json
"scripts": {
  "dev": "tailwindcss -i ./src/input.css -o ./src/output.css --watch"
}
```

---

## 💬 Support

If Tailwind styles aren’t showing:

* Make sure `output.css` is being generated
* Confirm your HTML files have this in `<head>`:

```html
<link href="../src/output.css" rel="stylesheet">
```

---

Let me know if you run into issues or need help with styling or component behavior.

```

---

Would you like a version that includes setup instructions for deployment (e.g. GitHub Pages or Netlify) too?
```
