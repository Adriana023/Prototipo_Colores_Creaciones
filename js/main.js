/* ==========================================
   LÓGICA PRINCIPAL - COLORES Y CREACIONES
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Cargar productos sincronizados si existe el contenedor
    if (document.getElementById("gridProductosIndex")) {
        cargarProductosTienda("gridProductosIndex");
    } else if (document.getElementById("contenedor-productos")) {
        cargarProductosTienda("contenedor-productos");
    }

    // 2. Interacción para seleccionar métodos de pago en la pasarela de envíos
    const paymentCards = document.querySelectorAll(".payment-method-card");
    const paymentBox = document.getElementById("payment-details-box");

    if (paymentCards.length > 0 && paymentBox) {
        paymentCards.forEach(card => {
            card.addEventListener("click", function () {
                paymentCards.forEach(c => c.classList.remove("active"));
                this.classList.add("active");

                const method = this.getAttribute("data-method");
                if (method === "yape") {
                    paymentBox.innerHTML = "📲 Escanea el código QR de Yape/Plin al número <strong>+51 987 654 321</strong> a nombre de Vajillas y Chaskas.";
                } else if (method === "tarjeta") {
                    paymentBox.innerHTML = "💳 Ingresa los datos de tu tarjeta de crédito o débito de forma segura (Visa, Mastercard, Amex).";
                } else if (method === "transferencia") {
                    paymentBox.innerHTML = "🏦 Cuenta BCP Soles: <strong>193-98765432-0-11</strong><br>CCI: 002-1931098765432011-14";
                }
            });
        });
    }

    // 3. Formulario de envío
    const form = document.getElementById("checkout-form");
    const confirmationBox = document.getElementById("confirmation-message-box");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            const nombre = document.getElementById("input-nombre").value.trim();
            const telefono = document.getElementById("input-telefono").value.trim();
            const correo = document.getElementById("input-correo").value.trim();
            const direccion = document.getElementById("input-direccion").value.trim();
            const checkActivar = document.getElementById("check-activar");

            if (!nombre || !telefono || !correo || !direccion) {
                alert("Por favor, completa todos los campos obligatorios (*) antes de realizar el pago.");
                return;
            }

            if (checkActivar && !checkActivar.checked) {
                alert("Debes marcar la casilla para activar y aceptar los términos del pago y envío.");
                return;
            }

            if (confirmationBox) {
                confirmationBox.innerHTML = `
                    <div class="alert alert-success shadow-sm p-3 mt-3">
                        <h5 class="alert-heading fw-bold">🎉 ¡Pago y Pedido Activado y Aceptado!</h5>
                        <p class="mb-1 small">Estimado/a <strong>${nombre}</strong>, tu orden se ha procesado exitosamente.</p>
                        <hr class="my-2">
                        <p class="mb-0 extra-small text-muted">Hemos enviado los detalles de seguimiento a: <strong>${correo}</strong>.</p>
                    </div>
                `;
                confirmationBox.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Carga dinámica de productos con control de vacíos y stock
function cargarProductosTienda(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    let productos = JSON.parse(localStorage.getItem('listaProductosAdmin')) || [
        { nombre: "Plato Llano Artesanal", categoria: "Vajilla Unitaria", precio: "45.00", stock: 10, imagen: "assets/plato.jpg" },
        { nombre: "Juego Dúo Azul Cobalto", categoria: "Juegos", precio: "240.00", stock: 5, imagen: "assets/juego-duo.jpg" }
    ];

    contenedor.innerHTML = '';

    // Manejo de estado vacío
    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5 mb-0">Por el momento no hay productos disponibles en el catálogo.</p>
                <small class="text-secondary">Agrega nuevos productos desde el panel de administración.</small>
            </div>
        `;
        return;
    }

    productos.forEach((prod, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-3 mb-4';
        
        const rutaImagen = prod.imagen ? prod.imagen : 'assets/placeholder.jpg';
        const precioNum = parseFloat(prod.precio || 0).toFixed(2);
        const stockActual = prod.stock !== undefined ? parseInt(prod.stock) : 10;
        const estaAgotado = stockActual <= 0;

        col.innerHTML = `
            <div class="card border-0 shadow-sm h-100">
                <img src="${rutaImagen}" class="card-img-top object-fit-cover" style="height: 180px;" alt="${prod.nombre}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Vajilla+Artesanal';">
                <div class="card-body text-center p-3 d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="card-title fw-bold fs-6 mt-1">${prod.nombre}</h5>
                        <p class="card-text text-muted small mb-1">${prod.categoria}</p>
                        <span class="badge ${estaAgotado ? 'bg-danger' : 'bg-light text-dark'} mb-2">
                            ${estaAgotado ? 'Agotado' : 'Stock: ' + stockActual}
                        </span>
                        <h6 class="fw-bold text-success mb-3">S/ ${precioNum}</h6>
                    </div>
                    <div>
                        <a href="detalle.html" class="btn btn-outline-dark btn-sm w-100 mb-2">Ver detalle &rarr;</a>
                        <button onclick="comprarProducto(${index})" 
                                class="btn ${estaAgotado ? 'btn-secondary disabled' : 'btn-custom-orange text-white'} btn-sm w-100" 
                                ${estaAgotado ? 'disabled' : ''}>
                            ${estaAgotado ? 'Sin stock' : 'Comprar / Pedir'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

// Procesa el pedido y descuenta 1 unidad del inventario del Admin
function comprarProducto(indexProducto) {
    let productos = JSON.parse(localStorage.getItem('listaProductosAdmin')) || [];
    let pedidos = JSON.parse(localStorage.getItem('listaPedidosAdmin')) || [];

    if (!productos[indexProducto]) return;

    let prod = productos[indexProducto];
    let stockActual = prod.stock !== undefined ? parseInt(prod.stock) : 10;

    if (stockActual <= 0) {
        alert("Lo sentimos, este producto se encuentra agotado.");
        return;
    }

    // Descontar stock en el inventario del Admin
    productos[indexProducto].stock = stockActual - 1;
    localStorage.setItem('listaProductosAdmin', JSON.stringify(productos));

    // Crear el nuevo pedido
    const nuevoPedido = {
        cliente: "Cliente Tienda Web",
        producto: prod.nombre,
        precio: prod.precio,
        fecha: new Date().toLocaleDateString(),
        estado: "Pendiente"
    };

    pedidos.push(nuevoPedido);
    localStorage.setItem('listaPedidosAdmin', JSON.stringify(pedidos));

    alert(`¡Pedido de "${prod.nombre}" registrado con éxito! Se descontó 1 unidad del stock.`);
    window.location.href = "envio.html";
}