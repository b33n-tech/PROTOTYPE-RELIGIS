/**
 * TELEMETRY.JS
 * Script modulaire de tracking des pages avec Supabase
 */

// 1. Protection contre la redéclaration
if (typeof window.TELEMETRY_CONFIG === 'undefined') {
    window.TELEMETRY_CONFIG = {
        debug: true,
        logTableName: 'logs_website',
    };
}
const TELEMETRY_CONFIG = window.TELEMETRY_CONFIG;

/**
 * Récupère le client Supabase global (sbClient)
 */
function getSupabaseClient() {
    if (typeof window.sbClient === 'undefined') {
        console.error('[TELEMETRY] ❌ Client Supabase global (sbClient) non initialisé.');
        return null;
    }
    return window.sbClient;
}

/**
 * Enregistre un passage utilisateur
 */
async function logPageView(memberId, pageName) {
    if (!memberId || !pageName) {
        console.warn('[TELEMETRY] ❌ memberId ou pageName manquant');
        return false;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const now = new Date();
        const logData = {
            member_id: memberId,
            page: pageName,
            heure: now.toLocaleTimeString('fr-FR'),
            jour: now.toLocaleDateString('fr-FR'),
        };

        if (TELEMETRY_CONFIG.debug) console.log('[TELEMETRY] 📝 Enregistrement:', logData);

        const { error } = await supabase
            .from(TELEMETRY_CONFIG.logTableName)
            .insert([logData]);

        if (error) {
            console.error('[TELEMETRY] ❌ Erreur Supabase:', error.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error('[TELEMETRY] ❌ Exception:', err.message);
        return false;
    }
}

/**
 * Stocke le member_id dans sessionStorage (cohérent avec index.html)
 */
function setMemberId(memberId) {
    try {
        sessionStorage.setItem('user_ref', memberId.toString());
        if (TELEMETRY_CONFIG.debug) console.log('[TELEMETRY] 💾 Member ID stocké dans sessionStorage');
    } catch (err) {
        console.error('[TELEMETRY] ❌ Erreur stockage:', err.message);
    }
}

/**
 * Récupère le member_id depuis sessionStorage
 */
function getMemberId() {
    try {
        const memberId = sessionStorage.getItem('user_ref');
        return memberId ? parseInt(memberId, 10) : null;
    } catch (err) {
        console.warn('[TELEMETRY] ❌ Erreur accès sessionStorage:', err.message);
        return null;
    }
}

/**
 * Efface le member_id
 */
function clearMemberId() {
    sessionStorage.removeItem('user_ref');
}

/**
 * Fonction helper pour tracker la page
 */
async function trackCurrentPage(pageName) {
    const memberId = getMemberId();
    if (!memberId) {
        if (TELEMETRY_CONFIG.debug) {
            console.warn('[TELEMETRY] ⚠️ Pas de member_id. Utilisateur non connecté.');
        }
        return false;
    }
    return await logPageView(memberId, pageName);
}

// Exposition globale
window.logPageView = logPageView;
window.setMemberId = setMemberId;
window.getMemberId = getMemberId;
window.clearMemberId = clearMemberId;
window.trackCurrentPage = trackCurrentPage;

console.log('[TELEMETRY] ✓ Script chargé et prêt.');
