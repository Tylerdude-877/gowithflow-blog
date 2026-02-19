// Storage keys
const STORAGE_KEYS = {
    POSTS: 'gwf_posts',
    COMMENTS: 'gwf_comments',
    LIKES: 'gwf_likes',
    SUBSCRIBERS: 'gwf_subscribers',
    ADMIN_SESSION: 'gwf_admin_session',
    VIEWS: 'gwf_views',
    ACTIVITY: 'gwf_activity'
};

// Admin credentials - Tyler
const ADMIN_CREDENTIALS = {
    username: 'Tyler',
    password: 'tyler123$\'*\''
};

// Current state
let currentPostId = null;
let currentEditingPostId = null;
let currentFilter = 'hot';
let currentPage = 'homePage';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    loadBlogPosts();
    initHeaderScroll();
    initHistoryNavigation();

    // Check URL hash on load
    handleHashChange();
});

// Handle browser back/forward buttons
function initHistoryNavigation() {
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            setActivePage(event.state.page, false);
            if (event.state.postId) {
                currentPostId = event.state.postId;
                loadPostDetail(event.state.postId);
                loadComments(event.state.postId);
            }
            if (event.state.filter) {
                currentFilter = event.state.filter;
                loadBlogPosts();
            }
        } else {
            // Default to home if no state
            setActivePage('homePage', false);
        }
    });
}

// Handle hash changes for direct URL access
function handleHashChange() {
    const hash = window.location.hash;
    if (hash.startsWith('#post-')) {
        const postId = parseInt(hash.replace('#post-', ''));
        if (!isNaN(postId)) {
            showPostDetail(postId);
        }
    }
}

// Header scroll effect
function initHeaderScroll() {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Initialize default data
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        const defaultPosts = [
            {
                id: Date.now() + 1,
                title: 'The Art of Living in the Moment',
                subtitle: 'Discovering peace through mindfulness and presence',
                image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
                content: '<p>In our fast-paced world, we often forget to pause and truly <strong>live in the moment</strong>. Mindfulness isn\'t just a buzzword—it\'s a transformative practice that can change how we experience life.</p><p>When we learn to be present, we discover a richness in everyday moments that we\'ve been missing. The warmth of morning coffee, the sound of rain, the smile of a stranger—these small moments become treasures when we\'re truly paying attention.</p><p style="color: #3b82f6; font-size: 1.2rem;"><em>"The present moment is the only time over which we have dominion." - Thích Nhất Hạnh</em></p>',
                category: 'lifestyle',
                date: new Date().toISOString(),
                publisher: 'Tyler',
                likes: 42,
                hot: true
            },
            {
                id: Date.now() + 2,
                title: 'Journey Through the Mountains',
                subtitle: 'A solo adventure that changed my perspective on life',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                content: '<p>There\'s something magical about standing at the peak of a mountain, looking down at the world below. My recent trek through the Himalayas wasn\'t just a physical journey—it was a <span style="background-color: #fef3c7;">spiritual awakening</span>.</p><p>The silence at 4,000 meters is unlike anything you\'ll experience in the city. It\'s a silence that speaks, that heals, that transforms.</p><p>I learned that the path upward is never straight. There are switchbacks, obstacles, and moments when you want to give up. But each step forward, no matter how small, brings you closer to the summit.</p>',
                category: 'travel',
                date: new Date(Date.now() - 86400000).toISOString(),
                publisher: 'Tyler',
                likes: 28,
                hot: true
            },
            {
                id: Date.now() + 3,
                title: 'The Future of Sustainable Living',
                subtitle: 'How small changes today create a better tomorrow',
                image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
                content: '<p>Climate change isn\'t a distant threat—it\'s happening now. But there\'s hope. Through <strong>conscious choices</strong> and sustainable practices, we can make a difference.</p><p>Start small: <ul><li>Reduce single-use plastics</li><li>Choose local, seasonal produce</li><li>Embrace minimalism</li><li>Support eco-friendly brands</li></ul></p><p>Every action matters. Every choice counts. Together, we can create a sustainable future for generations to come.</p>',
                category: 'lifestyle',
                date: new Date(Date.now() - 172800000).toISOString(),
                publisher: 'Tyler',
                likes: 35,
                hot: false
            }
        ];
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(defaultPosts));
    }

    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.VIEWS)) {
        localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
    }
}

