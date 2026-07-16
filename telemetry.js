/**
 * telemetry.js
 * Script de télémétrie autonome.
 */

(async function() {
    // --- CONFIGURATION À REMPLACER ---
    const SUPABASE_URL = 'https://rkxaprpcetborlslblqj.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_NpdAjISRkvlmuO6cY3xljA_79dxiqkZ';
    // ---------------------------------

    // Initialisation locale de Supabase
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Vérification de l'utilisateur
    const memberId = localStorage.getItem('current_member_id');
    if (!memberId) return;

    // 2. Détermination de la page
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1) || "index.html";

    // 3. Préparation des données temporelles
    const now = new Date();
    const heure = now.toTimeString().split(' ')[0];
    const jour = now.toISOString().split('T')[0];

    // 4. Envoi vers Supabase
    try {
        await supabase
            .from('logs_website')
            .insert([{ 
                member_id: parseInt(memberId), 
                page: pageName, 
                heure: heure, 
                jour: jour 
            }]);
    } catch (err) {
        console.error("Erreur télémétrie:", err);
    }
})();
