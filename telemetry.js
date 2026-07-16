// ===========================
// TELEMETRY MODULE
// ===========================
// Module modulaire pour tracker les visites des pages
// Schéma logs_website: id (auto), member_id, page, heure, jour

(async function() {
    'use strict';

    // Configuration Supabase
    const SUPABASE_URL = 'https://rkxaprpcetborlslblqj.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_NpdAjISRkvlmuO6cY3xljA_79dxiqkZ';

    // Initialisation du client Supabase
    let sbClient = null;

    function initSupabaseClient() {
        try {
            if (typeof supabase === 'undefined') {
                console.error('[TELEMETRY] Supabase n\'est pas chargé');
                return false;
            }
            sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('[TELEMETRY] Client Supabase initialisé');
            return true;
        } catch (error) {
            console.error('[TELEMETRY] Erreur initialisation Supabase:', error);
            return false;
        }
    }

    // Obtenir le nom de la page actuelle
    function getCurrentPageName() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    // Récupérer le member_id du sessionStorage
    function getMemberId() {
        const userRef = sessionStorage.getItem('user_ref');
        return userRef;
    }

    // Enregistrer une visite
    async function logPageVisit() {
        try {
            const memberId = getMemberId();
            const pageName = getCurrentPageName();

            // Ne logger que si on a un member_id
            if (!memberId) {
                console.log('[TELEMETRY] Pas de member_id - visite non loggée (invité ou session vide)');
                return;
            }

            const now = new Date();
            const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const jour = now.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });

            console.log(`[TELEMETRY] Enregistrement de la visite: member_id=${memberId}, page=${pageName}, heure=${heure}, jour=${jour}`);

            const { data, error } = await sbClient
                .from('logs_website')
                .insert([
                    {
                        member_id: memberId,
                        page: pageName,
                        heure: heure,
                        jour: jour
                    }
                ]);

            if (error) {
                console.error('[TELEMETRY] Erreur lors de l\'enregistrement:', error);
            } else {
                console.log('[TELEMETRY] Visite enregistrée avec succès');
            }

        } catch (err) {
            console.error('[TELEMETRY] Exception lors du logging:', err);
        }
    }

    // Initialisation au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('[TELEMETRY] DOM chargé, initialisation du module');
            if (initSupabaseClient()) {
                await logPageVisit();
            }
        });
    } else {
        console.log('[TELEMETRY] DOM déjà chargé, initialisation immédiate du module');
        if (initSupabaseClient()) {
            await logPageVisit();
        }
    }

})();
