// Menu Display and Item Management

function loadMenu() {
    const menuItems = getMenuItems();
    const menuGrid = document.getElementById('menuGrid');
    
    if (menuItems.length === 0) {
        menuGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No menu items available. Add items in Manage Menu section.</p>';
        return;
    }
    
    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-item" onclick="addToCart(${item.id})">
            <img src="${item.image || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(item.name)}" 
                 alt="${item.name}" 
                 onerror="this.src='https://via.placeholder.com/400x200?text=' + encodeURIComponent('${item.name}')">
            <div class="menu-item-info">
                <h3>${item.name}</h3>
                <div class="category">${item.category}</div>
                <div class="description">${item.description || 'Delicious food item'}</div>
                <div class="price">₹${item.price.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function addToCart(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    let cart = getCart();
    const existingItem = cart.find(c => c.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    
    // Show notification
    showNotification(`${item.name} added to cart!`);
    
    // Update cart display if cart tab is active
    const cartTab = document.getElementById('cart');
    if (cartTab.classList.contains('active')) {
        loadCart();
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Make functions globally available
window.loadMenu = loadMenu;
window.addToCart = addToCart;
window.showNotification = showNotification;

