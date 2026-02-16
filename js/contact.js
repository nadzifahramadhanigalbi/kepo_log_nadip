const SUPABASE_URL = 'https://vlxmpridkwjnljfivpsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseG1wcmlka3dqbmxqZml2cHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODQzODAsImV4cCI6MjA4Njc2MDM4MH0.3uu0G9_T-TaDN0tRL8OfHQzEzu1y2c7g7DkT71Ifq9c'; 
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. INISIALISASI EMAILJS
// Masukkan PUBLIC KEY yang kamu temukan di menu Account Settings
emailjs.init("1pCJq5DsZFB67CBnz"); 

const dmForm = document.getElementById('dmForm');
const submitDmBtn = document.getElementById('submitDmBtn');

dmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitDmBtn.textContent = 'Mengirim Sinyal...';
    submitDmBtn.disabled = true;

    const name = document.getElementById('senderName').value;
    const contact = document.getElementById('senderContact').value;
    const message = document.getElementById('messageBody').value;

    try {
        // A. SIMPAN KE DATABASE SUPABASE
        const { error } = await supabaseClient
            .from('messages')
            .insert([{ sender_name: name, sender_contact: contact, message: message }]);

        if (error) throw error;

        // B. KIRIM NOTIFIKASI EMAIL
        // Ganti dengan SERVICE ID dan TEMPLATE ID milikmu
        await emailjs.send("service_0x4jrjj", "template_tpdpxzh", {
            from_name: name,
            reply_to: contact,
            message: message,
        });

        alert('Transmisi berhasil! Pesan tersimpan di Dashboard dan terkirim ke Email Komandan. 🚀');
        dmForm.reset();

    } catch (error) {
        console.error('Gagal mengirim:', error);
        alert('Gagal mengirim sinyal. Pastikan semua ID EmailJS sudah benar.');
    } finally {
        submitDmBtn.textContent = 'Kirim Pesan 📡';
        submitDmBtn.disabled = false;
    }
});