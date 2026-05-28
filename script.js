/**
 * Syed Ameen - Personal Blog & Admin Console Database Controller
 */

// ==========================================================================
// 1. Initial Database Seed Data (Seeded if localStorage is empty)
// ==========================================================================
const DEFAULT_POSTS = [
  {
    id: 'post-1',
    title: 'Navigating the 2026 Financial Markets: Key Trends for B.Com Graduates',
    category: 'Finance',
    date: 'May 28, 2026',
    readTime: '6 min read',
    banner: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    summary: 'An operational breakdown of capital markets, derivative metrics, and portfolio optimization techniques tailored for emerging commerce professionals.',
    content: 'The financial ecosystem in 2026 is undergoing massive shifts, driven by algorithmic disruptions and shifting global interest rate regimes. For B.Com graduates looking to enter investment banking or portfolio administration, understanding the mechanics of these markets is more critical than ever.\n\nFirst and foremost, derivative markets are registering record volumes. A derivative is not just a speculative tool; in corporate treasury departments, it serves as the primary hedge against interest rate fluctuations and forex risks. As future operations managers, understanding how options, futures, and swaps integrate into corporate balance sheets is an essential competency.\n\nSecondly, asset allocation strategy has evolved. The traditional 60/40 stock-bond portfolio is being supplemented by alternative asset classes, including private equity, real estate investment trusts (REITs), and specialized commodities. Modern analysts must leverage data spreadsheets (like M.S. Excel) to calculate risk-adjusted returns and Sharpe ratios dynamically to prove eligibility for corporate portfolio placement.\n\nTo build a standout career in finance, B.Com graduates must combine their theoretical accounting principles (auditing, standard ledger reconciliation) with modern software competencies like Tally Prime to handle transactions in real-time. Continuous upskilling in quantitative analytics will remain the primary differentiator in the competitive hiring landscape.',
    status: 'published'
  },
  {
    id: 'post-2',
    title: 'Operational Excellence in Insurance Audits: Process Optimization',
    category: 'Operations',
    date: 'May 24, 2026',
    readTime: '5 min read',
    banner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    summary: 'A first-hand analysis of insurance operational pipelines, database verification, and underwriter coordination principles derived from corporate internship roles.',
    content: 'Insurance operations are the backbone of risk mitigation. Having completed operations internships at Trans Safe Insurance Services and relationship manager roles at Spot Insurance, I have witnessed how process optimization directly correlates with customer satisfaction and claims accuracy.\n\nIn standard insurance operations, a common bottleneck lies in policy document validation. When a client applies, underwriters require rapid validation of roll-ins, claims records, and background criteria. By implementing smart eligibility engines and ledger tracking databases, operations managers can reduce policy verification cycles from days to minutes.\n\nAnother critical factor is customer relationship management. Relationship managers serve as the vital link between complex legal claims contracts and the policyholders. Standardizing claim query sheets and leveraging modern database software (like Aegis MIS systems) allows support teams to resolve issues with high precision, building a solid brand trust.\n\nUltimately, operations excellence is not about executing tasks faster; it is about building zero-error pipelines. By utilizing digital dashboards to monitor policy telemetry, active renewals, and premium collections, insurance firms can secure operational margins and deliver outstanding stakeholder value.',
    status: 'published'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize local database
  let db = JSON.parse(localStorage.getItem('blog-database'));
  if (!db || db.length === 0) {
    db = DEFAULT_POSTS;
    localStorage.setItem('blog-database', JSON.stringify(db));
  }

  // Active Category State
  let activeCategory = 'all';

  // Mobile menu selectors
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu-id');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
    });
    
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // Theme Toggler
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else {
    body.classList.add('dark-theme');
    body.classList.remove('light-theme');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-theme');
      body.classList.toggle('light-theme');
      const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('portfolio-theme', currentTheme);
    });
  }


  // ==========================================================================
  // 2. SPA Navigation router logic
  // ==========================================================================
  const viewPanels = document.querySelectorAll('.view-panel');
  const navAdminLink = document.getElementById('nav-admin-link');

  window.navigateTo = function(viewId) {
    // 1. If targeting admin panel, check session storage authorization first
    if (viewId === 'admin-console') {
      const isAuth = sessionStorage.getItem('admin-authorized');
      if (!isAuth) {
        viewId = 'admin-login';
      }
    }

    // 2. Switch active panels
    viewPanels.forEach(panel => {
      if (panel.id === `view-${viewId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // 3. Highlight top nav active link
    navLinks.forEach(link => {
      link.classList.remove('active');
    });

    if (viewId === 'home') {
      document.querySelector('.nav-link[href="#home"]').classList.add('active');
      renderBlogs();
    } else if (viewId === 'admin-login' || viewId === 'admin-console') {
      navAdminLink.classList.add('active');
      if (viewId === 'admin-console') {
        renderAdminDashboard();
      }
    }

    // 4. Scroll to top on transition
    window.scrollTo(0, 0);
  };


  // ==========================================================================
  // 3. Render Public Blog Grid
  // ==========================================================================
  const blogsGrid = document.getElementById('blogs-grid-container');

  function renderBlogs(filteredPosts = null) {
    if (!blogsGrid) return;
    blogsGrid.innerHTML = '';

    // If no filtered dataset provided, read all published entries from local db
    let posts = filteredPosts;
    if (!posts) {
      const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
      posts = allPosts.filter(p => p.status === 'published');
      
      // Also apply active category filter if any
      if (activeCategory !== 'all') {
        posts = posts.filter(p => p.category === activeCategory);
      }
    }

    if (posts.length === 0) {
      blogsGrid.innerHTML = `
        <div class="empty-blogs glass-panel" style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--accent-gold); margin-bottom: 15px;"></i>
          <h3>No Articles Found</h3>
          <p>No blog posts match your current search queries or filter categories.</p>
        </div>
      `;
      return;
    }

    posts.forEach(post => {
      // Image URL banner fallback
      const bannerImg = post.banner ? post.banner : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80';
      
      const card = document.createElement('div');
      card.className = 'blog-card glass-panel';
      card.onclick = () => loadPostReader(post.id);
      
      card.innerHTML = `
        <div class="card-banner-box">
          <img src="${bannerImg}" alt="${post.title}" class="card-banner-img">
          <span class="card-cat">${post.category}</span>
        </div>
        <div class="card-body">
          <span class="card-date">${post.date}</span>
          <h3>${post.title}</h3>
          <p class="card-summary">${post.summary}</p>
          <div class="card-footer">
            <span>${post.readTime}</span>
            <span class="read-more-link">Read Full <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      `;
      blogsGrid.appendChild(card);
    });
  }


  // ==========================================================================
  // 4. Article Reader details loader
  // ==========================================================================
  const readerTitle = document.getElementById('reader-title');
  const readerCategory = document.getElementById('reader-category');
  const readerDate = document.getElementById('reader-date');
  const readerReadTime = document.getElementById('reader-read-time');
  const readerBannerBox = document.getElementById('reader-banner-box');
  const readerContentBody = document.getElementById('reader-content-body');

  window.loadPostReader = function(postId) {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Load reader variables
    if (readerTitle) readerTitle.textContent = post.title;
    if (readerCategory) {
      readerCategory.textContent = post.category;
      readerCategory.className = `reader-cat ${post.category.toLowerCase()}`;
    }
    if (readerDate) readerDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${post.date}`;
    if (readerReadTime) readerReadTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${post.readTime}`;
    
    if (readerBannerBox) {
      const bannerImg = post.banner ? post.banner : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
      readerBannerBox.innerHTML = `<img src="${bannerImg}" alt="${post.title}" class="reader-banner-img">`;
    }

    if (readerContentBody) {
      // Replaces double line breaks with HTML paragraph structures
      const formattedContent = post.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
      readerContentBody.innerHTML = formattedContent;
    }

    navigateTo('post-detail');
  };


  // ==========================================================================
  // 5. Live Search and Category Filter overrides
  // ==========================================================================
  window.filterBlogs = function() {
    const searchVal = document.getElementById('blog-search').value.toLowerCase();
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    let posts = allPosts.filter(p => p.status === 'published');

    if (activeCategory !== 'all') {
      posts = posts.filter(p => p.category === activeCategory);
    }

    const filtered = posts.filter(p => 
      p.title.toLowerCase().includes(searchVal) || 
      p.summary.toLowerCase().includes(searchVal) ||
      p.content.toLowerCase().includes(searchVal)
    );

    renderBlogs(filtered);
  };

  window.filterCategory = function(category) {
    activeCategory = category;
    
    // Toggle active classes on category buttons
    const catButtons = document.querySelectorAll('.cat-btn');
    catButtons.forEach(btn => {
      if (btn.getAttribute('data-category') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Reset search bar value on category switch to prevent overrides
    const searchBar = document.getElementById('blog-search');
    if (searchBar) searchBar.value = '';

    renderBlogs();
  };


  // ==========================================================================
  // 6. Admin Portal authentication handlers
  // ==========================================================================
  const loginForm = document.getElementById('admin-login-form');
  const loginStatus = document.getElementById('login-status');

  window.handleLogin = function(e) {
    e.preventDefault();
    const userVal = document.getElementById('login-username').value.trim().toLowerCase();
    const passVal = document.getElementById('login-password').value.trim();

    if (userVal === 'admin' && passVal === 'admin') {
      // Save session authorization
      sessionStorage.setItem('admin-authorized', 'true');
      loginStatus.style.display = 'none';
      loginForm.reset();
      navigateTo('admin-console');
    } else {
      loginStatus.classList.add('error');
      loginStatus.textContent = '❌ Access Denied: Mismatched credentials.';
      loginStatus.style.display = 'block';
    }
  };

  window.handleLogout = function() {
    sessionStorage.removeItem('admin-authorized');
    navigateTo('home');
  };


  // ==========================================================================
  // 7. Admin Sub-View Switching Controller
  // ==========================================================================
  const adminNavItems = document.querySelectorAll('.admin-nav-item');
  const adminSubviews = document.querySelectorAll('.admin-subview');

  window.switchSubview = function(subviewId) {
    adminNavItems.forEach(item => {
      if (item.getAttribute('data-subview') === subviewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    adminSubviews.forEach(subview => {
      if (subview.id === `subview-${subviewId}`) {
        subview.classList.add('active');
      } else {
        subview.classList.remove('active');
      }
    });

    if (subviewId === 'overview') {
      renderAdminDashboard();
    } else if (subviewId === 'manage') {
      renderAdminTable();
    } else if (subviewId === 'editor') {
      // Check if editor form contains pre-populated ID (edit mode)
      const editId = document.getElementById('edit-post-id').value;
      if (!editId) {
        // Clear editor fields if starting a new post fresh
        document.getElementById('blog-editor-form').reset();
        document.getElementById('editor-title-text').textContent = 'Compose Blog Article';
        document.getElementById('btn-save-post').textContent = 'Publish Article';
      }
    }
  };


  // ==========================================================================
  // 8. Admin Telemetry & Table Render Panel
  // ==========================================================================
  const statTotalPosts = document.getElementById('stat-total-posts');
  const statTotalDrafts = document.getElementById('stat-total-drafts');

  function renderAdminDashboard() {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    
    if (statTotalPosts) statTotalPosts.textContent = allPosts.length;
    if (statTotalDrafts) {
      const draftsCount = allPosts.filter(p => p.status === 'draft').length;
      statTotalDrafts.textContent = draftsCount;
    }
  }

  const adminTableBody = document.getElementById('admin-posts-table-body');

  function renderAdminTable() {
    if (!adminTableBody) return;
    adminTableBody.innerHTML = '';

    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];

    if (allPosts.length === 0) {
      adminTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">
            No articles found. Click "Write New Post" to start composing your first blog!
          </td>
        </tr>
      `;
      return;
    }

    allPosts.forEach(post => {
      const row = document.createElement('tr');
      const statusBadge = post.status === 'published' 
        ? `<span class="badge-status pub">Published</span>` 
        : `<span class="badge-status draft">Draft</span>`;

      row.innerHTML = `
        <td style="font-weight:600; color:var(--text-primary);">${post.title}</td>
        <td>${post.category}</td>
        <td>${post.date}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="action-icon-btn edit" onclick="editBlogPost('${post.id}')" title="Edit Article"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="action-icon-btn delete" onclick="triggerDeleteBlogPost('${post.id}')" title="Delete Article"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      `;
      adminTableBody.appendChild(row);
    });
  }


  // ==========================================================================
  // 9. Admin Blog CRUD Logic (Create, Read, Update, Delete)
  // ==========================================================================
  const editorForm = document.getElementById('blog-editor-form');

  window.saveBlogPost = function(e) {
    e.preventDefault();
    
    const editId = document.getElementById('edit-post-id').value;
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const banner = document.getElementById('post-banner').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const status = document.querySelector('input[name="post-status"]:checked').value;
    
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    
    // Estimate reading time (roughly 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readMinutes = Math.max(1, Math.round(wordCount / 200));
    const readTimeStr = `${readMinutes} min read`;

    // Date String Formatting
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const todayStr = new Date().toLocaleDateString('en-US', options);

    if (editId) {
      // 1. UPDATE MODE
      const postIdx = allPosts.findIndex(p => p.id === editId);
      if (postIdx !== -1) {
        allPosts[postIdx].title = title;
        allPosts[postIdx].category = category;
        allPosts[postIdx].banner = banner;
        allPosts[postIdx].content = content;
        allPosts[postIdx].status = status;
        allPosts[postIdx].readTime = readTimeStr;
        // Keep original date if desired, or update to current modified date
        allPosts[postIdx].date = todayStr;
      }
    } else {
      // 2. CREATE MODE
      const newPost = {
        id: `post-${Date.now()}`,
        title: title,
        category: category,
        banner: banner,
        content: content,
        status: status,
        date: todayStr,
        readTime: readTimeStr,
        summary: content.substring(0, 140) + '...'
      };
      allPosts.unshift(newPost);
    }

    // Save updated index, refresh, and switch subviews
    localStorage.setItem('blog-database', JSON.stringify(allPosts));
    editorForm.reset();
    document.getElementById('edit-post-id').value = '';
    
    switchSubview('manage');
  };

  // EDIT READ ACTION
  window.editBlogPost = function(postId) {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Load editor form fields with post values
    document.getElementById('edit-post-id').value = post.id;
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-category').value = post.category;
    document.getElementById('post-banner').value = post.banner;
    document.getElementById('post-content').value = post.content;
    
    // Toggle active status radios
    document.querySelector(`input[name="post-status"][value="${post.status}"]`).checked = true;

    // Customize buttons
    document.getElementById('editor-title-text').textContent = 'Modify Blog Article';
    document.getElementById('btn-save-post').textContent = 'Save Changes';

    switchSubview('editor');
  };

  // DELETE POPUP TRIGGER
  const deleteDialog = document.getElementById('delete-dialog');
  const deletePostPlaceholder = document.getElementById('delete-post-title-placeholder');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  let pendingDeleteId = null;

  window.triggerDeleteBlogPost = function(postId) {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    pendingDeleteId = postId;
    if (deletePostPlaceholder) deletePostPlaceholder.textContent = post.title;
    if (deleteDialog) deleteDialog.showModal();
  };

  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', () => {
      if (deleteDialog) deleteDialog.close();
      pendingDeleteId = null;
    });
  }

  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      if (!pendingDeleteId) return;

      const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
      const updatedPosts = allPosts.filter(p => p.id !== pendingDeleteId);
      
      localStorage.setItem('blog-database', JSON.stringify(updatedPosts));
      
      if (deleteDialog) deleteDialog.close();
      pendingDeleteId = null;
      renderAdminTable();
    });
  }


  // ==========================================================================
  // 10. Mock Newsletter subscriptions
  // ==========================================================================
  const newsForm = document.getElementById('newsletter-form');
  const newsStatus = document.getElementById('newsletter-status');

  window.handleSubscribe = function(e) {
    e.preventDefault();
    const emailVal = document.getElementById('news-email').value.trim();
    
    if (newsStatus) {
      newsStatus.classList.add('success');
      newsStatus.textContent = `✔ Thank you! '${emailVal}' has been added to our notification registry.`;
      newsStatus.style.display = 'block';
      newsForm.reset();
      
      setTimeout(() => {
        newsStatus.style.display = 'none';
      }, 5000);
    }
  };

  // Render initial blogs on boot load
  navigateTo('home');
});
