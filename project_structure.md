# 📁 sceneit - Project Structure

*Generated on: 1/31/2026, 10:45:50 PM*

## 📋 Quick Overview

| Metric | Value |
|--------|-------|
| 📄 Total Files | 83 |
| 📁 Total Folders | 23 |
| 🌳 Max Depth | 4 levels |
| 🛠️ Tech Stack | React, CSS, Tailwind CSS, Node.js |

## ⭐ Important Files

- 🟡 🚫 **.gitignore** - Git ignore rules
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🔴 📖 **README.md** - Project documentation
- 🟡 🎨 **tailwind.config.js** - Tailwind config
- 🔵 ▲ **vercel.json** - Vercel config
- 🟡 🚫 **.gitignore** - Git ignore rules
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration

## 📊 File Statistics

### By File Type

- 📜 **.js** (JavaScript files): 42 files (50.6%)
- ⚛️ **.jsx** (React JSX files): 24 files (28.9%)
- ⚙️ **.json** (JSON files): 5 files (6.0%)
- 🖼️ **.jpeg** (JPEG images): 3 files (3.6%)
- 🚫 **.gitignore** (Git ignore): 2 files (2.4%)
- 🎨 **.svg** (SVG images): 2 files (2.4%)
- 🎨 **.css** (Stylesheets): 2 files (2.4%)
- 🌐 **.html** (HTML files): 1 files (1.2%)
- 📄 **.mp3** (Other files): 1 files (1.2%)
- 📖 **.md** (Markdown files): 1 files (1.2%)

### By Category

- **JavaScript**: 42 files (50.6%)
- **React**: 24 files (28.9%)
- **Config**: 5 files (6.0%)
- **Assets**: 5 files (6.0%)
- **DevOps**: 2 files (2.4%)
- **Styles**: 2 files (2.4%)
- **Web**: 1 files (1.2%)
- **Other**: 1 files (1.2%)
- **Docs**: 1 files (1.2%)

### 📁 Largest Directories

- **root**: 83 files
- **client**: 44 files
- **server**: 39 files
- **client\src**: 31 files
- **server\controllers**: 11 files

## 🌳 Directory Structure

```
sceneit/
├── 📂 client/
│   ├── 🟡 🚫 **.gitignore**
│   ├── 📜 eslint.config.js
│   ├── 🌐 index.html
│   ├── 🟡 🔒 **package-lock.json**
│   ├── 🔴 📦 **package.json**
│   ├── 📜 postcss.config.js
│   ├── 🌐 public/
│   │   ├── 🖼️ logo.jpeg
│   │   ├── 📄 notification.mp3
│   │   └── 🎨 vite.svg
│   ├── 🔴 📖 **README.md**
│   ├── 📁 src/
│   │   ├── 🎨 App.css
│   │   ├── ⚛️ App.jsx
│   │   ├── 📦 assets/
│   │   │   └── 🎨 react.svg
│   │   ├── 🧩 components/
│   │   │   ├── 📂 chat/
│   │   │   ├── 📂 common/
│   │   │   ├── 📂 layout/
│   │   │   │   ├── ⚛️ Footer.jsx
│   │   │   │   ├── ⚛️ Navbar.jsx
│   │   │   │   ├── ⚛️ PageTransition.jsx
│   │   │   │   └── ⚛️ PolicyModal.jsx
│   │   │   ├── 📂 movie/
│   │   │   │   ├── ⚛️ Recommendations.jsx
│   │   │   │   ├── ⚛️ ReviewSection.jsx
│   │   │   │   ├── ⚛️ StreamingProviders.jsx
│   │   │   │   └── ⚛️ TrailerModal.jsx
│   │   │   └── 📂 post/
│   │   ├── 📂 context/
│   │   │   ├── ⚛️ AuthContext.jsx
│   │   │   ├── ⚛️ NotificationContext.jsx
│   │   │   ├── ⚛️ SocketContext.jsx
│   │   │   └── ⚛️ ThemeContext.jsx
│   │   ├── 🎨 index.css
│   │   ├── ⚛️ main.jsx
│   │   ├── 📄 pages/
│   │   │   ├── 📂 Auth/
│   │   │   │   ├── ⚛️ Login.jsx
│   │   │   │   └── ⚛️ Register.jsx
│   │   │   ├── ⚛️ Chat.jsx
│   │   │   ├── ⚛️ Friends.jsx
│   │   │   ├── ⚛️ Home.jsx
│   │   │   ├── ⚛️ MovieDetails.jsx
│   │   │   ├── ⚛️ Notifications.jsx
│   │   │   ├── ⚛️ Profile.jsx
│   │   │   └── ⚛️ Watchlist.jsx
│   │   ├── ⚛️ routes.jsx
│   │   ├── 📂 services/
│   │   │   ├── 📜 api.js
│   │   │   ├── 📜 chatService.js
│   │   │   ├── 📜 movieService.js
│   │   │   └── 📜 userService.js
│   │   └── 🔧 utils/
│   ├── 🟡 🎨 **tailwind.config.js**
│   ├── 🔵 ▲ **vercel.json**
│   └── 📜 vite.config.js
└── 📂 server/
│   ├── 🟡 🚫 **.gitignore**
│   ├── ⚙️ config/
│   │   └── 📜 db.js
│   ├── 📂 controllers/
│   │   ├── 📜 auth.controller.js
│   │   ├── 📜 chat.controller.js
│   │   ├── 📜 friend.controller.js
│   │   ├── 📜 movie.controller.js
│   │   ├── 📜 notification.controller.js
│   │   ├── 📜 reminder.controller.js
│   │   ├── 📜 review.controller.js
│   │   ├── 📜 search.controller.js
│   │   ├── 📜 streaming.controller.js
│   │   ├── 📜 user.controller.js
│   │   └── 📜 watchlist.controller.js
│   ├── 📂 middleware/
│   │   ├── 📜 authMiddleware.js
│   │   └── 📜 upload.middleware.js
│   ├── 📂 models/
│   │   ├── 📜 Message.js
│   │   ├── 📜 Notification.js
│   │   ├── 📜 Reminder.js
│   │   ├── 📜 Review.js
│   │   ├── 📜 User.js
│   │   └── 📜 Watchlist.js
│   ├── 🟡 🔒 **package-lock.json**
│   ├── 🔴 📦 **package.json**
│   ├── 📂 routes/
│   │   ├── 📜 auth.routes.js
│   │   ├── 📜 chat.routes.js
│   │   ├── 📜 friend.routes.js
│   │   ├── 📜 movie.routes.js
│   │   ├── 📜 notification.routes.js
│   │   ├── 📜 reminder.routes.js
│   │   ├── 📜 review.routes.js
│   │   ├── 📜 search.routes.js
│   │   ├── 📜 streaming.routes.js
│   │   ├── 📜 user.routes.js
│   │   └── 📜 watchlist.routes.js
│   ├── 📜 server.js
│   ├── 📂 uploads/
│   │   ├── 🖼️ image-1769708185453.jpeg
│   │   └── 🖼️ image-1769709725024.jpeg
│   └── 🔧 utils/
│   │   ├── 📜 scheduler.js
│   │   └── 📜 sendEmail.js
```

## 📖 Legend

### File Types
- 🚫 DevOps: Git ignore
- 📜 JavaScript: JavaScript files
- 🌐 Web: HTML files
- ⚙️ Config: JSON files
- 🖼️ Assets: JPEG images
- 📄 Other: Other files
- 🎨 Assets: SVG images
- 📖 Docs: Markdown files
- 🎨 Styles: Stylesheets
- ⚛️ React: React JSX files

### Importance Levels
- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential files
