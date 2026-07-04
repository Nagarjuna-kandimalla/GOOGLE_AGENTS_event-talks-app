document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const spinner = document.getElementById('spinner');
    const notesContainer = document.getElementById('notes-container');
    const feedStatus = document.getElementById('feed-status');
    
    // Tweet modal elements
    const tweetModal = document.getElementById('tweet-modal');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCount = document.getElementById('char-count');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelTweetBtn = document.getElementById('cancel-tweet-btn');
    const submitTweetBtn = document.getElementById('submit-tweet-btn');

    let currentNotes = [];

    // Helper to format date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }

    // Strip HTML to get plain text
    function stripHtml(htmlStr) {
        const temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        return temp.textContent || temp.innerText || "";
    }

    // Fetch notes from Flask API
    async function fetchReleaseNotes() {
        // Start spinning
        spinner.classList.add('spinning');
        refreshBtn.disabled = true;
        feedStatus.classList.remove('hidden');
        notesContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/release-notes');
            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                currentNotes = result.data;
                renderNotes(currentNotes);
            } else {
                showError(result.message || 'Failed to retrieve release notes.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showError('Could not connect to the server.');
        } finally {
            // Stop spinning
            spinner.classList.remove('spinning');
            refreshBtn.disabled = false;
            feedStatus.classList.add('hidden');
            notesContainer.classList.remove('hidden');
        }
    }

    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        if (notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="note-card" style="text-align: center; padding: 3rem 1.5rem;">
                    <i class="fa-solid fa-circle-info" style="font-size: 2.5rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No release notes found.</p>
                </div>
            `;
            return;
        }

        notes.forEach((note, index) => {
            const card = document.createElement('div');
            card.className = 'note-card';
            
            const formattedDate = formatDate(note.updated);
            
            card.innerHTML = `
                <div class="note-header">
                    <h2 class="note-title">${note.title}</h2>
                    <span class="note-date">${formattedDate}</span>
                </div>
                <div class="note-body">
                    ${note.content}
                </div>
                <div class="note-actions">
                    <button class="btn btn-secondary share-tweet-btn" data-index="${index}">
                        <i class="fa-brands fa-x-twitter"></i> Tweet Update
                    </button>
                </div>
            `;
            notesContainer.appendChild(card);
        });

        // Add event listeners for tweet buttons
        document.querySelectorAll('.share-tweet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                prepareTweet(index);
            });
        });
    }

    function showError(message) {
        notesContainer.innerHTML = `
            <div class="note-card" style="border-color: rgba(239, 68, 68, 0.4); text-align: center; padding: 3rem 1.5rem;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h3 style="color: #ffffff; margin-bottom: 0.5rem;">Error Loading Notes</h3>
                <p style="color: var(--text-secondary);">${message}</p>
            </div>
        `;
        notesContainer.classList.remove('hidden');
    }

    // Tweet preparation
    function prepareTweet(index) {
        const note = currentNotes[index];
        if (!note) return;

        const plainContent = stripHtml(note.content).trim();
        
        // Build draft tweet: Title + snippet
        // Max 280 chars
        const hashtag = " #BigQuery #GoogleCloud";
        const link = note.link ? ` ${note.link}` : '';
        const overhead = hashtag.length + link.length + 5; // spacing & punctuation
        
        let draftText = `${note.title}: `;
        const maxSnippetLen = 280 - draftText.length - overhead;
        
        let snippet = plainContent;
        if (snippet.length > maxSnippetLen) {
            snippet = snippet.substring(0, maxSnippetLen - 3) + '...';
        }
        
        draftText += `"${snippet}"${link}${hashtag}`;
        
        tweetTextarea.value = draftText;
        updateCharCount();
        
        // Show modal
        tweetModal.classList.remove('hidden');
    }

    function updateCharCount() {
        const len = tweetTextarea.value.length;
        charCount.textContent = len;
        if (len > 280) {
            charCount.parentElement.classList.add('warning');
        } else {
            charCount.parentElement.classList.remove('warning');
        }
    }

    // Close modal helper
    function closeModal() {
        tweetModal.classList.add('hidden');
    }

    // Modal event listeners
    closeModalBtn.addEventListener('click', closeModal);
    cancelTweetBtn.addEventListener('click', closeModal);
    
    tweetTextarea.addEventListener('input', updateCharCount);

    submitTweetBtn.addEventListener('click', () => {
        const text = tweetTextarea.value;
        const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterIntentUrl, '_blank', 'noopener,noreferrer');
        closeModal();
    });

    // Handle background click on modal to close
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);

    // Initial Fetch
    refreshBtn.addEventListener('click', fetchReleaseNotes);
    fetchReleaseNotes();
});
