// GANTI DENGAN URL DAN ANON KEY DARI PROJECT SUPABASE KAMU
const SUPABASE_URL = 'https://vlxmpridkwjnljfivpsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseG1wcmlka3dqbmxqZml2cHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODQzODAsImV4cCI6MjA4Njc2MDM4MH0.3uu0G9_T-TaDN0tRL8OfHQzEzu1y2c7g7DkT71Ifq9c'; 

// KITA GUNAKAN NAMA 'supabaseClient' SECARA KONSISTEN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elemen DOM
const postsBody = document.getElementById('postsBody');
const addPostForm = document.getElementById('addPostForm');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');
const messagesBody = document.getElementById('messagesBody');

// ==========================================
// 1. SISTEM PROTEKSI HALAMAN (ROUTE PROTECTION)
// ==========================================
async function enforceAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    // Jika tidak ada session (belum login), tendang kembali ke login.html
    if (!session || error) {
        window.location.replace('login.html');
    } else {
        // Jika login berhasil, baru jalankan penarikan data
        fetchPosts();
        fetchMessages();
    }
}

// ==========================================
// 2. SISTEM LOGOUT
// ==========================================
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault(); 
        
        const originalText = logoutBtn.innerHTML;
        logoutBtn.innerHTML = 'Memproses...';
        logoutBtn.disabled = true;

        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            window.location.replace('login.html');
        } catch (error) {
            console.error('Gagal logout:', error);
            alert('Gagal keluar dari sistem.');
            logoutBtn.innerHTML = originalText;
            logoutBtn.disabled = false;
        }
    });
}

// ==========================================
// 3. FUNGSI MENGAMBIL DATA ARTIKEL (READ)
// ==========================================
async function fetchPosts() {
    try {
        const { data, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        postsBody.innerHTML = ''; 

        if (data.length === 0) {
            postsBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada artikel.</td></tr>';
            return;
        }

        data.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString('id-ID');
            const row = `
                <tr>
                    <td style="font-weight: bold;">${post.title}</td>
                    <td><span class="badge">${post.category}</span></td>
                    <td style="color: #94a3b8;">${date}</td>
                    <td>
                        <button onclick="deletePost(${post.id})" style="background:transparent; border:none; color:#ef4444; cursor:pointer;">Hapus</button>
                    </td>
                </tr>
            `;
            postsBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Gagal mengambil data:', error);
    }
}

// ==========================================
// 4. FUNGSI MENAMBAH ARTIKEL (CREATE)
// ==========================================
if (addPostForm) {
    addPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.textContent = 'Mempersiapkan Peluncuran...';
        submitBtn.disabled = true;

        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const imageUrl = document.getElementById('imageUrl').value;
        const content = document.getElementById('content').value;

        try {
            const { error } = await supabaseClient
                .from('posts')
                .insert([{ title, category, image_url: imageUrl, content }]);

            if (error) throw error;

            alert('Artikel berhasil diluncurkan ke galaksi!');
            addPostForm.reset();
            fetchPosts(); 
        } catch (error) {
            console.error('Gagal menyimpan:', error);
            alert('Terjadi kesalahan saat menyimpan data.');
        } finally {
            submitBtn.textContent = 'Luncurkan Artikel 🚀';
            submitBtn.disabled = false;
        }
    });
}

// ==========================================
// 5. FITUR KOTAK MASUK (DIRECT MESSAGES)
// ==========================================
async function fetchMessages() {
    if (!messagesBody) return;

    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        messagesBody.innerHTML = '';

        if (data.length === 0) {
            messagesBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Radar bersih. Belum ada pesan masuk.</td></tr>';
            return;
        }

        data.forEach(msg => {
            const statusColor = msg.needs_reply ? '#ef4444' : '#10b981';
            const statusText = msg.needs_reply ? 'Perlu Dijawab 🔴' : 'Tuntas ✅';
            const toggleAction = msg.needs_reply ? 'Tandai Selesai' : 'Tandai Perlu Balas';

            const row = `
                <tr style="background: rgba(0,0,0,0.2);">
                    <td style="font-weight: bold;">${msg.sender_name}</td>
                    <td style="color: #a5b4fc;">${msg.sender_contact}</td>
                    <td style="max-width: 250px; padding-right: 20px;">${msg.message}</td>
                    <td style="color: ${statusColor}; font-weight: bold; font-size: 0.8rem;">${statusText}</td>
                    <td>
                        <div style="display: flex; gap: 5px; flex-direction: column;">
                            <button onclick="toggleMessageStatus(${msg.id}, ${msg.needs_reply})" style="background: #334155; border: none; color: white; padding: 5px; border-radius: 5px; cursor: pointer; font-size: 0.7rem;">${toggleAction}</button>
                            <button onclick="deleteMessage(${msg.id})" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 5px; border-radius: 5px; cursor: pointer; font-size: 0.7rem;">Hapus</button>
                        </div>
                    </td>
                </tr>
            `;
            messagesBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Gagal mengambil pesan:', error);
    }
}

// ==========================================
// 6. GLOBAL FUNCTIONS (BISA DIAKSES ONCLICK)
// ==========================================

// Hapus Artikel
window.deletePost = async function(id) {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
        const { error } = await supabaseClient.from('posts').delete().eq('id', id);
        if (!error) fetchPosts();
    }
};

// Ganti Status Pesan
window.toggleMessageStatus = async function(id, currentStatus) {
    const { error } = await supabaseClient
        .from('messages')
        .update({ needs_reply: !currentStatus })
        .eq('id', id);
    if (!error) fetchMessages();
};

// Hapus Pesan
window.deleteMessage = async function(id) {
    if (confirm('Hapus transmisi ini?')) {
        const { error } = await supabaseClient.from('messages').delete().eq('id', id);
        if (!error) fetchMessages();
    }
};

// JALANKAN PROTEKSI (Yang akan memicu fetch data jika aman)
enforceAuth();