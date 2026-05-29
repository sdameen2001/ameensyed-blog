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
  
  function getDirectImageUrl(url) {
    if (!url) return '';
    url = url.trim();
    
    // Strip query parameters and trailing slashes
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    
    // Regex for Unsplash page URLs (with or without long descriptive slug strings)
    const unsplashPageRegex = /unsplash\.com\/photos\/([a-zA-Z0-9\-_]+)$/;
    const unsplashSlugRegex = /unsplash\.com\/photos\/.*-([a-zA-Z0-9\-_]+)$/;
    
    let match = cleanUrl.match(unsplashSlugRegex);
    if (!match) {
      match = cleanUrl.match(unsplashPageRegex);
    }
    
    if (match && match[1]) {
      const photoId = match[1];
      return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;
    }
    
    return url;
  }

  // Initialize Cloud Sync state
  let isCloudSyncActive = false;
  let firestore = null;
  let postReaderSource = 'home';
  let activePostId = '';

  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(30, 41, 59, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f8fafc;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-family: 'Outfit', sans-serif;
      font-weight: 500;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
    `;
    
    toast.innerHTML = `
      <span style="color: #818cf8; font-size: 1.1rem;"><i class="fa-solid fa-circle-check"></i></span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger reflow to animate
    toast.offsetHeight;

    // Animate in
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px) scale(0.95)';
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }, 300);
    }, 3000);
  }
  
  // Default embedded Firebase configuration for all public readers & devices
  const embeddedConfig = {
    apiKey: "AIzaSyBRtzikgfM1AFdnl1hENEB5iF7Nkr9n4WE",
    authDomain: "ameensyed-blog.firebaseapp.com",
    projectId: "ameensyed-blog",
    storageBucket: "ameensyed-blog.firebasestorage.app",
    messagingSenderId: "662276929511",
    appId: "1:662276929511:web:c1d820088ab36acbf62f42",
    measurementId: "G-3XDN1DMF83"
  };

  const firebaseConfigStr = localStorage.getItem('firebase-config') || JSON.stringify(embeddedConfig);

  if (firebaseConfigStr) {
    try {
      const config = JSON.parse(firebaseConfigStr);
      // Initialize Firebase if the compat script SDK is loaded
      if (typeof firebase !== 'undefined') {
        if (firebase.apps.length === 0) {
          firebase.initializeApp(config);
        }
        firestore = firebase.firestore();
        isCloudSyncActive = true;
        console.log("✔ Cloud Sync Engine successfully initialized.");
      } else {
        console.warn("Firebase SDK script not loaded. Running in local fallback mode.");
      }
    } catch (e) {
      console.error("Failed to initialize Firebase from cached config:", e);
    }
  }

  // Initialize local database
  let db = JSON.parse(localStorage.getItem('blog-database'));
  if (!db || db.length === 0) {
    db = DEFAULT_POSTS;
    localStorage.setItem('blog-database', JSON.stringify(db));
  }

  // Set up real-time Firestore database sync if active
  if (isCloudSyncActive && firestore) {
    // 1. blogs collection listener
    firestore.collection('blogs').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      const posts = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          title: data.title,
          category: data.category,
          date: data.date,
          readTime: data.readTime,
          banner: data.banner,
          summary: data.summary,
          content: data.content,
          status: data.status,
          views: data.views || 0,
          timestamp: data.timestamp
        });
      });
      
      // Update local storage and cache variables
      localStorage.setItem('blog-database', JSON.stringify(posts));
      db = posts;
      
      // Silent dynamic UI refresh depending on active workspace view
      const activePanel = document.querySelector('.view-panel.active');
      if (activePanel) {
        if (activePanel.id === 'view-home') {
          renderBlogs();
        } else if (activePanel.id === 'view-admin-console') {
          const activeSubview = document.querySelector('.admin-subview.active');
          if (activeSubview) {
            if (activeSubview.id === 'subview-overview') {
              renderAdminDashboard();
            } else if (activeSubview.id === 'subview-manage') {
              renderAdminTable();
            }
          }
        }
      }
    }, error => {
      console.error("Firestore real-time sync failure:", error);
    });

    // 2. subscribers collection listener
    firestore.collection('subscribers').onSnapshot(snapshot => {
      const subs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        subs.push({
          name: data.name || '',
          email: doc.id,
          phone: data.phone || '',
          timestamp: data.timestamp || Date.now()
        });
      });
      localStorage.setItem('blog-subscribers', JSON.stringify(subs));
      
      const activePanel = document.querySelector('.view-panel.active');
      if (activePanel && activePanel.id === 'view-admin-console') {
        const activeSubview = document.querySelector('.admin-subview.active');
        if (activeSubview) {
          if (activeSubview.id === 'subview-overview') {
            renderAdminDashboard();
          } else if (activeSubview.id === 'subview-subscribers') {
            renderAdminSubscribers();
          }
        }
      }
    }, error => {
      console.error("Firestore subscribers sync failure:", error);
    });

    // 3. comments collection listener
    firestore.collection('comments').onSnapshot(snapshot => {
      const comms = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        comms.push({
          id: doc.id,
          postId: data.postId || '',
          name: data.name || '',
          content: data.content || '',
          timestamp: data.timestamp || Date.now(),
          status: data.status || 'pending',
          replies: data.replies || []
        });
      });
      localStorage.setItem('blog-comments', JSON.stringify(comms));
      
      const activePanel = document.querySelector('.view-panel.active');
      if (activePanel) {
        if (activePanel.id === 'view-admin-console') {
          const activeSubview = document.querySelector('.admin-subview.active');
          if (activeSubview) {
            if (activeSubview.id === 'subview-overview') {
              renderAdminDashboard();
            } else if (activeSubview.id === 'subview-comments') {
              renderAdminComments();
            }
          }
        } else if (activePanel.id === 'view-post-detail') {
          if (activePostId) {
            renderApprovedComments(activePostId);
          }
        }
      }
    }, error => {
      console.error("Firestore comments sync failure:", error);
    });

    // 3. analytics/site document listener
    firestore.collection('analytics').doc('site').onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        localStorage.setItem('site-views', data.views || 0);
        
        const activePanel = document.querySelector('.view-panel.active');
        if (activePanel && activePanel.id === 'view-admin-console') {
          renderAdminDashboard();
        }
      }
    }, error => {
      console.error("Firestore analytics sync failure:", error);
    });
  }

  // Increment site views on load
  let localSiteViews = parseInt(localStorage.getItem('site-views')) || 0;
  localSiteViews++;
  localStorage.setItem('site-views', localSiteViews);
  
  if (isCloudSyncActive && firestore) {
    firestore.collection('analytics').doc('site').set({
      views: firebase.firestore.FieldValue.increment(1)
    }, { merge: true }).catch(err => {
      firestore.collection('analytics').doc('site').set({
        views: localSiteViews
      }, { merge: true });
    });
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
  // 3. Render Public Blog Grid & Dynamic Categories
  // ==========================================================================
  const blogsGrid = document.getElementById('blogs-grid-container');

  function renderCategoryFilters() {
    const container = document.querySelector('.category-selectors');
    if (!container) return;

    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const publishedPosts = allPosts.filter(p => p.status === 'published');

    // Pre-populate with standard options to ensure they always exist
    const categories = new Set(['Finance', 'Operations', 'Leadership']);
    
    // Scan database for any custom categories typed by the user
    publishedPosts.forEach(post => {
      if (post.category && post.category.trim() !== '') {
        categories.add(post.category.trim());
      }
    });

    let html = `<button class="cat-btn ${activeCategory === 'all' ? 'active' : ''}" data-category="all" onclick="filterCategory('all')">All Articles</button>`;

    categories.forEach(cat => {
      let icon = 'fa-solid fa-tags'; // Default icon for typed custom categories
      const lowerCat = cat.toLowerCase();
      if (lowerCat === 'finance') icon = 'fa-solid fa-chart-line';
      else if (lowerCat === 'operations') icon = 'fa-solid fa-gears';
      else if (lowerCat === 'leadership') icon = 'fa-solid fa-users';

      html += `
        <button class="cat-btn ${activeCategory === cat ? 'active' : ''}" data-category="${cat}" onclick="filterCategory('${cat}')">
          <i class="${icon}"></i> ${cat}
        </button>
      `;
    });

    container.innerHTML = html;
  }

  function renderBlogs(filteredPosts = null) {
    if (!blogsGrid) return;
    blogsGrid.innerHTML = '';

    // Rebuild category selector pills dynamically from current posts
    renderCategoryFilters();

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
      const bannerImg = post.banner ? getDirectImageUrl(post.banner) : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80';
      
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

  window.loadPostReader = function(postId, source = 'home') {
    postReaderSource = source;
    activePostId = postId;
    
    // Dynamically update hash URL for deep-linking
    window.location.hash = postId;

    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Increment page views for this post (only for public views)
    if (source !== 'admin') {
      post.views = (post.views || 0) + 1;
      const postIdx = allPosts.findIndex(p => p.id === postId);
      if (postIdx !== -1) {
        allPosts[postIdx].views = post.views;
      }
      localStorage.setItem('blog-database', JSON.stringify(allPosts));

      if (isCloudSyncActive && firestore) {
        firestore.collection('blogs').doc(postId).update({
          views: firebase.firestore.FieldValue.increment(1)
        }).catch(err => {
          firestore.collection('blogs').doc(postId).set({
            views: post.views
          }, { merge: true });
        });
      }
    }

    // Toggle Print/PDF button visibility (only show for Admin preview sessions)
    const printBtn = document.querySelector('.print-btn');
    if (printBtn) {
      printBtn.style.display = (source === 'admin') ? 'inline-flex' : 'none';
    }

    // Load reader variables
    if (readerTitle) readerTitle.textContent = post.title;
    if (readerCategory) {
      readerCategory.textContent = post.category;
      readerCategory.className = `reader-cat ${post.category.toLowerCase()}`;
    }
    if (readerDate) readerDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${post.date}`;
    if (readerReadTime) readerReadTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${post.readTime}`;
    
    if (readerBannerBox) {
      const bannerImg = post.banner ? getDirectImageUrl(post.banner) : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
      readerBannerBox.innerHTML = `<img src="${bannerImg}" alt="${post.title}" class="reader-banner-img">`;
    }

    if (readerContentBody) {
      // Replaces double line breaks with HTML paragraph structures
      const formattedContent = post.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
      readerContentBody.innerHTML = formattedContent;
    }

    // Load comments for this post
    renderApprovedComments(postId);

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

    if (userVal === 'admin' && passVal === '15112025') {
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
    } else if (subviewId === 'cloud') {
      renderCloudSettingsPanel();
    } else if (subviewId === 'subscribers') {
      renderAdminSubscribers();
    } else if (subviewId === 'comments') {
      renderAdminComments();
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

  // Renders state and indicators inside Cloud Settings UI
  function renderCloudSettingsPanel() {
    const statusDot = document.getElementById('cloud-status-dot');
    const statusText = document.getElementById('cloud-status-text');
    const statusDesc = document.getElementById('cloud-status-desc');
    const configTextArea = document.getElementById('cloud-firebase-config');
    const statusBox = document.querySelector('.cloud-status-box');

    if (isCloudSyncActive) {
      if (statusDot) statusDot.className = 'status-dot online';
      if (statusText) statusText.textContent = 'Cloud Sync Active (Connected to Google Firestore)';
      if (statusDesc) statusDesc.textContent = 'Your blog is securely linked to Google Cloud. All changes will instantly sync across all browsers and devices in real-time!';
      if (statusBox) statusBox.classList.add('active');
      
      const savedConfig = localStorage.getItem('firebase-config');
      if (configTextArea && savedConfig) {
        configTextArea.value = JSON.stringify(JSON.parse(savedConfig), null, 2);
      }
    } else {
      if (statusDot) statusDot.className = 'status-dot offline';
      if (statusText) statusText.textContent = 'Offline Local Mode (Active)';
      if (statusDesc) statusDesc.textContent = "All blog posts are currently saved in your browser's local cache. Add your Firebase configurations below to upgrade to cloud sync.";
      if (statusBox) statusBox.classList.remove('active');
    }

    // Pre-fill saved EmailJS configurations if they exist
    loadSavedEmailJSConfig();
  }

  // Save Config and initialize cloud connection
  window.saveCloudConfig = function(e) {
    e.preventDefault();
    const configTextArea = document.getElementById('cloud-firebase-config');
    if (!configTextArea) return;
    
    const configStr = configTextArea.value.trim();
    let configObj = null;
    
    try {
      // 1. Try native JSON parsing first
      configObj = JSON.parse(configStr);
    } catch (err1) {
      // 2. If it's a JS object block, extract the braces and evaluate it safely
      const match = configStr.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          configObj = (new Function("return " + match[0]))();
        } catch (err2) {
          console.error("Failed to parse JavaScript object format:", err2);
        }
      }
    }
    
    if (configObj && configObj.apiKey && configObj.projectId) {
      localStorage.setItem('firebase-config', JSON.stringify(configObj));
      alert("✔ Cloud Sync enabled successfully! Re-initializing your database portal...");
      window.location.reload();
    } else {
      alert("❌ Failed to parse config. Please make sure you paste the complete valid Firebase configuration object containing apiKey and projectId!");
    }
  };

  // Revert back to Offline Local Storage mode
  window.resetCloudConfig = function() {
    if (confirm("Are you sure you want to disable Cloud Sync? This will return your database to local offline mode. (Your local cache will remain intact).")) {
      localStorage.removeItem('firebase-config');
      window.location.reload();
    }
  };


  // ==========================================================================
  // 8. Admin Telemetry & Table Render Panel
  // ==========================================================================
  const statTotalPosts = document.getElementById('stat-total-posts');
  const statTotalDrafts = document.getElementById('stat-total-drafts');
  const statTotalSubscribers = document.getElementById('stat-total-subscribers');
  const statTotalViews = document.getElementById('stat-total-views');
  const statTotalComments = document.getElementById('stat-total-comments');

  function renderAdminDashboard() {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const localSubs = JSON.parse(localStorage.getItem('blog-subscribers')) || [];
    const localSiteViews = parseInt(localStorage.getItem('site-views')) || 0;
    const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
    
    if (statTotalPosts) {
      const publishedCount = allPosts.filter(p => p.status === 'published').length;
      statTotalPosts.textContent = publishedCount;
    }
    if (statTotalDrafts) {
      const draftsCount = allPosts.filter(p => p.status === 'draft').length;
      statTotalDrafts.textContent = draftsCount;
    }
    if (statTotalSubscribers) {
      statTotalSubscribers.textContent = localSubs.length;
    }
    if (statTotalViews) {
      statTotalViews.textContent = localSiteViews.toLocaleString();
    }
    if (statTotalComments) {
      const pendingCount = localComments.filter(c => c.status === 'pending').length;
      if (pendingCount > 0) {
        statTotalComments.innerHTML = `${localComments.length} <span style="font-size:0.78rem; color:var(--accent-gold); font-weight:700;">(${pendingCount} pending)</span>`;
      } else {
        statTotalComments.textContent = localComments.length;
      }
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
      let statusBadge = '';
      if (post.status === 'draft') {
        statusBadge = `<span class="badge-status draft">Draft</span>`;
      } else {
        if (post.broadcasted) {
          statusBadge = `<span class="badge-status pub">Published</span> <span class="badge-status notified" style="margin-left: 5px;" title="Newsletter broadcasted to subscribers"><i class="fa-solid fa-paper-plane"></i> Sent</span>`;
        } else {
          statusBadge = `<span class="badge-status pub">Published</span>`;
        }
      }

      let broadcastBtn = '';
      if (post.status === 'draft') {
        broadcastBtn = `<button class="action-icon-btn" style="color: rgba(255,255,255,0.1); cursor: not-allowed;" title="Drafts cannot be broadcasted"><i class="fa-solid fa-envelope"></i></button>`;
      } else {
        broadcastBtn = `<button class="action-icon-btn broadcast" onclick="triggerBroadcastBlogPost('${post.id}')" title="${post.broadcasted ? 'Resend Newsletter Broadcast' : 'Send Newsletter Broadcast'}"><i class="fa-solid fa-envelope"></i></button>`;
      }

      row.innerHTML = `
        <td style="font-weight:600; color:var(--text-primary);">${post.title}</td>
        <td>${post.category}</td>
        <td>${post.date}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="action-icon-btn preview" onclick="previewPostFromAdmin('${post.id}')" title="Preview Article" style="background-color: rgba(88, 11, 129, 0.08); color: var(--accent-purple);"><i class="fa-solid fa-eye"></i></button>
          ${broadcastBtn}
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
    
    // Estimate reading time
    const wordCount = content.split(/\s+/).length;
    const readMinutes = Math.max(1, Math.round(wordCount / 200));
    const readTimeStr = `${readMinutes} min read`;

    // Date String Formatting
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const todayStr = new Date().toLocaleDateString('en-US', options);

    // Generate clean plain-text summary (stripping HTML tags to prevent markup breakage on homepage)
    const cleanSummaryText = content.replace(/<\/?[^>]+(>|$)/g, "");
    const generatedSummary = cleanSummaryText.substring(0, 140) + (cleanSummaryText.length > 140 ? '...' : '');

    let finalPostId = editId;
    let postObj = null;

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
        allPosts[postIdx].date = todayStr;
        allPosts[postIdx].summary = generatedSummary;
        
        postObj = allPosts[postIdx];
      }
    } else {
      // 2. CREATE MODE
      finalPostId = `post-${Date.now()}`;
      postObj = {
        id: finalPostId,
        title: title,
        category: category,
        banner: banner,
        content: content,
        status: status,
        date: todayStr,
        readTime: readTimeStr,
        summary: generatedSummary,
        timestamp: Date.now()
      };
      allPosts.unshift(postObj);
    }

    // Save updated index locally
    localStorage.setItem('blog-database', JSON.stringify(allPosts));
    db = allPosts;
    
    // Sync to Firestore asynchronously if Cloud Sync is active
    if (isCloudSyncActive && firestore && postObj) {
      firestore.collection('blogs').doc(finalPostId).set({
        title: postObj.title,
        category: postObj.category,
        banner: postObj.banner,
        content: postObj.content,
        status: postObj.status,
        date: postObj.date,
        readTime: postObj.readTime,
        summary: postObj.summary,
        timestamp: postObj.timestamp || Date.now()
      }).then(() => {
        console.log("✔ Successfully synchronized post to Google Cloud Firestore.");
      }).catch(err => {
        console.error("Firestore write failure:", err);
      });
    }

    editorForm.reset();
    document.getElementById('edit-post-id').value = '';
    
    switchSubview('manage');
    
    // Premium User Experience: Automatically offer an instant preview path right after publishing!
    setTimeout(() => {
      if (confirm("✔ Article successfully saved and synchronized! Would you like to preview your article now?")) {
        window.previewPostFromAdmin(finalPostId);
      }
    }, 150);
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
      db = updatedPosts;
      
      // Delete from Firestore if Cloud Sync is active
      if (isCloudSyncActive && firestore) {
        firestore.collection('blogs').doc(pendingDeleteId).delete().then(() => {
          console.log("✔ Successfully deleted post from Google Cloud Firestore.");
        }).catch(err => {
          console.error("Firestore delete failure:", err);
        });
      }
      
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
    const nameVal = document.getElementById('news-name').value.trim();
    const phoneVal = document.getElementById('news-phone').value.trim();
    const emailVal = document.getElementById('news-email').value.trim();
    if (!emailVal) return;
    
    // Save to localStorage (as an object containing all three fields)
    const localSubs = JSON.parse(localStorage.getItem('blog-subscribers')) || [];
    
    const existingIndex = localSubs.findIndex(s => {
      if (typeof s === 'string') return s === emailVal;
      return s.email === emailVal;
    });

    if (existingIndex === -1) {
      localSubs.push({
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        timestamp: Date.now()
      });
    } else {
      localSubs[existingIndex] = {
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        timestamp: typeof localSubs[existingIndex] === 'string' ? Date.now() : (localSubs[existingIndex].timestamp || Date.now())
      };
    }
    localStorage.setItem('blog-subscribers', JSON.stringify(localSubs));
    
    // Save to Firestore if cloud sync is active
    if (isCloudSyncActive && firestore) {
      firestore.collection('subscribers').doc(emailVal).set({
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        timestamp: Date.now()
      }).catch(err => console.error("Firestore subscribe failure:", err));
    }
    
    if (newsStatus) {
      newsStatus.classList.add('success');
      newsStatus.textContent = `✔ Thank you, ${nameVal}! You have been subscribed successfully.`;
      newsStatus.style.display = 'block';
      if (newsForm) newsForm.reset();
      
      setTimeout(() => {
        newsStatus.style.display = 'none';
      }, 5000);
    }
  };

  // Secret Hotkey: Ctrl + Shift + A to navigate to Admin Portal
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      navigateTo('admin-login');
    }
  });

  // ==========================================================================
  // 10A. Subscribers list rendering and deletion
  // ==========================================================================
  const subscribersTableBody = document.getElementById('admin-subscribers-table-body');

  function renderAdminSubscribers() {
    if (!subscribersTableBody) return;
    subscribersTableBody.innerHTML = '';

    const localSubs = JSON.parse(localStorage.getItem('blog-subscribers')) || [];
    
    if (localSubs.length === 0) {
      subscribersTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">
            No subscribers registered yet. Public newsletter signups will populate here in real-time.
          </td>
        </tr>
      `;
      return;
    }

    localSubs.forEach(s => {
      const row = document.createElement('tr');
      // Fallback if s is still a string from previous session
      const name = typeof s === 'string' ? 'N/A' : (s.name || 'N/A');
      const email = typeof s === 'string' ? s : (s.email || 'N/A');
      const phone = typeof s === 'string' ? 'N/A' : (s.phone || 'N/A');

      row.innerHTML = `
        <td style="font-weight:600; color:var(--text-primary);">${name}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td><span class="badge-status pub"><i class="fa-solid fa-circle-check"></i> Active</span></td>
        <td>
          <button class="action-icon-btn delete" onclick="deleteSubscriber('${email}')" title="Remove Subscriber"><i class="fa-solid fa-user-minus"></i></button>
        </td>
      `;
      subscribersTableBody.appendChild(row);
    });
  }

  window.deleteSubscriber = function(email) {
    if (confirm(`Are you sure you want to permanently remove subscriber '${email}' from your audience list?`)) {
      const localSubs = JSON.parse(localStorage.getItem('blog-subscribers')) || [];
      const updatedSubs = localSubs.filter(s => {
        if (typeof s === 'string') return s !== email;
        return s.email !== email;
      });
      
      localStorage.setItem('blog-subscribers', JSON.stringify(updatedSubs));
      
      // Delete from Firestore if active
      if (isCloudSyncActive && firestore) {
        firestore.collection('subscribers').doc(email).delete().then(() => {
          console.log(`✔ Successfully removed ${email} from Cloud database.`);
        }).catch(err => {
          console.error("Firestore subscriber delete failure:", err);
        });
      }
      
      showToast(`✔ Subscriber '${email}' has been removed.`);
      renderAdminSubscribers();
      renderAdminDashboard();
    }
  };

  // ==========================================================================
  // 10B. Manual Newsletter Broadcast & EmailJS Config
  // ==========================================================================
  const broadcastDialog = document.getElementById('broadcast-dialog');
  const broadcastPostPlaceholder = document.getElementById('broadcast-post-title-placeholder');
  const broadcastSubscribersCount = document.getElementById('broadcast-subscribers-count');
  const btnCancelBroadcast = document.getElementById('btn-cancel-broadcast');
  const btnConfirmBroadcast = document.getElementById('btn-confirm-broadcast');
  let pendingBroadcastId = null;

  window.toggleBroadcastAudienceView = function() {
    const audienceType = document.getElementById('broadcast-audience-type').value;
    const singleRecipientBox = document.getElementById('broadcast-single-recipient-box');
    const audienceStatsCard = document.getElementById('broadcast-audience-stats-card');
    
    if (audienceType === 'single') {
      if (singleRecipientBox) singleRecipientBox.style.display = 'flex';
      if (audienceStatsCard) audienceStatsCard.style.display = 'none';
    } else {
      if (singleRecipientBox) singleRecipientBox.style.display = 'none';
      if (audienceStatsCard) audienceStatsCard.style.display = 'block';
    }
  };

  window.triggerBroadcastBlogPost = function(postId) {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const localSubs = JSON.parse(localStorage.getItem('blog-subscribers')) || [];
    if (localSubs.length === 0) {
      showToast("❌ You do not have any newsletter subscribers yet!");
      return;
    }

    pendingBroadcastId = postId;
    if (broadcastPostPlaceholder) broadcastPostPlaceholder.textContent = post.title;
    if (broadcastSubscribersCount) broadcastSubscribersCount.textContent = `${localSubs.length} Subscriber${localSubs.length === 1 ? '' : 's'}`;
    
    // Reset selection option to 'all'
    const audienceTypeSelect = document.getElementById('broadcast-audience-type');
    if (audienceTypeSelect) {
      audienceTypeSelect.value = 'all';
      window.toggleBroadcastAudienceView();
    }

    // Populate subscribers dropdown list
    const singleEmailSelect = document.getElementById('broadcast-single-email');
    if (singleEmailSelect) {
      singleEmailSelect.innerHTML = '';
      localSubs.forEach(s => {
        const email = typeof s === 'string' ? s : s.email;
        const name = typeof s === 'string' ? 'Subscriber' : (s.name || 'Subscriber');
        const opt = document.createElement('option');
        opt.value = email;
        opt.textContent = `${name} (${email})`;
        singleEmailSelect.appendChild(opt);
      });
    }

    if (broadcastDialog) broadcastDialog.showModal();
  };

  if (btnCancelBroadcast) {
    btnCancelBroadcast.addEventListener('click', () => {
      if (broadcastDialog) broadcastDialog.close();
      pendingBroadcastId = null;
    });
  }

  if (btnConfirmBroadcast) {
    btnConfirmBroadcast.addEventListener('click', () => {
      if (!pendingBroadcastId) return;

      const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
      const post = allPosts.find(p => p.id === pendingBroadcastId);
      if (!post) return;

      // Close the dialog immediately
      if (broadcastDialog) broadcastDialog.close();

      // Check selected audience type
      const audienceType = document.getElementById('broadcast-audience-type').value;
      if (audienceType === 'single') {
        const targetEmail = document.getElementById('broadcast-single-email').value;
        if (targetEmail) {
          window.broadcastNewPost(post, targetEmail);
        } else {
          showToast("❌ No subscriber selected!");
        }
      } else {
        // Send to all
        window.broadcastNewPost(post);
      }
      
      pendingBroadcastId = null;
    });
  }

  window.broadcastNewPost = function(post, targetEmail = null) {
    const serviceId = localStorage.getItem('emailjs-service-id');
    const templateId = localStorage.getItem('emailjs-template-id');
    const publicKey = localStorage.getItem('emailjs-public-key');
    const senderName = localStorage.getItem('emailjs-sender-name') || 'Ameen Syed';

    // 1. If not configured, run in Mock Sandbox Mode
    if (!serviceId || !templateId || !publicKey) {
      if (targetEmail) {
        showToast(`📬 Sandbox Mode: Simulated newsletter push to '${targetEmail}' successfully!`);
      } else {
        showToast("📬 Sandbox Mode: Simulated newsletter push successfully!");
      }
      // Mark as broadcasted locally
      markPostAsBroadcasted(post.id);
      return;
    }

    // 2. Real-time EmailJS Broadcast Loop
    showToast(targetEmail ? `✉️ Preparing email dispatch to ${targetEmail}...` : "✉️ Preparing subscriber broadcast...");
    
    let localSubs = JSON.parse(localStorage.getItem('blog-subscribers')) || [];
    if (localSubs.length === 0) return;

    if (targetEmail) {
      localSubs = localSubs.filter(s => {
        const email = typeof s === 'string' ? s : s.email;
        return email === targetEmail;
      });
      if (localSubs.length === 0) {
        localSubs = [{ email: targetEmail, name: 'Subscriber' }];
      }
    }

    // Load EmailJS SDK
    if (typeof emailjs === 'undefined') {
      showToast("❌ EmailJS SDK failed to load. Please check your internet connection.");
      return;
    }

    // Initialize EmailJS
    emailjs.init(publicKey);

    // Loop through each subscriber and send email
    let sentCount = 0;
    let failCount = 0;

    const promises = localSubs.map(s => {
      const email = typeof s === 'string' ? s : s.email;
      const subName = typeof s === 'string' ? 'Subscriber' : (s.name || 'Subscriber');
      const shareUrl = `${window.location.origin}${window.location.pathname}#${post.id}`;
      const templateParams = {
        to_email: email,
        subscriber_email: email,
        subscriber_name: subName,
        sender_name: senderName,
        article_title: post.title,
        article_category: post.category,
        article_read_time: post.readTime,
        article_summary: post.summary,
        article_url: shareUrl
      };

      return emailjs.send(serviceId, templateId, templateParams)
        .then(() => {
          sentCount++;
        })
        .catch(err => {
          console.error(`Email dispatch failed for ${email}:`, err);
          failCount++;
        });
    });

    Promise.all(promises).then(() => {
      if (sentCount > 0) {
        if (targetEmail) {
          showToast(`✔ Email successfully dispatched to ${targetEmail}!`);
        } else {
          showToast(`✔ Broadcast completed: ${sentCount} emails dispatched successfully!`);
        }
        markPostAsBroadcasted(post.id);
      } else {
        showToast("❌ Broadcast failed. Please verify your EmailJS API keys.");
      }
    });
  };

  function markPostAsBroadcasted(postId) {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const postIdx = allPosts.findIndex(p => p.id === postId);
    if (postIdx !== -1) {
      allPosts[postIdx].broadcasted = true;
      localStorage.setItem('blog-database', JSON.stringify(allPosts));
      db = allPosts;

      // Update Firestore if active
      if (isCloudSyncActive && firestore) {
        firestore.collection('blogs').doc(postId).update({
          broadcasted: true
        }).catch(err => {
          firestore.collection('blogs').doc(postId).set({
            broadcasted: true
          }, { merge: true });
        });
      }
      
      renderAdminTable();
    }
  }

  // Save EmailJS Credentials
  window.saveEmailJSConfig = function(e) {
    e.preventDefault();
    const serviceId = document.getElementById('emailjs-service-id').value.trim();
    const templateId = document.getElementById('emailjs-template-id').value.trim();
    const publicKey = document.getElementById('emailjs-public-key').value.trim();
    const senderName = document.getElementById('emailjs-sender-name').value.trim();

    localStorage.setItem('emailjs-service-id', serviceId);
    localStorage.setItem('emailjs-template-id', templateId);
    localStorage.setItem('emailjs-public-key', publicKey);
    localStorage.setItem('emailjs-sender-name', senderName);

    showToast("✔ EmailJS API keys saved successfully!");
  };

  // Reset EmailJS Credentials
  window.resetEmailJSConfig = function() {
    if (confirm("Are you sure you want to clear your EmailJS configurations? This will return the email system to Sandbox Demo mode.")) {
      localStorage.removeItem('emailjs-service-id');
      localStorage.removeItem('emailjs-template-id');
      localStorage.removeItem('emailjs-public-key');
      localStorage.removeItem('emailjs-sender-name');

      document.getElementById('emailjs-service-id').value = '';
      document.getElementById('emailjs-template-id').value = '';
      document.getElementById('emailjs-public-key').value = '';
      document.getElementById('emailjs-sender-name').value = 'Ameen Syed';

      showToast("✔ EmailJS credentials cleared.");
    }
  };

  // Pre-fill EmailJS Configuration if exists
  function loadSavedEmailJSConfig() {
    const serviceId = localStorage.getItem('emailjs-service-id');
    const templateId = localStorage.getItem('emailjs-template-id');
    const publicKey = localStorage.getItem('emailjs-public-key');
    const senderName = localStorage.getItem('emailjs-sender-name') || 'Ameen Syed';

    const inputServiceId = document.getElementById('emailjs-service-id');
    const inputTemplateId = document.getElementById('emailjs-template-id');
    const inputPublicKey = document.getElementById('emailjs-public-key');
    const inputSenderName = document.getElementById('emailjs-sender-name');

    if (inputServiceId && serviceId) inputServiceId.value = serviceId;
    if (inputTemplateId && templateId) inputTemplateId.value = templateId;
    if (inputPublicKey && publicKey) inputPublicKey.value = publicKey;
    if (inputSenderName && senderName) inputSenderName.value = senderName;
  }

  // Pre-fill EmailJS config and initialize routing
  loadSavedEmailJSConfig();

  // ==========================================================================
  // 11. Visual Textarea Formatting Helpers
  // ==========================================================================
  window.insertFormat = function(tagOpen, tagClose = '') {
    const textarea = document.getElementById('post-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const replacement = tagOpen + (selectedText || '') + tagClose;
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    
    // Focus back on the textarea
    textarea.focus();
    // Re-select selection
    const newPos = start + tagOpen.length + (selectedText ? selectedText.length : 0);
    textarea.setSelectionRange(newPos, newPos);
  };

  window.insertLink = function() {
    const url = prompt("Enter the URL destination:");
    if (url) {
      insertFormat(`<a href="${url}" target="_blank" class="blog-link">`, '</a>');
    }
  };

  // ==========================================================================
  // 12. Visual Post Preview Handlers
  // ==========================================================================
  window.previewPostFromAdmin = function(postId) {
    postReaderSource = 'admin';
    window.loadPostReader(postId, 'admin');
  };

  window.handleReaderBack = function() {
    // Clear hash deep-linking on return
    window.location.hash = '';

    if (postReaderSource === 'admin') {
      window.navigateTo('admin-console');
      switchSubview('manage');
    } else {
      window.navigateTo('home');
    }
  };

  window.printArticle = function() {
    window.print();
  };

  window.shareToWhatsApp = function() {
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const post = allPosts.find(p => p.id === activePostId);
    if (!post) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#${activePostId}`;
    const text = encodeURIComponent(`Check out this insightful article by Syed Ameen: "${post.title}"\nRead here: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  window.shareToLinkedIn = function() {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${activePostId}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  window.copyArticleLink = function() {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${activePostId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Article link copied to clipboard!");
    }).catch(err => {
      console.error("Link copy failure:", err);
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        showToast("Article link copied to clipboard!");
      } catch (e) {
        alert("Failed to copy link automatically. Please copy it from here: " + shareUrl);
      }
      document.body.removeChild(input);
    });
  };

  // ==========================================================================
  // 13. Comments Thread Submission & Moderation Controllers
  // ==========================================================================
  window.handleCommentSubmit = function(event) {
    event.preventDefault();
    const authorInput = document.getElementById('comment-author-name');
    const contentInput = document.getElementById('comment-text');
    const statusDiv = document.getElementById('comment-status');
    
    if (!authorInput || !contentInput) return;
    
    const name = authorInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!name || !content) return;
    
    const newComment = {
      id: 'comment-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      postId: activePostId,
      name: name,
      content: content,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    // Save locally
    const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
    localComments.push(newComment);
    localStorage.setItem('blog-comments', JSON.stringify(localComments));
    
    // Save to Firestore if active
    if (isCloudSyncActive && firestore) {
      firestore.collection('comments').doc(newComment.id).set({
        postId: newComment.postId,
        name: newComment.name,
        content: newComment.content,
        timestamp: newComment.timestamp,
        status: newComment.status
      }).then(() => {
        console.log("✔ Comment synced to Cloud Firestore.");
      }).catch(err => {
        console.error("Firestore comment submission failure:", err);
      });
    }
    
    // UI Feedback
    if (statusDiv) {
      statusDiv.className = 'comment-status-msg success';
      statusDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you! Your comment is awaiting administrator moderation.`;
      
      // Clear status after 5 seconds
      setTimeout(() => {
        statusDiv.style.opacity = '0';
        setTimeout(() => {
          statusDiv.innerHTML = '';
          statusDiv.className = 'newsletter-status';
          statusDiv.style.opacity = '1';
        }, 300);
      }, 5000);
    }
    
    // Show a beautiful Toast
    showToast("✔ Comment submitted! Awaiting administrator moderation.");
    
    // Reset Form
    document.getElementById('comment-submit-form').reset();
  };

  window.renderApprovedComments = function(postId) {
    const listContainer = document.getElementById('comments-list-container');
    const countSpan = document.getElementById('comments-count');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
    const approvedComments = localComments
      .filter(c => c.postId === postId && c.status === 'approved')
      .sort((a, b) => a.timestamp - b.timestamp); // Chronological: oldest first
      
    if (countSpan) {
      countSpan.textContent = approvedComments.length;
    }
    
    if (approvedComments.length === 0) {
      listContainer.innerHTML = `
        <p style="color: var(--text-muted); font-size: 0.95rem; font-style: italic; text-align: center; padding: 20px 0;">
          No comments yet. Be the first to share your thoughts!
        </p>
      `;
      return;
    }
    
    approvedComments.forEach(comment => {
      // Generate initials for avatar
      const nameParts = comment.name.split(' ');
      const initials = nameParts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
      
      const formattedTime = new Date(comment.timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const card = document.createElement('div');
      card.className = 'comment-card';
      card.innerHTML = `
        <div class="comment-avatar">${initials}</div>
        <div style="flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 5px;">
            <h5 class="comment-author-name">${comment.name}</h5>
            <span class="comment-date">${formattedTime}</span>
          </div>
          <p class="comment-content">${comment.content}</p>
        </div>
      `;
      
      // Render replies if they exist
      const repliesContainer = document.createElement('div');
      repliesContainer.className = 'comment-replies-container';
      
      const commentReplies = comment.replies || [];
      commentReplies.forEach(reply => {
        const replyInitials = reply.name.split(' ').map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
        const replyTime = new Date(reply.timestamp).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const replyCard = document.createElement('div');
        replyCard.className = 'comment-card reply-card';
        
        let authorBadge = '';
        let avatarStyle = '';
        
        if (reply.isAdmin) {
          authorBadge = `<span class="badge-status pub" style="font-size: 0.65rem; margin-left: 8px; vertical-align: middle; background: rgba(242, 93, 156, 0.12); color: var(--accent-gold); border: 1px solid rgba(242, 93, 156, 0.2);"><i class="fa-solid fa-user-tie"></i> Syed Ameen (Author)</span>`;
          avatarStyle = 'style="background: linear-gradient(135deg, var(--accent-gold), hsl(20, 90%, 50%)); box-shadow: 0 0 8px rgba(242, 93, 156, 0.35); border: 1px solid var(--accent-gold); color: white !important;"';
        }
        
        replyCard.innerHTML = `
          <div class="comment-avatar" ${avatarStyle}>${replyInitials}</div>
          <div style="flex-grow: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 5px;">
              <h5 class="comment-author-name" style="font-size: 0.95rem;">${reply.name} ${authorBadge}</h5>
              <span class="comment-date" style="font-size: 0.72rem;">${replyTime}</span>
            </div>
            <p class="comment-content" style="font-size: 0.88rem;">${reply.content}</p>
          </div>
        `;
        repliesContainer.appendChild(replyCard);
      });

      const commentGroup = document.createElement('div');
      commentGroup.style.cssText = 'display: flex; flex-direction: column; gap: 10px; width: 100%;';
      commentGroup.appendChild(card);
      if (commentReplies.length > 0) {
        commentGroup.appendChild(repliesContainer);
      }
      
      listContainer.appendChild(commentGroup);
    });
  };

  window.renderAdminComments = function() {
    const tableBody = document.getElementById('admin-comments-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    
    // Sort comments by timestamp descending (newest first)
    const sortedComments = [...localComments].sort((a, b) => b.timestamp - a.timestamp);
    
    if (sortedComments.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
            <i class="fa-solid fa-comments" style="font-size: 2.5rem; color: var(--accent-purple-glow); display: block; margin-bottom: 12px;"></i>
            No comments submitted yet.
          </td>
        </tr>
      `;
      return;
    }
    
    sortedComments.forEach(comment => {
      // Find associated post title
      const post = allPosts.find(p => p.id === comment.postId);
      const postTitle = post ? post.title : `Deleted Article (${comment.postId})`;
      
      const formattedTime = new Date(comment.timestamp).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const statusBadge = comment.status === 'approved' 
        ? `<span class="badge-status pub"><i class="fa-solid fa-circle-check"></i> Approved</span>`
        : `<span class="badge-status draft"><i class="fa-solid fa-clock"></i> Pending</span>`;
        
      const approveBtn = comment.status === 'pending'
        ? `<button class="action-icon-btn approve" onclick="approveComment('${comment.id}')" title="Approve Comment"><i class="fa-solid fa-check"></i></button>`
        : '';
        
      let repliesSnippet = '';
      if (comment.replies && comment.replies.length > 0) {
        const lastReply = comment.replies[comment.replies.length - 1];
        repliesSnippet = `
          <div style="margin-top: 6px; font-size: 0.76rem; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.03); border-left: 2px solid var(--accent-purple); color: var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="Replies count: ${comment.replies.length}. Last: ${lastReply.content}">
            <i class="fa-solid fa-reply" style="transform: scaleX(-1); margin-right: 4px; color: var(--accent-purple);"></i> <strong>Replied:</strong> ${lastReply.content}
          </div>
        `;
      }
        
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-weight: 600; color: var(--text-primary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${postTitle}">${postTitle}</td>
        <td style="font-weight: 600; color: var(--text-primary);">${comment.name}</td>
        <td>
          <div style="max-width: 250px; max-height: 80px; overflow-y: auto; white-space: pre-wrap; font-size: 0.85rem;" title="${comment.content}">${comment.content}</div>
          ${repliesSnippet}
        </td>
        <td style="font-size: 0.8rem; white-space: nowrap;">${formattedTime}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            ${approveBtn}
            <button class="action-icon-btn reply" onclick="openCommentReplyDialog('${comment.id}')" title="Reply to Comment"><i class="fa-solid fa-reply"></i></button>
            <button class="action-icon-btn delete" onclick="deleteComment('${comment.id}')" title="Delete Comment"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  };

  window.approveComment = function(commentId) {
    const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
    const comment = localComments.find(c => c.id === commentId);
    
    if (!comment) return;
    
    comment.status = 'approved';
    localStorage.setItem('blog-comments', JSON.stringify(localComments));
    
    // Update in Firestore if active
    if (isCloudSyncActive && firestore) {
      firestore.collection('comments').doc(commentId).update({
        status: 'approved'
      }).then(() => {
        console.log(`✔ Comment ${commentId} approved in Cloud Database.`);
      }).catch(err => {
        console.error("Firestore comment approve failure:", err);
      });
    }
    
    showToast("✔ Comment has been approved and is now public!");
    renderAdminComments();
    renderAdminDashboard();
  };

  window.deleteComment = function(commentId) {
    if (confirm("Are you sure you want to permanently delete this comment? This action cannot be undone.")) {
      const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
      const updatedComments = localComments.filter(c => c.id !== commentId);
      
      localStorage.setItem('blog-comments', JSON.stringify(updatedComments));
      
      // Delete in Firestore if active
      if (isCloudSyncActive && firestore) {
        firestore.collection('comments').doc(commentId).delete().then(() => {
          console.log(`✔ Comment ${commentId} deleted from Cloud Database.`);
        }).catch(err => {
          console.error("Firestore comment delete failure:", err);
        });
      }
      
      showToast("✔ Comment has been permanently deleted.");
      renderAdminComments();
      renderAdminDashboard();
    }
  };

  // ==========================================================================
  // 14. Comment Replies Control Panel (Syed Ameen / Author Replies)
  // ==========================================================================
  let activeReplyCommentId = null;

  window.openCommentReplyDialog = function(commentId) {
    const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
    const comment = localComments.find(c => c.id === commentId);
    if (!comment) return;
    
    activeReplyCommentId = commentId;
    
    const replyDialog = document.getElementById('reply-dialog');
    const authorPlaceholder = document.getElementById('reply-comment-author');
    const textPlaceholder = document.getElementById('reply-comment-text-placeholder');
    const replyInput = document.getElementById('reply-text-input');
    
    if (replyDialog && authorPlaceholder && textPlaceholder && replyInput) {
      authorPlaceholder.textContent = comment.name;
      textPlaceholder.textContent = comment.content;
      replyInput.value = '';
      replyDialog.showModal();
    }
  };

  // Reply event listeners
  const replyDialog = document.getElementById('reply-dialog');
  const btnCancelReply = document.getElementById('btn-cancel-reply');
  const btnConfirmReply = document.getElementById('btn-confirm-reply');

  if (btnCancelReply && replyDialog) {
    btnCancelReply.addEventListener('click', () => {
      replyDialog.close();
      activeReplyCommentId = null;
    });
  }

  if (btnConfirmReply && replyDialog) {
    btnConfirmReply.addEventListener('click', () => {
      const replyInput = document.getElementById('reply-text-input');
      if (!replyInput || !activeReplyCommentId) return;
      
      const content = replyInput.value.trim();
      if (!content) return;
      
      const localComments = JSON.parse(localStorage.getItem('blog-comments')) || [];
      const comment = localComments.find(c => c.id === activeReplyCommentId);
      if (!comment) return;
      
      if (!comment.replies) {
        comment.replies = [];
      }
      
      const newReply = {
        id: 'reply-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: 'Syed Ameen',
        content: content,
        timestamp: Date.now(),
        isAdmin: true
      };
      
      comment.replies.push(newReply);
      
      // Auto-approve parent comment if it was pending
      if (comment.status === 'pending') {
        comment.status = 'approved';
        showToast("✔ Comment approved and reply posted!");
      } else {
        showToast("✔ Reply posted successfully!");
      }
      
      localStorage.setItem('blog-comments', JSON.stringify(localComments));
      
      // Update in Firestore if active
      if (isCloudSyncActive && firestore) {
        firestore.collection('comments').doc(activeReplyCommentId).update({
          replies: comment.replies,
          status: comment.status
        }).then(() => {
          console.log(`✔ Comment reply successfully synced to Cloud Firestore.`);
        }).catch(err => {
          console.error("Firestore comment reply sync failure:", err);
        });
      }
      
      replyDialog.close();
      activeReplyCommentId = null;
      renderAdminComments();
      renderAdminDashboard();
    });
  }

  };

  // ==========================================================================
  // 15. AmeenBot AI Chatbot & Google Gemini API Controllers
  // ==========================================================================
  
  // Pre-populate Gemini API key in Admin Console Cloud tab
  const geminiKeyInput = document.getElementById('cloud-gemini-key');
  if (geminiKeyInput) {
    geminiKeyInput.value = localStorage.getItem('blog-gemini-key') || '';
  }

  window.saveGeminiConfig = function(event) {
    event.preventDefault();
    const keyVal = document.getElementById('cloud-gemini-key').value.trim();
    if (!keyVal) return;
    
    localStorage.setItem('blog-gemini-key', keyVal);
    showToast("✔ Google Gemini API Key saved securely!");
    updateAmeenBotModeBadge();
  };

  window.resetGeminiConfig = function() {
    if (confirm("Are you sure you want to remove the Gemini API key? AmeenBot will fall back to local Knowledge-Base Search mode.")) {
      localStorage.removeItem('blog-gemini-key');
      const input = document.getElementById('cloud-gemini-key');
      if (input) input.value = '';
      showToast("✔ Gemini API Key removed.");
      updateAmeenBotModeBadge();
    }
  };

  function updateAmeenBotModeBadge() {
    const badge = document.getElementById('bot-mode-badge');
    if (!badge) return;
    
    const key = localStorage.getItem('blog-gemini-key');
    if (key) {
      badge.textContent = "Gemini AI";
      badge.classList.add('active');
    } else {
      badge.textContent = "Search KB";
      badge.classList.remove('active');
    }
  }
  
  // Call initially to set status badge
  updateAmeenBotModeBadge();

  window.toggleAmeenBot = function() {
    const chatbox = document.getElementById('ameenbot-window');
    if (!chatbox) return;
    
    const isActive = chatbox.classList.toggle('active');
    if (isActive) {
      updateAmeenBotModeBadge();
      const input = document.getElementById('ameenbot-text-input');
      if (input) input.focus();
    }
  };

  window.sendBotSuggestion = function(text) {
    const input = document.getElementById('ameenbot-text-input');
    if (input) {
      input.value = text;
      const form = document.getElementById('ameenbot-form');
      if (form) {
        // Mimic submit event
        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);
      }
    }
  };

  window.handleBotSubmit = function(event) {
    event.preventDefault();
    const input = document.getElementById('ameenbot-text-input');
    if (!input) return;
    
    const messageText = input.value.trim();
    if (!messageText) return;
    
    // Add user message bubble
    appendBotMessage(messageText, true);
    input.value = '';
    
    // Show bot typing indicator
    showBotTyping();
    
    // Compile and deliver response after brief network simulated lag
    setTimeout(() => {
      compileBotResponse(messageText).then(reply => {
        removeBotTyping();
        appendBotMessage(reply, false);
      }).catch(err => {
        console.error("AmeenBot compile error:", err);
        removeBotTyping();
        appendBotMessage("Sorry, I encountered a connection issue compiling your response. Please try again in a few moments!", false);
      });
    }, 1000);
  };

  function appendBotMessage(content, isUser) {
    const container = document.getElementById('ameenbot-messages-container');
    if (!container) return;
    
    const group = document.createElement('div');
    group.className = `ameenbot-msg-group ${isUser ? 'user' : 'bot'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'ameenbot-avatar-msg';
    avatar.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
    
    const bubble = document.createElement('div');
    bubble.className = 'ameenbot-bubble-msg';
    
    if (isUser) {
      bubble.textContent = content;
    } else {
      // Process simple markdown-like syntax for the bot responses
      let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      
      bubble.innerHTML = html;
    }
    
    group.appendChild(avatar);
    group.appendChild(bubble);
    container.appendChild(group);
    
    // Scroll smoothly to bottom
    container.scrollTop = container.scrollHeight;
  }

  function showBotTyping() {
    const container = document.getElementById('ameenbot-messages-container');
    if (!container) return;
    
    const typingGroup = document.createElement('div');
    typingGroup.id = 'ameenbot-typing-indicator';
    typingGroup.className = 'ameenbot-msg-group bot';
    
    typingGroup.innerHTML = `
      <div class="ameenbot-avatar-msg"><i class="fa-solid fa-robot"></i></div>
      <div class="ameenbot-bubble-msg" style="padding: 10px 14px;">
        <div class="typing-dots">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    
    container.appendChild(typingGroup);
    container.scrollTop = container.scrollHeight;
  }

  function removeBotTyping() {
    const indicator = document.getElementById('ameenbot-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function compileBotResponse(query) {
    const key = localStorage.getItem('blog-gemini-key');
    if (key) {
      return fetchGeminiAIResponse(query, key);
    } else {
      return compileLocalKBResponse(query);
    }
  }

  function fetchGeminiAIResponse(query, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    const articlesMeta = allPosts.map(p => `ID: ${p.id}, Title: "${p.title}", Summary: ${p.summary}`).join('\n');
    
    const systemPrompt = `You are AmeenBot, the official AI educational and career assistant for Syed Ameen's personal blog.
Syed Ameen is a professional authority in fintech innovation, B.Com university student mentoring, corporate ledger standard reconciliation, operations auditing, and Tally Prime workflows.
Answer questions in a highly encouraging, polite, academic, and expert operations tone.
If the question is about Tally, financial ledger booking, Excel audits, or B.Com advice, provide premium, educational explanations.

Here are the active articles published on Syed Ameen's blog. Refer to them whenever relevant and invite the user to read them by mentioning their title:
${articlesMeta}

Keep responses brief and engaging (maximum 3-4 paragraphs or concise listings). Use standard Markdown formatting (**bold**, *italics*, bullet lists).`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nVisitor Question: ${query}`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 350,
        temperature: 0.7
      }
    };
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Gemini API Error: Status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      }
      return "I compiled an empty response from the AI engine. Please try another query!";
    })
    .catch(err => {
      console.error("Gemini Fetch Failure, falling back to KB:", err);
      return compileLocalKBResponse(query)
        .then(fallbackText => `*[Fallback Mode: API Key connection error]*\n\n${fallbackText}`);
    });
  }

  function compileLocalKBResponse(query) {
    const q = query.toLowerCase();
    const allPosts = JSON.parse(localStorage.getItem('blog-database')) || [];
    
    // Simple Keyword matching
    let matchingPost = null;
    for (const post of allPosts) {
      if (post.status === 'published' && (post.title.toLowerCase().includes(q) || post.summary.toLowerCase().includes(q))) {
        matchingPost = post;
        break;
      }
    }
    
    if (matchingPost) {
      return Promise.resolve(`I found an excellent article written by Syed Ameen that addresses your question!

**${matchingPost.title}**
*${matchingPost.summary}*

You can load and read the full comprehensive guide directly inside the reader panel here:
<a href="#" onclick="window.loadPostReader('${matchingPost.id}', 'home'); toggleAmeenBot(); event.preventDefault();">Click here to open and read article</a>.

Let me know if you would like me to summarize other parts of his finance or operations database!`);
    }
    
    // Standard keyword matches
    if (q.includes('excel') || q.includes('sharpe') || q.includes('audit')) {
      return Promise.resolve(`Excel spreadsheets are the core of operational finance audits! Syed Ameen teaches emerging professionals how to reconcilate ledgers, manage asset volatility, and compute Sharpe ratios dynamically.
      
If you want a detailed guide on this, check out Syed Ameen's popular article:
<a href="#" onclick="window.loadPostReader('post-1', 'home'); toggleAmeenBot(); event.preventDefault();">Navigating the 2026 Financial Markets</a>.`);
    }
    
    if (q.includes('tally') || q.includes('prime') || q.includes('ledger') || q.includes('workflow')) {
      return Promise.resolve(`Tally Prime is a fundamental competency for commerce and fintech operations! Modern workflows require reconciling ledgers in real-time and automating transaction audits.
      
Syed Ameen has written guides detailing this under his **Finance** and **Operations** categories. Check out:
<a href="#" onclick="window.loadPostReader('post-1', 'home'); toggleAmeenBot(); event.preventDefault();">Navigating the 2026 Financial Markets</a>.`);
    }
    
    if (q.includes('career') || q.includes('grad') || q.includes('job') || q.includes('b.com') || q.includes('student')) {
      return Promise.resolve(`For B.Com commerce graduates, standing out in the 2026 hiring landscape requires a blend of standard theoretical accounting (standard ledgers, audits) and modern technical tools (Excel automation, Tally Prime). 

I highly recommend reading Syed Ameen's specialized guides to kickstart your corporate journey:
- <a href="#" onclick="window.loadPostReader('post-1', 'home'); toggleAmeenBot(); event.preventDefault();">Navigating the 2026 Financial Markets: Key Trends for B.Com Graduates</a>
- <a href="#" onclick="window.loadPostReader('post-2', 'home'); toggleAmeenBot(); event.preventDefault();">Operational Excellence in Insurance Audits</a>.`);
    }
    
    if (q.includes('who') || q.includes('ameen') || q.includes('syed') || q.includes('about')) {
      return Promise.resolve(`**Syed Ameen** is an Entrepreneur, Educator, and Fintech Innovator based in India. He specializes in capital market derivatives, operations auditing, insurance balance sheets, and mentoring commerce graduates. 

You can read his full professional summary and greeting on the homepage!`);
    }
    
    // Default reply
    return Promise.resolve(`I am here to help you navigate Syed Ameen's fintech and commerce database! 

You can ask me questions about:
* **B.Com Career Roadmaps** and upskilling advice.
* **Tally Prime workflows** and ledger reconciliation.
* **Excel spreadsheet metrics** and formulas like the Sharpe Ratio.
* **Operations audits** and insurance balance sheets.

Or simply select one of the quick suggestions chips below!`);
  }

  // Render initial blogs or route to admin / deep-linked posts if hash is provided
  const currentHash = window.location.hash;
  if (currentHash === '#admin' || currentHash === '#admin-login') {
    navigateTo('admin-login');
  } else if (currentHash.startsWith('#post-')) {
    const postId = currentHash.substring(1); // removes the '#'
    window.loadPostReader(postId, 'home');
  } else {
    navigateTo('home');
  }
});
