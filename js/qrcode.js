// Dynamic QR Code Generation for Payments

// UPI Configuration - Update these with your UPI details
const UPI_CONFIG = {
    upiId: 'your-upi-id@paytm', // Replace with your UPI ID
    merchantName: 'Anwar Al Khaleej',
    upiImageUrl: 'upiqr.jpeg' // Path to your UPI QR code image (optional)
};

function generateQRCode(cart, grandTotal) {
    // Create order details string
    const orderDetails = {
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: grandTotal,
        timestamp: new Date().toISOString(),
        orderId: 'ORD' + Date.now()
    };
    
    // Display modal
    const modal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrCodeContainer');
    const qrAmount = document.getElementById('qrAmount');
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Set amount
    qrAmount.textContent = `₹${grandTotal.toFixed(2)}`;
    
    // Display UPI ID
    const upiIdDisplay = document.getElementById('upiIdDisplay');
    if (upiIdDisplay) {
        upiIdDisplay.textContent = `UPI ID: ${UPI_CONFIG.upiId}`;
    }
    
    // Option 1: Display UPI QR Code Image (if image exists)
    if (UPI_CONFIG.upiImageUrl) {
        const img = document.createElement('img');
        img.src = UPI_CONFIG.upiImageUrl;
        img.alt = 'UPI QR Code';
        img.style.maxWidth = '300px';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.border = '5px solid #f0f0f0';
        img.style.borderRadius = '10px';
        img.onerror = function() {
            // If image fails to load, generate UPI payment QR code
            generateUPIQRCode(cart, grandTotal, qrContainer, modal);
        };
        img.onload = function() {
            qrContainer.appendChild(img);
            modal.style.display = 'block';
        };
    } else {
        // Option 2: Generate UPI Payment QR Code dynamically
        generateUPIQRCode(cart, grandTotal, qrContainer, modal);
    }
    
    // Store order details for later use (when payment is confirmed)
    window.currentOrder = orderDetails;
}

function generateUPIQRCode(cart, grandTotal, qrContainer, modal) {
    // Generate UPI payment string
    // Format: upi://pay?pa=UPI_ID&pn=MERCHANT_NAME&am=AMOUNT&cu=INR
    const upiString = `upi://pay?pa=${UPI_CONFIG.upiId}&pn=${encodeURIComponent(UPI_CONFIG.merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR`;
    
    // Generate QR code with UPI payment string
    QRCode.toCanvas(qrContainer, upiString, {
        width: 300,
        height: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function (error) {
        if (error) {
            console.error('QR Code generation error:', error);
            // Fallback: Show UPI ID as text
            qrContainer.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Scan to Pay</p>
                    <p style="font-size: 16px; color: #667eea; margin-bottom: 20px;">${UPI_CONFIG.upiId}</p>
                    <p style="font-size: 14px; color: #666;">Amount: ₹${grandTotal.toFixed(2)}</p>
                    <p style="font-size: 12px; color: #999; margin-top: 10px;">Or manually enter UPI ID in your payment app</p>
                </div>
            `;
        }
        // Show modal
        modal.style.display = 'block';
    });
}

// Close modal when clicking X
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('qrModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            // After QR is shown, complete the order
            completeOrder();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            completeOrder();
        }
    });
});

function completeOrder() {
    if (!window.currentOrder) return;
    
    const cart = getCart();
    if (cart.length === 0) return;
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    // Create order record
    const order = {
        id: window.currentOrder.orderId,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };
    
    // Save order to localStorage
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
    
    // Clear cart
    saveCart([]);
    loadCart();
    
    // Clear current order
    window.currentOrder = null;
    
    showNotification('Order completed! Thank you for your payment.');
}

// Make function globally available
window.generateQRCode = generateQRCode;

