/* ==========================================
   LÓGICA GENERAL - PANEL DE ADMINISTRACIÓN
   ========================================== */

/**
 * Cierra la sesión del administrador limpiando el almacenamiento local
 * y redirigiendo a la pantalla de acceso.
 */
function cerrarSesion() {
    localStorage.removeItem('adminLogueado');
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'login.html';
}

/**
 * Función auxiliar para verificar elementos cargados en el DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel de administración Vajillas y Chaskas inicializado correctamente.');
});