// Mobile menu functions
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// Navigation with history support
function showHome() {
    setActivePage('homePage', true);
    currentFilter = 'hot';
    loadBlogPosts();
}

function showSubscribe() {
    setActivePage('subscribePage', true);
    updateSubscribersInfo();
}

function showAdminLogin() {
    if (isAdminLoggedIn()) {
        showAdminPanel();
    } else {
        setActivePage('adminLoginPage', true);
    }
}

function showAdminPanel() {
    setActivePage('adminPanel', true);
    showAdminTab('analytics');
    loadAnalytics();
}

function showPostDetail(postId) {
    currentPostId = postId;
    setActivePage('postDetailPage', true, { postId: postId });
    trackPostView(postId);
    loadPostDetail(postId);
    loadComments(postId);
}

function setActivePage(pageId, pushState = true, extraState = {}) {
    // Close mobile menu when navigating
    closeMobileMenu();

    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser history
    if (pushState && pageId !== currentPage) {
        const state = { page: pageId, ...extraState };
        history.pushState(state, '', window.location.pathname);
        currentPage = pageId;
    }
}

// Post Filtering
function filterPosts(filter) {
    currentFilter = filter;

    // Update active filter link
    document.querySelectorAll('.filter-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-filter') === filter) {
            link.classList.add('active');
        }
    });

    loadBlogPosts();
    return false; // Prevent default link behavior
}

