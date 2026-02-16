// GANTI DENGAN URL DAN ANON KEY SUPABASE KAMU
const SUPABASE_URL = 'https://vlxmpridkwjnljfivpsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseG1wcmlka3dqbmxqZml2cHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODQzODAsImV4cCI6MjA4Njc2MDM4MH0.3uu0G9_T-TaDN0tRL8OfHQzEzu1y2c7g7DkT71Ifq9c'; 

// PERBAIKAN: Ubah nama variabel dari 'supabase' menjadi 'supabaseClient'
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

async function checkSession() {
    // Gunakan supabaseClient di sini
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.replace('dashboard.html');
    }
}
checkSession();

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    loginBtn.textContent = 'Memverifikasi Sistem...';
    loginBtn.disabled = true;
    errorMsg.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Gunakan supabaseClient di sini
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Login sukses!
        window.location.replace('dashboard.html');

    } catch (error) {
        console.error('Login gagal:', error);
        errorMsg.style.display = 'block';
        loginBtn.textContent = 'Buka Gerbang 🚀';
        loginBtn.disabled = false;
    }
});