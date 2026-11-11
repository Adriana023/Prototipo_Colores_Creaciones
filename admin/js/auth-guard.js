/* ==========================================
   GUARDIA DE AUTENTICACIÓN - PANEL ADMIN
   ========================================== */

// Verifica si el usuario actual está autenticado como administrador
(function verificarSesionAdmin() {
    const adminLogueado = localStorage.getItem('adminLogueado');
    
    // Obtenemos el nombre del archivo actual para evitar bucles en el login
    const rutaActual = window.location.pathname;
    const esLogin = rutaActual.includes('login.html');

    // Si no está logueado y no está en la página de login, redirigir al login
    if (!adminLogueado && !esLogin) {
        window.location.href = 'login.html';
    }
})();