// Blog Posts
function loadBlogPosts() {
    let posts = getPosts();

    // Filter posts based on current filter
    if (currentFilter === 'hot') {
        posts = posts.filter(p => p.hot === true);
    } else if (currentFilter === 'latest') {
        posts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const container = document.getElementById('postsGrid');

    if (posts.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No posts yet. Check back soon!</p></div>';
        return;
    }

    container.innerHTML = posts.map(post => {
        const likes = post.likes || 0;
        const commentCount = getPostComments(post.id).length;

        return `
            <div class="post-card" onclick="showPostDetail(${post.id})">
                <img src="${post.image}" alt="${post.title}" class="post-card-image" onerror="this.src='https://via.placeholder.com/800x400?text=Blog+Post'">
                <div class="post-card-content">
                    <span class="post-card-category">${post.category || 'lifestyle'}</span>
                    <h3 class="post-card-title">${post.title}</h3>
                    <p class="post-card-subtitle">${post.subtitle}</p>
                    <div class="post-card-meta">
                        <div class="post-card-author">
                            <i class="fas fa-user-circle"></i>
                            <span>${post.publisher}</span>
                        </div>
                        <div class="post-card-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${formatDate(post.date)}
                        </div>
                    </div>
                    <div class="post-card-stats">
                        <span><i class="fas fa-heart"></i> ${likes}</span>
                        <span><i class="fas fa-comment"></i> ${commentCount}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadPostDetail(postId) {
    const post = getPostById(postId);
    if (!post) {
        showHome();
        return;
    }

    const likes = post.likes || 0;
    const userLiked = hasUserLikedPost(postId);

    document.getElementById('postDetail').innerHTML = `
        <span class="post-detail-category">${post.category || 'lifestyle'}</span>
        <h1 class="post-detail-title">${post.title}</h1>
        <p class="post-detail-subtitle">${post.subtitle}</p>
        <div class="post-detail-meta">
            <div class="post-author-info">
                <i class="fas fa-user-circle"></i>
                <span>${post.publisher}</span>
            </div>
            <div class="post-date-info">
                <i class="fas fa-calendar-alt"></i>
                <span>${formatDate(post.date)}</span>
            </div>
        </div>
        <img src="${post.image}" alt="${post.title}" class="post-detail-image" onerror="this.src='https://via.placeholder.com/1200x400?text=Blog+Post'">
        <div class="post-detail-content">${post.content}</div>
        <div class="post-actions">
            <button class="action-btn ${userLiked ? 'liked' : ''}" onclick="toggleLike(${postId})">
                <i class="fas fa-heart"></i> ${userLiked ? 'Liked' : 'Like'} (${likes})
            </button>
            <button class="action-btn" onclick="openShareModal(${postId})">
                <i class="fas fa-share-alt"></i> Share
            </button>
        </div>
    `;
}

// Like functionality
function toggleLike(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const likes = getLikes();
    const userLiked = likes[postId] || false;

    if (userLiked) {
        post.likes = Math.max(0, (post.likes || 0) - 1);
        delete likes[postId];
    } else {
        post.likes = (post.likes || 0) + 1;
        likes[postId] = true;
    }

    savePosts(posts);
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    loadPostDetail(postId);
}

function hasUserLikedPost(postId) {
    const likes = getLikes();
    return likes[postId] || false;
}

// Comments
function loadComments(postId) {
    const comments = getPostComments(postId);
    document.getElementById('commentCount').textContent = comments.length;

    const container = document.getElementById('commentsList');
    if (comments.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>No comments yet. Be the first to share your thoughts!</p></div>';
        return;
    }

    container.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author"><i class="fas fa-user"></i> ${comment.author}</span>
                <span class="comment-date">${formatDate(comment.date)}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

function addComment() {
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();

    if (!name || !text) {
        alert('Please fill in both name and comment fields.');
        return;
    }

    const comments = getComments();
    if (!comments[currentPostId]) {
        comments[currentPostId] = [];
    }

    comments[currentPostId].push({
        id: Date.now(),
        author: name,
        text: text,
        date: new Date().toISOString()
    });

    saveComments(comments);

    document.getElementById('commentName').value = '';
    document.getElementById('commentText').value = '';

    loadComments(currentPostId);
}

// Share functionality
function openShareModal(postId) {
    const post = getPostById(postId);
    if (!post) return;

    const url = window.location.href.split('#')[0] + '#post-' + postId;
    const title = post.title;
    const text = post.subtitle || stripHtml(post.content).substring(0, 100);

    // Update share links
    document.getElementById('shareWhatsApp').href = `https://wa.me/?text=${encodeURIComponent(title + '\n' + text + '\n\n' + url)}`;
    document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    document.getElementById('shareTwitter').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    document.getElementById('shareLinkedIn').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    document.getElementById('shareMessenger').href = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(url)}`;
    document.getElementById('shareEmail').href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\nRead more: ' + url)}`;

    document.getElementById('shareModal').classList.add('active');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

function shareToInstagram() {
    alert('Instagram sharing works best on mobile devices. Copy the link and share it in your Instagram story or bio!');
    copyLink();
    closeShareModal();
    return false;
}

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard! ✓');
    }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard! ✓');
    });
}

// Subscription
function subscribe(event) {
    event.preventDefault();

    const name = document.getElementById('subscribeName').value.trim();
    const email = document.getElementById('subscribeEmail').value.trim();
    const weekly = document.getElementById('subscribeWeekly').checked;
    const hot = document.getElementById('subscribeHot').checked;
    const msgEl = document.getElementById('subscribeMessage');

    if (!name || !email) {
        msgEl.innerHTML = '<div class="subscribe-msg error"><i class="fas fa-exclamation-circle"></i> Please fill in all required fields.</div>';
        return;
    }

    const subscribers = getSubscribers();

    // Check if email already exists
    if (subscribers.find(s => s.email === email)) {
        msgEl.innerHTML = '<div class="subscribe-msg error"><i class="fas fa-exclamation-circle"></i> This email is already subscribed!</div>';
        return;
    }

    subscribers.push({
        id: Date.now(),
        name: name,
        email: email,
        weekly: weekly,
        hot: hot,
        date: new Date().toISOString()
    });

    saveSubscribers(subscribers);

    // Show success message
    msgEl.innerHTML = '<div class="subscribe-msg success"><i class="fas fa-check-circle"></i> Thank you for subscribing! You\'ll receive updates based on your preferences.</div>';

    // Reset form
    document.getElementById('subscribeName').value = '';
    document.getElementById('subscribeEmail').value = '';
    document.getElementById('subscribeWeekly').checked = true;
    document.getElementById('subscribeHot').checked = false;

    updateSubscribersInfo();

    // Clear success message after 5 seconds
    setTimeout(() => { msgEl.innerHTML = ''; }, 5000);
}

