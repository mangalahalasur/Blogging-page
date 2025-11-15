// Get DOM elements
const blogForm = document.getElementById('blogForm');
const blogTitleInput = document.getElementById('blogTitle');
const blogContentInput = document.getElementById('blogContent');
const blogsContainer = document.getElementById('blogsContainer');
const jsonDisplay = document.getElementById('jsonDisplay');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const blogCount = document.getElementById('blogCount');
const titleCount = document.getElementById('titleCount');
const contentCount = document.getElementById('contentCount');

// Storage key
const STORAGE_KEY = 'blogs';
let blogs = [];

/**
 * Load blogs from localStorage
 */
function loadBlogs() {
    const storedBlogs = localStorage.getItem(STORAGE_KEY);
    blogs = storedBlogs ? JSON.parse(storedBlogs) : [];
    renderBlogs();
    updateJsonDisplay();
}

/**
 * Save blogs to localStorage
 */
function saveBlogs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
}

/**
 * Create a blog object
 * @param {string} title - Blog title
 * @param {string} content - Blog content
 * @returns {object} - Blog object
 */
function createBlog(title, content) {
    return {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        createdAtFormatted: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
}

/**
 * Render blogs to the page
 */
function renderBlogs() {
    blogCount.textContent = blogs.length;

    if (blogs.length === 0) {
        blogsContainer.innerHTML = '<p class="no-blogs">No posts yet. Create your first blog post!</p>';
        clearAllBtn.style.display = 'none';
    } else {
        blogsContainer.innerHTML = blogs.map(blog => `
            <div class="blog-card">
                <h3 class="blog-title">${escapeHtml(blog.title)}</h3>
                <p class="blog-content">${escapeHtml(blog.content)}</p>
                <div class="blog-meta">
                    <span class="blog-date">📅 ${blog.createdAtFormatted}</span>
                    <div class="blog-actions">
                        <button class="btn-view" onclick="viewBlog(${blog.id})">View</button>
                        <button class="btn-delete" onclick="deleteBlog(${blog.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
        clearAllBtn.style.display = 'block';
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * View full blog post in modal
 * @param {number} blogId - Blog ID
 */
function viewBlog(blogId) {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${escapeHtml(blog.title)}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                ${escapeHtml(blog.content).replace(/\n/g, '<br>')}
            </div>
            <div class="modal-date">
                📅 ${blog.createdAtFormatted}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Delete a blog post
 * @param {number} blogId - Blog ID
 */
function deleteBlog(blogId) {
    if (confirm('Are you sure you want to delete this post?')) {
        blogs = blogs.filter(blog => blog.id !== blogId);
        saveBlogs();
        renderBlogs();
        updateJsonDisplay();
    }
}

/**
 * Delete all blogs
 */
function deleteAllBlogs() {
    if (confirm('Are you sure you want to delete all posts? This cannot be undone.')) {
        blogs = [];
        saveBlogs();
        renderBlogs();
        updateJsonDisplay();
    }
}

/**
 * Update JSON display
 */
function updateJsonDisplay() {
    if (blogs.length === 0) {
        jsonDisplay.innerHTML = '<p class="placeholder">No blogs to export</p>';
        copyJsonBtn.style.display = 'none';
        downloadJsonBtn.style.display = 'none';
    } else {
        const jsonString = JSON.stringify(blogs, null, 2);
        jsonDisplay.innerHTML = `<pre>${escapeHtml(jsonString)}</pre>`;
        copyJsonBtn.style.display = 'inline-block';
        downloadJsonBtn.style.display = 'inline-block';
    }
}

/**
 * Copy JSON to clipboard
 */
copyJsonBtn.addEventListener('click', () => {
    if (blogs.length === 0) return;

    const jsonString = JSON.stringify(blogs, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
        const originalText = copyJsonBtn.textContent;
        copyJsonBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyJsonBtn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        alert('Failed to copy to clipboard');
    });
});

/**
 * Download JSON file
 */
downloadJsonBtn.addEventListener('click', () => {
    if (blogs.length === 0) return;

    const jsonString = JSON.stringify(blogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blogs_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

/**
 * Clear all blogs button
 */
clearAllBtn.addEventListener('click', deleteAllBlogs);

/**
 * Update character count for title
 */
blogTitleInput.addEventListener('input', () => {
    titleCount.textContent = blogTitleInput.value.length;
});

/**
 * Update character count for content
 */
blogContentInput.addEventListener('input', () => {
    contentCount.textContent = blogContentInput.value.length;
});

/**
 * Handle form submission
 */
blogForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = blogTitleInput.value.trim();
    const content = blogContentInput.value.trim();

    // Validate
    if (!title) {
        alert('Please enter a blog title');
        return;
    }

    if (!content) {
        alert('Please enter blog content');
        return;
    }

    // Create new blog
    const newBlog = createBlog(title, content);
    blogs.unshift(newBlog); // Add to beginning

    // Save and update display
    saveBlogs();
    renderBlogs();
    updateJsonDisplay();

    // Clear form
    blogForm.reset();
    titleCount.textContent = '0';
    contentCount.textContent = '0';

    // Show success message
    showNotification('Blog post published successfully!');
});

/**
 * Show notification
 * @param {string} message - Notification message
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00b894 0%, #00a87c 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 184, 148, 0.3);
        z-index: 10000;
        animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Add slide up animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Load blogs on page load
loadBlogs();
