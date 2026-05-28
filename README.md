# Syed Ameen - Personal Blog & Admin Console

A premium, interactive personal blog website with a built-in **local Admin Panel** allowing you to create, edit, manage, and delete blog posts directly from your browser. 

The website operates as a smooth, animated Single Page Application (SPA). To work immediately on any device with zero backend databases or server requirements, the platform leverages browser **`localStorage`** to persist your blog database securely in your browser.

## 🚀 Key Features
- **Public Blog Feed**: Clean grid of article cards featuring titles, dates, read times, summaries, and categories.
- **Dynamic Search & Filters**: Type keywords in the search bar or click category pills (Finance, Operations, Leadership) to instantly filter articles.
- **Elegant Article Reader**: Beautifully designed article view optimized for high readability.
- **Admin Console Login**: A credential-protected gate (Default Username: `admin` / Password: `admin`) to authorize editing features.
- **Full CRUD Admin Panel**: 
  - **Overview Dashboard**: Tracks total posts, drafts, and mock views/subscribers.
  - **Blog Composer**: Add new posts by specifying the title, category, custom image URL, and content.
  - **Manager Table**: Edit pre-existing posts or trigger dialog boxes to delete them.

## 🌐 Custom Domain Hosting (`www.ameensyed.in`)

To deploy this blog to your domain, follow these steps:

### Easiest: Drag-and-Drop Deploy (Netlify Drop)
1. Go to [Netlify Drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop this entire folder (`/Users/ameensyed/Desktop/AmeenSyed`) onto the upload target. Your blog will be live in seconds!
3. Under **Domain Settings**, select **Add Custom Domain** and enter `www.ameensyed.in`.
4. Update your domain DNS records at your registrar to point to Netlify's servers.

### Alternative: GitHub Pages
We have pre-configured a `CNAME` file pointing to `ameensyed.in` and a `.gitignore` to keep your repository clean.
1. Create a public repository on GitHub named `ameensyed-blog`.
2. Open Terminal in this folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initialize premium blog with local admin panel"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ameensyed-blog.git
   git push -u origin main
   ```
3. Go to the repository **Settings > Pages** on GitHub.
4. Select `main` branch as the build source and save.
5. In your domain registrar DNS settings, point your domain A records to GitHub Pages IPs.

## 📁 File Structure
- `index.html`: Core SPA structure containing home, post reader, login, and admin panel views.
- `styles.css`: Dark/light mode properties, typography, cards, and admin dashboard design.
- `script.js`: Interactive routing controllers, search filtration, local database manager, and CRUD functions.
- `CNAME`: Domain configuration for static hosting.
- `assets/images/profile.jpg`: Your profile picture.
