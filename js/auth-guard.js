// Verificar si existe sesión activa al cargar páginas protegidas
(function verificarSesion() {
    const sesion = localStorage.getItem('userSession');
    // Si no hay sesión y no estamos en la página de login, redirigir a login
    if (!sesion && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
})();

// Función global para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('userSession');
    alert('Sesión cerrada correctamente.');
    window.location.href = 'login.html';
}