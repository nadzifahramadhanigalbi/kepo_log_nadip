const SUPABASE_URL = 'https://vlxmpridkwjnljfivpsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseG1wcmlka3dqbmxqZml2cHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODQzODAsImV4cCI6MjA4Njc2MDM4MH0.3uu0G9_T-TaDN0tRL8OfHQzEzu1y2c7g7DkT71Ifq9c'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const articleContainer = document.getElementById('articleContainer');

async function loadArticles() {
    try {
        const { data, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        articleContainer.innerHTML = ''; 

        if (data.length === 0) {
            articleContainer.innerHTML = `
                <div style="text-align: center; color: #94a3b8; padding: 40px; grid-column: 1 / -1;">
                    Belum ada misteri yang terungkap. Tunggu komandan meluncurkan artikel!
                </div>
            `;
            return;
        }

        data.forEach(post => {
            // Membatasi panjang deskripsi agar kartu tetap rapi
            let previewText = post.content.length > 110 
                ? post.content.substring(0, 110) + '...' 
                : post.content;

            const articleHTML = `
                <article class="post">
                    <img src="${post.image_url}" class="post-img" onerror="this.src='https://via.placeholder.com/600x400?text=KepoLog+System'">
                    <div class="post-content-wrapper">
                        <span class="category">${post.category}</span>
                        <h2>${post.title}</h2>
                        <p>${previewText}</p>
                        <a href="post.html?id=${post.id}" class="read-more">Baca selengkapnya →</a>
                    </div>
                </article>
            `;
            articleContainer.insertAdjacentHTML('beforeend', articleHTML);
        });

    } catch (error) {
        console.error('Gagal memuat transmisi:', error);
        articleContainer.innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 40px; grid-column: 1 / -1;">
                <h3>⚠️ Terjadi Gangguan Sinyal</h3>
                <p>Gagal memuat data dari galaksi. Pastikan koneksi aman.</p>
            </div>
        `;
    }
}

loadArticles();