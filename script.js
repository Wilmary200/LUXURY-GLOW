// Obtener Referencias del DOM (sin cambios)
const productsContainer = document.getElementById('products-container');
const cartCountSpan = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const paymentForm = document.getElementById('payment-form');
const paymentTotalSpan = document.getElementById('payment-total');

// Estado del Carrito y Producto Seleccionado
let cart = JSON.parse(localStorage.getItem('shopMasterCart')) || [];
let selectedProduct = null;

// --- Funciones de Utilidad (sin cambios) ---

function updateCart() {
    localStorage.setItem('shopMasterCart', JSON.stringify(cart));
    renderCart();
}

const formatCurrency = (price) => `$${price.toFixed(2)}`;

// Alerta (usando clases de Bootstrap nativas para simplicidad)
function showAlert(message, type = 'success') {
    const alertPlaceholder = document.querySelector('main.container');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show fixed-top-alert mt-5" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    const style = document.createElement('style');
    style.innerHTML = '.fixed-top-alert { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1050; width: 90%; max-width: 500px; }';
    document.head.appendChild(style);

    alertPlaceholder.prepend(wrapper);
    setTimeout(() => wrapper.remove(), 3000);
}

// --- Renderizado de Productos (Ajuste de clases CSS) ---

async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        productsContainer.innerHTML = '<p class="text-danger text-center">Lo sentimos, no pudimos cargar los productos. Inténtalo más tarde.</p>';
    }
}

function renderProducts(products) {
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const cardHtml = `
            <div class="col">
                <div class="card product-card">
                    <div class="card-img-container">
                        <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="fs-4 fw-bold text-primary-light-text">${formatCurrency(product.price)}</p>
                        <button class="btn btn-primary-light w-100 mt-2 view-more-btn" data-bs-toggle="modal" data-bs-target="#productModal" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i> Ver más
                        </button>
                    </div>
                </div>
            </div>
        `;
        productsContainer.innerHTML += cardHtml;
    });

    document.querySelectorAll('.view-more-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.productId);
            displayProductModal(productId, products); 
        });
    });
}

// --- Lógica del Modal (Ajuste de clases CSS en Modal) ---

function displayProductModal(id, products) {
    selectedProduct = products.find(p => p.id === id);

    if (!selectedProduct) return;

    document.getElementById('modal-product-image').src = selectedProduct.image;
    document.getElementById('modal-product-title').textContent = selectedProduct.title;
    document.getElementById('modal-product-category').textContent = selectedProduct.category;
    document.getElementById('modal-product-description').textContent = selectedProduct.description;
    // Usando clase de texto Secundaria de color Malva Suave
    document.getElementById('modal-product-price').textContent = formatCurrency(selectedProduct.price);
    document.getElementById('modal-product-quantity').value = 1; 
}

document.getElementById('add-to-cart-modal-btn').addEventListener('click', () => {
    if (!selectedProduct) return;

    const quantity = parseInt(document.getElementById('modal-product-quantity').value);
    
    addToCart(selectedProduct, quantity);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modal.hide();

    showAlert(`Producto agregado al carrito (${quantity} unidad(es)) 🛍️`, 'success');
});

// --- Lógica del Carrito (sin cambios funcionales) ---

function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    updateCart();
}

function updateItemQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        } else {
            removeItem(id);
        }
        updateCart();
    }
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    showAlert('Producto eliminado del carrito 🗑️', 'warning');
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-muted">Tu carrito está vacío.</p>';
        checkoutBtn.disabled = true;
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemHtml = `
                <div class="d-flex align-items-center cart-item">
                    <img src="${item.image}" class="cart-item-img" alt="${item.title}">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.title}</h6>
                        <small class="text-muted">${formatCurrency(item.price)} c/u</small>
                    </div>
                    <div class="d-flex flex-column align-items-end">
                        <p class="fw-bold mb-1 text-secondary-light-text">${formatCurrency(itemTotal)}</p>
                        <div class="input-group input-group-sm mb-1" style="width: 100px;">
                            <button class="btn btn-outline-secondary btn-decrement" type="button" data-id="${item.id}">-</button>
                            <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                            <button class="btn btn-outline-secondary btn-increment" type="button" data-id="${item.id}">+</button>
                        </div>
                        <button class="btn btn-sm btn-danger btn-remove" data-id="${item.id}">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHtml;
        });

        checkoutBtn.disabled = false;
    }

    cartTotalSpan.textContent = formatCurrency(total);
    paymentTotalSpan.textContent = formatCurrency(total);
    cartCountSpan.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Re-asignar eventos a los botones
    document.querySelectorAll('.btn-increment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const item = cart.find(i => i.id === id);
            updateItemQuantity(id, item.quantity + 1);
        });
    });
    document.querySelectorAll('.btn-decrement').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const item = cart.find(i => i.id === id);
            updateItemQuantity(id, item.quantity - 1);
        });
    });
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            removeItem(id);
        });
    });
}

// --- Pasarela de Pago y Generación de PDF (sin cambios funcionales) ---

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!document.getElementById('fullName').value || !document.getElementById('cardNumber').value) {
        showAlert('Por favor, complete todos los campos de pago.', 'danger');
        return;
    }
    
    const fullName = document.getElementById('fullName').value;
    const purchaseItems = [...cart]; 

    const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    modal.hide();

    // Nombre de la tienda actualizado a ShopMaster en el PDF
    generateReceiptPDF(fullName, purchaseItems); 

    cart = [];
    updateCart();

    showAlert('¡Pago exitoso! Se ha generado tu ticket de compra. ✅', 'success');
});


function generateReceiptPDF(customerName, items) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [80, 150] 
    });
    
    let y = 10;
    const margin = 5;
    const lineSpacing = 4;
    let finalTotal = 0;
    
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    
    // --- Cabecera (Nombre de la tienda: ShopMaster) ---
    doc.text('======================================', margin, y);
    y += lineSpacing;
    doc.setFontSize(11);
    doc.text('S H O P M A S T E R', 40, y, null, null, 'center'); 
    y += lineSpacing;
    doc.setFontSize(9);
    doc.text('Tienda Ficticia - Recibo de Compra', 40, y, null, null, 'center');
    y += lineSpacing;
    doc.text('======================================', margin, y);
    y += lineSpacing * 1.5;

    // --- Información de la Transacción ---
    const now = new Date();
    doc.text(`Fecha: ${now.toLocaleDateString()}`, margin, y);
    doc.text(`Hora: ${now.toLocaleTimeString()}`, 80 - margin, y, null, null, 'right');
    y += lineSpacing;
    doc.text(`Cliente: ${customerName}`, margin, y);
    y += lineSpacing * 1.5;

    // --- Detalle de Productos ---
    doc.text('--------------------------------------', margin, y);
    y += lineSpacing;
    doc.text('DESCRIPCION', margin, y);
    doc.text('CANT', 55, y);
    doc.text('PRECIO', 80 - margin, y, null, null, 'right');
    y += lineSpacing;
    doc.text('--------------------------------------', margin, y);
    y += lineSpacing;

    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        finalTotal += itemTotal;
        
        let title = item.title;
        if (title.length > 25) {
            title = title.substring(0, 25) + '...';
        }
        
        doc.text(title, margin, y);
        doc.text(item.quantity.toString(), 55, y);
        doc.text(formatCurrency(itemTotal), 80 - margin, y, null, null, 'right');
        y += lineSpacing;

        doc.setFontSize(8);
        doc.text(`@ ${formatCurrency(item.price)}`, margin + 3, y);
        doc.setFontSize(9);
        y += lineSpacing;
    });

    // --- Total y Pie de Página ---
    doc.text('--------------------------------------', margin, y);
    y += lineSpacing * 1.5;
    
    doc.setFontSize(12);
    doc.text('TOTAL A PAGAR:', margin, y);
    doc.text(formatCurrency(finalTotal), 80 - margin, y, null, null, 'right');
    y += lineSpacing * 2;

    doc.setFontSize(9);
    doc.text('======================================', margin, y);
    y += lineSpacing;
    doc.text('GRACIAS POR SU COMPRA. VUELVA PRONTO.', 40, y, null, null, 'center');
    y += lineSpacing;
    doc.text('======================================', margin, y);

    if (y > 140) {
        doc.setPageSize(80, y + 10);
    }

    doc.save('ticket_shopmaster.pdf');
}


// --- INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    renderCart();
});