function updateSubscribersInfo() {
    const subscribers = getSubscribers();
    const container = document.getElementById('subscribersList');

    if (subscribers.length > 0) {
        container.innerHTML = `<p class="subscribers-count"><i class="fas fa-users"></i> ${subscribers.length} reader${subscribers.length > 1 ? 's' : ''} already in our community!</p>`;
    } else {
        container.innerHTML = '';
    }
}

// Admin Authentication
function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        showAdminPanel();
    } else {
        alert('Invalid credentials. Please check your username and password.');
    }
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    showHome();
}

function isAdminLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
}

// Admin Tabs
function showAdminTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));

    // Activate matching tab button by its onclick attribute
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    if (tabName === 'analytics') {
        document.getElementById('adminAnalyticsTab').classList.add('active');
        loadAnalytics();
    } else if (tabName === 'posts') {
        document.getElementById('adminPostsTab').classList.add('active');
        loadAdminPosts();
    } else if (tabName === 'comments') {
        document.getElementById('adminCommentsTab').classList.add('active');
        loadAdminComments();
    } else if (tabName === 'subscribers') {
        document.getElementById('adminSubscribersTab').classList.add('active');
        loadAdminSubscribers();
    } else if (tabName === 'new-post') {
        document.getElementById('adminNewPostTab').classList.add('active');
    }
}

// Admin Posts Management
function loadAdminPosts() {
    const posts = getPosts();
    const container = document.getElementById('adminPostsList');

    if (posts.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No posts yet. Create your first post!</p></div>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="admin-post-item">
            <div class="admin-post-info">
                <h4>${post.title} ${post.hot ? '🔥' : ''}</h4>
                <p>
                    <i class="fas fa-tag"></i> ${post.category || 'lifestyle'} |
                    <i class="fas fa-calendar"></i> ${formatDate(post.date)} |
                    <i class="fas fa-heart"></i> ${post.likes || 0} likes |
                    <i class="fas fa-comment"></i> ${getPostComments(post.id).length} comments
                </p>
            </div>
            <div class="admin-post-actions">
                <button class="btn-edit" onclick="editPost(${post.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" onclick="deletePost(${post.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function editPost(postId) {
    const post = getPostById(postId);
    if (!post) return;

    currentEditingPostId = postId;
    document.getElementById('editorTitle').textContent = 'Edit Post';
    document.getElementById('editPostId').value = postId;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postSubtitle').value = post.subtitle || '';
    document.getElementById('postCategory').value = post.category || 'lifestyle';
    document.getElementById('postHot').checked = post.hot || false;
    document.getElementById('postContent').innerHTML = post.content;

    // Handle image - check if it's base64 or URL
    if (post.image && post.image.startsWith('data:image')) {
        // It's an uploaded image (base64)
        uploadedImageData = post.image;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('previewImg').src = post.image;
        document.getElementById('postImage').value = '';
        showImageOption('file');
        document.querySelectorAll('.upload-option-btn')[1].classList.add('active');
        document.querySelectorAll('.upload-option-btn')[0].classList.remove('active');
    } else {
        // It's a URL
        document.getElementById('postImage').value = post.image;
        removeImage();
        showImageOption('url');
        document.querySelectorAll('.upload-option-btn')[0].classList.add('active');
        document.querySelectorAll('.upload-option-btn')[1].classList.remove('active');
    }

    showAdminTab('new-post');
}

function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    let posts = getPosts();
    posts = posts.filter(p => p.id !== postId);
    savePosts(posts);

    // Delete associated comments
    const comments = getComments();
    delete comments[postId];
    saveComments(comments);

    loadAdminPosts();
}

