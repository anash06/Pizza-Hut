// Main Application Initialization and Navigation

// Initialize default menu items if localStorage is empty
function initializeDefaultMenu() {
    const menuItems = getMenuItems();
    if (menuItems.length === 0) {
        const defaultMenu = [
            {
                id: 1,
                name: "Margherita Pizza",
                category: "Pizza",
                price: 299,
                description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
                image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"
            },
            {
                id: 2,
                name: "Pepperoni Pizza",
                category: "Pizza",
                price: 349,
                description: "Delicious pizza topped with pepperoni and cheese",
                image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400"
            },
            {
                id: 3,
                name: "Classic Burger",
                category: "Burger",
                price: 199,
                description: "Juicy beef patty with fresh vegetables and special sauce",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
            },
            {
                id: 4,
                name: "Cheese Burger",
                category: "Burger",
                price: 229,
                description: "Classic burger with melted cheese and crispy vegetables",
                image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400"
            },
            {
                id: 5,
                name: "Grilled Sandwich",
                category: "Sandwich",
                price: 149,
                description: "Toasted bread with vegetables and cheese",
                image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400"
            },
            {
                id: 6,
                name: "Club Sandwich",
                category: "Sandwich",
                price: 179,
                description: "Triple-decker sandwich with chicken, bacon, and vegetables",
                image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400"
            },
            {
                id: 7,
                name: "Chicken Tandoori",
                category: "Tandoori",
                price: 399,
                description: "Spicy marinated chicken cooked in tandoor",
                image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"
            },
            {
                id: 8,
                name: "Tandoori Platter",
                category: "Tandoori",
                price: 599,
                description: "Mixed tandoori platter with chicken, fish, and vegetables",
                image: "https://images.unsplash.com/photo-1609501676725-7186f3a1f4f9?w=400"
            }
        ];
        localStorage.setItem('menuItems', JSON.stringify(defaultMenu));
    }
}

// Get menu items from localStorage
function getMenuItems() {
    const items = localStorage.getItem('menuItems');
    return items ? JSON.parse(items) : [];
}

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Get orders from localStorage
function getOrders() {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
}

// Save to localStorage
function saveMenuItems(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Navigation handling
function initNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Refresh the active tab content
            refreshActiveTab(targetTab);
        });
    });
}

// Refresh content based on active tab
function refreshActiveTab(tab) {
    switch(tab) {
        case 'menu':
            if (typeof loadMenu === 'function') loadMenu();
            break;
        case 'cart':
            if (typeof loadCart === 'function') loadCart();
            break;
        case 'history':
            if (typeof loadOrderHistory === 'function') loadOrderHistory();
            break;
        case 'manage':
            if (typeof loadAdminMenu === 'function') loadAdminMenu();
            break;
        case 'reports':
            if (typeof loadReports === 'function') {
                const currentDate = new Date().toISOString().slice(0, 10);
                const reportDate = document.getElementById('reportDate');
                if (reportDate) {
                    reportDate.value = currentDate;
                }
                loadReports();
            }
            break;
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultMenu();
    initNavigation();
    
    // Load initial menu
    if (typeof loadMenu === 'function') loadMenu();
    if (typeof loadCart === 'function') loadCart();
    if (typeof loadAdminMenu === 'function') loadAdminMenu();
});

// Export functions for use in other modules
window.getMenuItems = getMenuItems;
window.getCart = getCart;
window.getOrders = getOrders;
window.saveMenuItems = saveMenuItems;
window.saveCart = saveCart;
window.saveOrders = saveOrders;
window.refreshActiveTab = refreshActiveTab;


