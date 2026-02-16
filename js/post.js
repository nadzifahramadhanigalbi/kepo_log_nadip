// === KREDENSIAL SUPABASE ===
const SUPABASE_URL = 'https://vlxmpridkwjnljfivpsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseG1wcmlka3dqbmxqZml2cHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODQzODAsImV4cCI6MjA4Njc2MDM4MH0.3uu0G9_T-TaDN0tRL8OfHQzEzu1y2c7g7DkT71Ifq9c'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// ==========================================
// 1. FUNGSI LOAD ARTIKEL
// ==========================================
async function loadSinglePost() {
    const loading = document.getElementById('loadingState');
    const container = document.getElementById('postContainer');
    const interaction = document.getElementById('interactionArea');

    if (!postId) { window.location.replace('explore.html'); return; }

    try {
        const { data, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) throw error;

        document.title = `${data.title} - KepoLog`;
        
        if (document.getElementById('postImage')) {
            document.getElementById('postImage').src = data.image_url || 'https://via.placeholder.com/800x400?text=Sinyal+Gambar+Terputus';
            document.getElementById('postImage').onerror = function() {
                this.src = 'https://via.placeholder.com/800x400?text=Gambar+Galat';
            };
        }

        if (document.getElementById('postCategory')) document.getElementById('postCategory').textContent = data.category;
        if (document.getElementById('postTitle')) document.getElementById('postTitle').textContent = data.title;
        
        if (document.getElementById('publishDate')) {
            const dateStr = new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('publishDate').textContent = dateStr;
        }

       if (document.getElementById('postBody')) {
            const paragraphs = data.content.split('\n').filter(p => p.trim() !== '');
            // Ubah 25px menjadi 12px agar jarak antar paragraf lebih rapat
            document.getElementById('postBody').innerHTML = paragraphs.map(p => `<p style="margin-bottom: 12px;">${p}</p>`).join('');
        }

        if (loading) loading.style.setProperty('display', 'none', 'important');
        if (container) container.style.setProperty('display', 'block', 'important');
        if (interaction) interaction.style.setProperty('display', 'block', 'important');

        loadComments();
        updateReactionUI();

    } catch (err) {
        console.error("Misi Gagal:", err);
        if (loading) loading.innerHTML = `<h2 style="color:#ef4444;">⚠️ Sinyal Terputus</h2><p>Misteri tidak ditemukan.</p><a href="explore.html" style="color:#a5b4fc;">Balik ke Galaksi</a>`;
    }
}

// ==========================================
// 2. SISTEM KOMENTAR (REAL-TIME COUNT)
// ==========================================
async function loadComments() {
    const list = document.getElementById('commentsList');
    const countDisplay = document.getElementById('commentCount');
    if (!list) return;

    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Update jumlah komentar di Summary Bar atas
        if (countDisplay) countDisplay.textContent = data.length;

        list.innerHTML = data.length === 0 
            ? '<p style="color:#64748b; text-align:center;">Belum ada teori masuk. Jadilah yang pertama!</p>'
            : data.map(c => `
                <div class="comment-card-slim">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong style="color: #a5b4fc; font-size: 0.85rem;">@${c.sender_name}</strong>
                        <small style="color: #475569; font-size:0.7rem;">${new Date(c.created_at).toLocaleDateString('id-ID')}</small>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; margin:0;">${c.comment_text}</p>
                </div>
            `).join('');
    } catch (e) {
        console.error("Gagal tangkap komentar:", e);
    }
}

const submitBtn = document.getElementById('submitComment');
if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
        const nameInput = document.getElementById('commenterName');
        const textInput = document.getElementById('commenterText');

        if (!nameInput.value || !textInput.value) return alert("Identitas dan teori wajib diisi, Komandan!");

        submitBtn.disabled = true;
        submitBtn.textContent = 'MENGIRIM SINYAL...';

        const { error } = await supabaseClient
            .from('comments')
            .insert([{ post_id: postId, sender_name: nameInput.value, comment_text: textInput.value }]);

        if (!error) {
            textInput.value = ''; 
            loadComments();
        } else {
            alert("Gagal mengirim transmisi.");
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'KIRIM SINYAL 📡';
    });
}

// ==========================================
// 3. SISTEM MULTI-REAKSI + JUMLAH SIMULASI
// ==========================================
const reactionTypes = {
    like: { icon: '👍', text: 'Suka', color: '#6366f1' },
    love: { icon: '❤️', text: 'Super', color: '#ef4444' },
    haha: { icon: '😂', text: 'Haha', color: '#f59e0b' },
    wow: { icon: '😲', text: 'Wow', color: '#10b981' },
    sad: { icon: '😢', text: 'Sedih', color: '#3b82f6' }
};

let currentReaction = localStorage.getItem(`reaction_${postId}`);

// Trik Simulasi Jumlah: Buat angka acak untuk artikel ini dan simpan, agar tidak berubah saat di-refresh.
let baseReactionCount = parseInt(localStorage.getItem(`total_reaction_${postId}`)) || Math.floor(Math.random() * 40) + 5;
localStorage.setItem(`total_reaction_${postId}`, baseReactionCount); 

function updateReactionUI() {
    const btnIcon = document.getElementById('likeIcon');
    const btnText = document.getElementById('likeText');
    const summaryIcons = document.getElementById('summaryIcons');
    const summaryCount = document.getElementById('summaryCount');
    
    if (!btnIcon || !btnText) return;

    // 1. Update Tampilan Tombol Utama
    if (currentReaction && reactionTypes[currentReaction]) {
        btnIcon.textContent = reactionTypes[currentReaction].icon;
        btnText.textContent = reactionTypes[currentReaction].text;
        btnText.style.color = reactionTypes[currentReaction].color;
    } else {
        btnIcon.textContent = '🤍';
        btnText.textContent = 'Suka';
        btnText.style.color = '#94a3b8';
    }

    // 2. Update Angka Jumlah (Simulasi Base + Pilihan User)
    if (summaryCount) {
        let total = baseReactionCount + (currentReaction ? 1 : 0);
        summaryCount.textContent = total;
    }

    // 3. Update Ikon Tumpuk (Mewakili Reaksi Terbanyak)
    if (summaryIcons) {
        let displayIcons = '👍❤️'; // Standar
        if (currentReaction === 'haha') displayIcons = '😂👍';
        if (currentReaction === 'wow')  displayIcons = '😲❤️';
        if (currentReaction === 'sad')  displayIcons = '😢👍';
        if (currentReaction === 'love') displayIcons = '❤️👍';
        summaryIcons.textContent = displayIcons;
    }
}

// Event Pop-up Emoji
document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedReaction = btn.getAttribute('data-reaction');
        
        currentReaction = (currentReaction === selectedReaction) ? null : selectedReaction;
        localStorage.setItem(`reaction_${postId}`, currentReaction || '');
        updateReactionUI();
    });
});

// Default Like saat klik teks "Suka"
const mainLikeBtn = document.getElementById('likeBtn');
if (mainLikeBtn) {
    mainLikeBtn.addEventListener('click', () => {
        currentReaction = currentReaction ? null : 'like';
        localStorage.setItem(`reaction_${postId}`, currentReaction || '');
        updateReactionUI();
    });
}

// Jalankan Sistem
loadSinglePost();