function savePost() {
    const title = document.getElementById('postTitle').value.trim();
    const subtitle = document.getElementById('postSubtitle').value.trim();
    const imageUrl = document.getElementById('postImage').value.trim();
    const category = document.getElementById('postCategory').value;
    const hot = document.getElementById('postHot').checked;
    const content = document.getElementById('postContent').innerHTML.trim();

    if (!title || !subtitle || !content) {
        alert('Please fill in title, subtitle, and content fields.');
        return;
    }

    // Use uploaded image data if available, otherwise use URL
    const finalImage = uploadedImageData || imageUrl || 'https://via.placeholder.com/800x400?text=Blog+Post';

    const posts = getPosts();
    const editingId = currentEditingPostId;

    if (editingId) {
        // Update existing post
        const post = posts.find(p => p.id === editingId);
        if (post) {
            post.title = title;
            post.subtitle = subtitle;
            post.image = finalImage;
            post.category = category;
            post.hot = hot;
            post.content = content;
        }
    } else {
        // Create new post
        posts.push({
            id: Date.now(),
            title: title,
            subtitle: subtitle,
            image: finalImage,
            category: category,
            hot: hot,
            content: content,
            date: new Date().toISOString(),
            publisher: 'Tyler',
            likes: 0
        });
    }

    savePosts(posts);
    cancelEdit();
    showAdminTab('posts');
    alert('✓ Post saved successfully!');
}

function cancelEdit() {
    currentEditingPostId = null;
    document.getElementById('editorTitle').textContent = 'Create New Post';
    document.getElementById('editPostId').value = '';
    document.getElementById('postTitle').value = '';
    document.getElementById('postSubtitle').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postCategory').value = 'lifestyle';
    document.getElementById('postHot').checked = false;
    document.getElementById('postContent').innerHTML = '';

    // Reset image upload
    removeImage();
    showImageOption('url');
    document.querySelectorAll('.upload-option-btn')[0].classList.add('active');
}

// Admin Comments Management
function loadAdminComments() {
    const allComments = getComments();
    const container = document.getElementById('adminCommentsList');
    const posts = getPosts();

    let hasComments = false;
    let html = '';

    for (const [postId, comments] of Object.entries(allComments)) {
        if (comments.length > 0) {
            hasComments = true;
            const post = posts.find(p => p.id === parseInt(postId));
            const postTitle = post ? post.title : 'Deleted Post';

            html += `<div style="margin-bottom: 30px;">
                <h4 style="color: #3b82f6; margin-bottom: 15px; font-family: 'Playfair Display', serif;">📝 ${postTitle}</h4>`;

            comments.forEach(comment => {
                html += `
                    <div class="comment-item" style="margin-bottom: 10px;">
                        <div class="comment-header">
                            <span class="comment-author"><i class="fas fa-user"></i> ${comment.author}</span>
                            <span class="comment-date">${formatDate(comment.date)}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                        <button class="btn-delete" onclick="deleteComment(${postId}, ${comment.id})" style="margin-top: 10px;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `;
            });

            html += '</div>';
        }
    }

    if (!hasComments) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>No comments yet.</p></div>';
    } else {
        container.innerHTML = html;
    }
}

function deleteComment(postId, commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const comments = getComments();
    if (comments[postId]) {
        comments[postId] = comments[postId].filter(c => c.id !== commentId);
        saveComments(comments);
        loadAdminComments();
    }
}

