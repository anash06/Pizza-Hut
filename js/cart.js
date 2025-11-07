// Cart Operations and Billing

function loadCart() {
    const cart = getCart();
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        updateBillSummary(0);
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="item-price">₹${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                </div>
                <div class="item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
    
    calculateBill();
}

function increaseQuantity(itemId) {
    let cart = getCart();
    const item = cart.find(c => c.id === itemId);
    if (item) {
        item.quantity += 1;
        saveCart(cart);
        loadCart();
    }
}

function decreaseQuantity(itemId) {
    let cart = getCart();
    const item = cart.find(c => c.id === itemId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCart(cart);
        loadCart();
    }
}

function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(c => c.id !== itemId);
    saveCart(cart);
    loadCart();
}

function calculateBill() {
    const cart = getCart();
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    updateBillSummary(total);
}

function updateBillSummary(total) {
    document.getElementById('grandTotal').textContent = `₹${total.toFixed(2)}`;
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        saveCart([]);
        loadCart();
        showNotification('Cart cleared!');
    }
}

function payNow() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    // Generate QR code with order details
    generateQRCode(cart, total);
}

function confirmPaid() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Confirm payment
    if (!confirm('Confirm payment and complete order?')) {
        return;
    }
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    // Create order record with paid status
    const order = {
        id: 'ORD' + Date.now(),
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString(),
        status: 'paid',
        paymentMethod: 'confirmed'
    };
    
    // Save order to localStorage
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
    
    // Create and save bill
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    const billData = {
        id: Date.now(),
        date: dateStr,
        time: timeStr,
        timestamp: now.toISOString(),
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        status: 'paid'
    };
    
    // Save bill to localStorage
    saveBill(billData);
    
    // Clear cart
    saveCart([]);
    loadCart();
    
    // Clear any current order
    window.currentOrder = null;
    
    showNotification('Payment confirmed! Order completed successfully.');
}

// Get bills from localStorage
function getBills() {
    const bills = localStorage.getItem('bills');
    return bills ? JSON.parse(bills) : [];
}

// Save bill to localStorage
function saveBill(billData) {
    const bills = getBills();
    bills.push(billData);
    localStorage.setItem('bills', JSON.stringify(bills));
}

// Download bill as text file
function downloadBill(billData) {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Create bill text content
    let billText = '================================\n';
    billText += '   Anwar Al Khaleej - Bill\n';
    billText += '================================\n';
    billText += 'Kayalpattinam\n';
    billText += 'Ph No: 7418304663\n';
    billText += '================================\n\n';
    billText += `Date: ${billData.date}\n`;
    billText += `Time: ${billData.time}\n\n`;
    billText += 'Items:\n';
    billText += '--------------------------------\n';
    
    billData.items.forEach(item => {
        billText += `${item.name} x ${item.quantity}\n`;
        billText += `  ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    billText += '\n--------------------------------\n';
    billText += `Total: ₹${billData.total.toFixed(2)}\n`;
    billText += '================================\n';
    billText += 'Thank you for your order!\n';
    
    // Create blob and download
    const blob = new Blob([billText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Bill downloaded successfully!');
}

function printBill() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    // Prepare print content
    const printContent = document.getElementById('printBillContent');
    const billDate = document.getElementById('billDate');
    const billItems = document.getElementById('printBillItems');
    const billTotals = document.getElementById('printBillTotals');
    
    if (!printContent || !billDate || !billItems || !billTotals) {
        alert('Print bill elements not found!');
        return;
    }
    
    // Set date
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    billDate.textContent = `Date: ${dateStr} ${timeStr}`;
    
    // Set items
    billItems.innerHTML = cart.map(item => `
        <div class="bill-item-row">
            <div>
                <strong>${item.name}</strong> x ${item.quantity}
            </div>
            <div>₹${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    // Set totals
    billTotals.innerHTML = `
        <div class="bill-total-row total">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
    `;
    
    // Create bill data object
    const billData = {
        id: Date.now(),
        date: dateStr,
        time: timeStr,
        timestamp: now.toISOString(),
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total
    };
    
    // Save bill to localStorage
    saveBill(billData);
    
    // Download bill automatically
    downloadBill(billData);
    
    // Show print section
    printContent.style.display = 'block';
    
    // Function to hide print content after printing
    const hidePrintContent = () => {
        printContent.style.display = 'none';
        window.removeEventListener('afterprint', hidePrintContent);
    };
    
    // Listen for afterprint event (when print dialog is closed)
    window.addEventListener('afterprint', hidePrintContent);
    
    // Trigger print dialog
    window.print();
    
    // Fallback: hide after a delay if afterprint event doesn't fire (some browsers)
    setTimeout(() => {
        if (printContent.style.display === 'block') {
            printContent.style.display = 'none';
        }
    }, 1000);
}

// Initialize cart event listeners
document.addEventListener('DOMContentLoaded', () => {
    const clearCartBtn = document.getElementById('clearCart');
    const paidBtn = document.getElementById('paidBtn');
    const printBillBtn = document.getElementById('printBill');
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    if (paidBtn) {
        paidBtn.addEventListener('click', confirmPaid);
    }
    
    if (printBillBtn) {
        printBillBtn.addEventListener('click', printBill);
    }
});

// Make functions globally available
window.loadCart = loadCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.payNow = payNow;
window.confirmPaid = confirmPaid;
window.printBill = printBill;
window.calculateBill = calculateBill;
window.getBills = getBills;
window.saveBill = saveBill;
window.downloadBill = downloadBill;

