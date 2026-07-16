/**
 * TELEMETRY.JS
 * Script modulaire de tracking des pages avec Supabase
 * Logs les passages utilisateurs dans la table logs_website
 * 
 * ===== ARCHITECTURE =====
 * Ce script NE crée PAS son propre client Supabase.
 * Il s'appuie sur 'sbClient' global initialisé par la page principale (ex: login.html)
 */

// Configuration du tracking
const TELEMETRY_CONFIG = {
  debug: true, // true = affiche logs console, false = silent
  logTableName: 'logs_website',
};

/**
 * Récupère le client Supabase global
 * @returns {Object|null} Le client Supabase ou null s'il n'existe pas
 */
function getSupabaseClient() {
  if (typeof sbClient === 'undefined') {
    console.error('[TELEMETRY] ❌ Client Supabase global (sbClient) non initialisé. Vérifiez que la page parent le définit.');
    return null;
  }
  return sbClient;
}

/**
 * FONCTION PRINCIPALE : Enregistre un passage utilisateur
 * @param {number} memberId - ID du membre (depuis members_website)
 * @param {string} pageName - Nom de la page (ex: 'dashboard', 'wiki', 'frazer', 'librairie')
 * @returns {Promise<boolean>} true si succès, false sinon
 */
async function logPageView(memberId, pageName) {
  // Validation des paramètres
  if (!memberId || !pageName) {
    console.warn('[TELEMETRY] ❌ Erreur: memberId ou pageName manquant', {
      memberId,
      pageName,
    });
    return false;
  }

  // Récupère le client global
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  try {
    // Récupère l'heure et le jour actuels au format français
    const now = new Date();
    const heure = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const jour = now.toLocaleDateString('fr-FR');

    // Prépare les données pour Supabase
    const logData = {
      member_id: memberId,
      page: pageName,
      heure: heure,
      jour: jour,
    };

    if (TELEMETRY_CONFIG.debug) {
      console.log('[TELEMETRY] 📝 Enregistrement:', logData);
    }

    // Insère dans la table logs_website
    const { data, error } = await supabase
      .from(TELEMETRY_CONFIG.logTableName)
      .insert([logData]);

    if (error) {
      console.error('[TELEMETRY] ❌ Erreur Supabase:', error.message);
      return false;
    }

    if (TELEMETRY_CONFIG.debug) {
      console.log('[TELEMETRY] ✅ Enregistré avec succès');
    }

    return true;
  } catch (err) {
    console.error('[TELEMETRY] ❌ Exception:', err.message);
    return false;
  }
}

/**
 * Stocke le member_id après connexion (à appeler depuis index.html)
 * @param {number} memberId - ID du membre à stocker
 */
function setMemberId(memberId) {
  try {
    localStorage.setItem('member_id', memberId.toString());
    if (TELEMETRY_CONFIG.debug) {
      console.log('[TELEMETRY] 💾 Member ID stocké:', memberId);
    }
  } catch (err) {
    console.error('[TELEMETRY] ❌ Erreur stockage member_id:', err.message);
  }
}

/**
 * Récupère le member_id du localStorage
 * @returns {number|null} Le member_id ou null si non trouvé
 */
function getMemberId() {
  try {
    const memberId = localStorage.getItem('member_id');
    return memberId ? parseInt(memberId, 10) : null;
  } catch (err) {
    console.warn('[TELEMETRY] ❌ Erreur accès localStorage:', err.message);
    return null;
  }
}

/**
 * Efface le member_id (à appeler au logout)
 */
function clearMemberId() {
  try {
    localStorage.removeItem('member_id');
    if (TELEMETRY_CONFIG.debug) {
      console.log('[TELEMETRY] 🗑️ Member ID effacé');
    }
  } catch (err) {
    console.error('[TELEMETRY] ❌ Erreur suppression member_id:', err.message);
  }
}

/**
 * Fonction helper pour tracker la page actuelle
 * Récupère automatiquement le member_id du localStorage
 * @param {string} pageName - Nom de la page actuelle
 * @returns {Promise<boolean>}
 */
async function trackCurrentPage(pageName) {
  const memberId = getMemberId();

  if (!memberId) {
    if (TELEMETRY_CONFIG.debug) {
      console.warn(
        '[TELEMETRY] ⚠️ Pas de member_id. L\'utilisateur n\'est pas connecté.'
      );
    }
    return false;
  }

  return await logPageView(memberId, pageName);
}

// Expose les fonctions globalement
window.logPageView = logPageView;
window.setMemberId = setMemberId;
window.getMemberId = getMemberId;
window.clearMemberId = clearMemberId;
window.trackCurrentPage = trackCurrentPage;

console.log('[TELEMETRY] ✓ Script chargé et prêt (utilise sbClient global)');