// Admin Subscribers Management
function loadAdminSubscribers() {
    const subscribers = getSubscribers();
    const container = document.getElementById('adminSubscribersList');

    if (subscribers.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No subscribers yet.</p></div>';
        return;
    }

    container.innerHTML = `
        <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 15px; color: white; text-align: center;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 10px;">📊 Subscriber Stats</h3>
            <p style="font-size: 1.5rem; font-weight: 700;">${subscribers.length} Total Subscribers</p>
            <p style="opacity: 0.9;">Weekly Updates: ${subscribers.filter(s => s.weekly).length} | Hot Posts: ${subscribers.filter(s => s.hot).length}</p>
        </div>
        ${subscribers.map(sub => `
            <div class="admin-post-item">
                <div class="admin-post-info">
                    <h4><i class="fas fa-user-circle"></i> ${sub.name}</h4>
                    <p>
                        <i class="fas fa-envelope"></i> ${sub.email} |
                        <i class="fas fa-calendar"></i> Joined ${formatDate(sub.date)}
                        ${sub.weekly ? '<br><i class="fas fa-check-circle" style="color: #10b981;"></i> Weekly updates' : ''}
                        ${sub.hot ? '<br><i class="fas fa-fire" style="color: #f59e0b;"></i> Hot posts notifications' : ''}
                    </p>
                </div>
                <div class="admin-post-actions">
                    <button class="btn-delete" onclick="deleteSubscriber(${sub.id})">
                        <i class="fas fa-user-times"></i> Remove
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function deleteSubscriber(subscriberId) {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;

    let subscribers = getSubscribers();
    subscribers = subscribers.filter(s => s.id !== subscriberId);
    saveSubscribers(subscribers);
    loadAdminSubscribers();
}

// Image Upload Functions
let uploadedImageData = null;

function showImageOption(option, clickedBtn) {
    // Update button states
    document.querySelectorAll('.upload-option-btn').forEach(btn => btn.classList.remove('active'));
    // Use the passed button element if available, otherwise fall back to event.target
    var activeBtn = clickedBtn || (typeof event !== 'undefined' && event && event.target) || null;
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Show selected option
    document.querySelectorAll('.image-option').forEach(opt => opt.classList.remove('active'));
    if (option === 'url') {
        document.getElementById('imageUrlOption').classList.add('active');
    } else {
        document.getElementById('imageFileOption').classList.add('active');
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
        return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        alert('Image size must be less than 5MB. Please choose a smaller file.');
        return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;

        // Show preview
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('previewImg').src = uploadedImageData;

        // Clear URL input if any
        document.getElementById('postImage').value = '';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    uploadedImageData = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImg').src = '';
    document.getElementById('imageFileInput').value = '';
}

// Rich Text Editor
function formatText(command, value = null) {
    document.getElementById('postContent').focus();
    document.execCommand(command, false, value);
}

function insertLink() {
    const url = prompt('Enter the URL:');
    if (url) {
        formatText('createLink', url);
    }
}

// Storage helpers
function getPosts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function getPostById(id) {
    return getPosts().find(p => p.id === id);
}

function getComments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '{}');
}

function saveComments(comments) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
}

function getPostComments(postId) {
    const comments = getComments();
    return comments[postId] || [];
}

function getLikes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || '{}');
}

function getSubscribers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS) || '[]');
}

function saveSubscribers(subscribers) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('shareModal');
    if (event.target.classList.contains('modal-overlay')) {
        closeShareModal();
    }
}

// ============================================
// ANALYTICS SYSTEM
// ============================================

// Track post view
function trackPostView(postId) {
    const views = getViews();
    if (!views[postId]) {
        views[postId] = 0;
    }
    views[postId]++;
    saveViews(views);

    // Add to activity feed
    addActivity('view', postId, 'Post viewed');
}

// Add activity to feed
function addActivity(type, postId, description) {
    const activity = getActivity();
    const post = getPostById(postId);

    if (post) {
        activity.unshift({
            id: Date.now(),
            type: type,
            postId: postId,
            postTitle: post.title,
            description: description,
            timestamp: new Date().toISOString()
        });

        // Keep only last 50 activities
        if (activity.length > 50) {
            activity.splice(50);
        }

        saveActivity(activity);
    }
}

// Load Analytics Dashboard
function loadAnalytics() {
    const posts = getPosts();
    const views = getViews();
    const comments = getComments();
    const subscribers = getSubscribers();

    // Calculate total views
    let totalViews = 0;
    for (const postId in views) {
        totalViews += views[postId];
    }

    // Calculate total likes
    let totalLikes = 0;
    posts.forEach(post => {
        totalLikes += post.likes || 0;
    });

    // Calculate total comments
    let totalComments = 0;
    for (const postId in comments) {
        totalComments += comments[postId].length;
    }

    // Calculate hot posts count
    const hotPostsCount = posts.filter(p => p.hot === true).length;

    // Calculate average views per post
    const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;

    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? Math.round(((totalLikes + totalComments) / totalViews) * 100) : 0;

    // Update overview stats
    document.getElementById('totalViews').textContent = totalViews.toLocaleString();
    document.getElementById('totalPosts').textContent = posts.length;
    document.getElementById('hotPosts').textContent = hotPostsCount;
    document.getElementById('avgViews').textContent = avgViews.toLocaleString();

    // Update engagement stats
    document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
    document.getElementById('totalComments').textContent = totalComments;
    document.getElementById('totalSubscribers').textContent = subscribers.length;
    document.getElementById('engagementRate').textContent = engagementRate + '%';

    // Load top performing posts
    loadTopPosts(posts, views, comments);

    // Load recent activity
    loadRecentActivity();

    // Load views chart
    loadViewsChart(posts, views);
}

