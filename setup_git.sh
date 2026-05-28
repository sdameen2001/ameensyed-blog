#!/bin/bash
# Syed Ameen Blog - Local Git Initializer

echo "=========================================="
echo "Initializing Local Git Repository..."
echo "=========================================="

if [ -d .git ]; then
    echo "✔ Git is already initialized."
else
    git init
    echo "✔ Git initialized."
fi

# Add files
git add .

# Commit
git commit -m "Initialize premium blog and local admin panel workspace"
echo "✔ Committed all custom blog views, styles, scripts, and CNAME configurations."

echo ""
echo "=========================================="
echo "Next Steps to Link to www.ameensyed.in:"
echo "=========================================="
echo "1. Create a public repository on GitHub (e.g., 'ameensyed-blog')."
echo "2. Run the following commands in this folder:"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git"
echo "   git push -u origin main"
echo "3. Go to Repository Settings > Pages on GitHub and turn on Pages."
echo "4. Point your DNS records for www.ameensyed.in to GitHub Pages."
echo "=========================================="