// Load top performing posts
function loadTopPosts(posts, views, allComments) {
    // Calculate engagement score for each post
    const postsWithMetrics = posts.map(post => {
        const postViews = views[post.id] || 0;
        const postLikes = post.likes || 0;
        const postComments = allComments[post.id] ? allComments[post.id].length : 0;
        const engagementScore = (postLikes * 2) + (postComments * 3) + postViews;

        return {
            ...post,
            views: postViews,
            commentCount: postComments,
            engagementScore: engagementScore
        };
    });

    // Sort by engagement score
    postsWithMetrics.sort((a, b) => b.engagementScore - a.engagementScore);

    // Take top 5
    const topPosts = postsWithMetrics.slice(0, 5);

    const tableBody = document.getElementById('topPostsTable');
    tableBody.innerHTML = topPosts.map((post, index) => {
        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
        const engagementBadgeClass = post.engagementScore > 100 ? 'badge-high' : post.engagementScore > 50 ? 'badge-medium' : 'badge-low';

        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
                <td><a href="#" onclick="showPostDetail(${post.id}); return false;" class="post-title-link">${post.title}</a></td>
                <td><strong>${post.views.toLocaleString()}</strong></td>
                <td><strong>${post.likes}</strong></td>
                <td><strong>${post.commentCount}</strong></td>
                <td><span class="metric-badge ${engagementBadgeClass}">${post.engagementScore}</span></td>
            </tr>
        `;
    }).join('');
}

// Load recent activity
function loadRecentActivity() {
    const activity = getActivity();
    const recentActivities = activity.slice(0, 10);

    const container = document.getElementById('recentActivity');

    if (recentActivities.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><p>No activity yet.</p></div>';
        return;
    }

    container.innerHTML = recentActivities.map(item => {
        const iconClass = item.type === 'view' ? 'activity-view' :
                         item.type === 'like' ? 'activity-like' :
                         'activity-comment';
        const icon = item.type === 'view' ? 'fa-eye' :
                    item.type === 'like' ? 'fa-heart' :
                    'fa-comment';

        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${item.postTitle}</div>
                    <div class="activity-time">${formatDate(item.timestamp)} - ${item.description}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Load views chart
function loadViewsChart(posts, views) {
    const container = document.getElementById('viewsChart');

    // Get top 6 posts by views
    const postsWithViews = posts.map(post => ({
        ...post,
        views: views[post.id] || 0
    }));

    postsWithViews.sort((a, b) => b.views - a.views);
    const topPosts = postsWithViews.slice(0, 6);

    const maxViews = Math.max(...topPosts.map(p => p.views), 1);

    container.innerHTML = `
        <div class="chart-bar">
            ${topPosts.map(post => {
                const heightPercent = (post.views / maxViews) * 100;
                return `
                    <div class="bar-item">
                        <div class="bar" style="height: ${heightPercent}%;">
                            <div class="bar-value">${post.views}</div>
                        </div>
                        <div class="bar-label" title="${post.title}">${post.title}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Override toggleLike to track activity
const originalToggleLike = toggleLike;
toggleLike = function(postId) {
    const likes = getLikes();
    const userLiked = likes[postId] || false;

    // Call original function
    originalToggleLike(postId);

    // Track activity if user liked (not unliked)
    if (!userLiked) {
        addActivity('like', postId, 'Post liked');
    }
};

// Override addComment to track activity
const originalAddComment = addComment;
addComment = function() {
    // Call original function
    originalAddComment();

    // Track activity
    if (currentPostId) {
        addActivity('comment', currentPostId, 'New comment added');
    }
};

// Storage helpers for analytics
function getViews() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWS) || '{}');
}

function saveViews(views) {
    localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify(views));
}

function getActivity() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
}

function saveActivity(activity) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activity));
}
