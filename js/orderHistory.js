// Order History Functionality

function loadOrderHistory() {
    const orders = getOrders();
    const historyList = document.getElementById('historyList');
    const dateFilter = document.getElementById('historyDateFilter').value;
    
    // Filter orders by date if filter is set
    let filteredOrders = orders;
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filterDate.setHours(0, 0, 0, 0);
        const filterDateEnd = new Date(filterDate);
        filterDateEnd.setHours(23, 59, 59, 999);
        
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate >= filterDate && orderDate <= filterDateEnd;
        });
    }
    
    // Sort orders by date (newest first)
    filteredOrders.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Calculate summary
    const totalOrders = filteredOrders.length;
    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Update summary
    document.getElementById('historyTotalOrders').textContent = totalOrders;
    document.getElementById('historyTotalAmount').textContent = `₹${totalAmount.toFixed(2)}`;
    
    // Display orders
    if (filteredOrders.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <p>No orders found${dateFilter ? ' for the selected date' : ''}.</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = filteredOrders.map(order => {
        const orderDate = new Date(order.timestamp);
        const dateStr = orderDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const timeStr = orderDate.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const itemsList = order.items.map(item => 
            `${item.name} (${item.quantity}x)`
        ).join(', ');
        
        const statusBadge = order.status === 'paid' 
            ? '<span class="status-badge paid">Paid</span>' 
            : '<span class="status-badge pending">Pending</span>';
        
        return `
            <div class="history-order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order.id}</h3>
                        <p class="order-date">${dateStr} at ${timeStr}</p>
                    </div>
                    ${statusBadge}
                </div>
                <div class="order-items">
                    <p><strong>Items:</strong> ${itemsList}</p>
                </div>
                <div class="order-footer">
                    <div class="order-total">
                        <strong>Total: ₹${order.total.toFixed(2)}</strong>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${order.id}')">View Details</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewOrderDetails(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    const orderDate = new Date(order.timestamp);
    const dateStr = orderDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = orderDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let details = `Order Details\n`;
    details += `===========\n\n`;
    details += `Order ID: ${order.id}\n`;
    details += `Date: ${dateStr}\n`;
    details += `Time: ${timeStr}\n`;
    details += `Status: ${order.status || 'N/A'}\n`;
    details += `Payment Method: ${order.paymentMethod || 'N/A'}\n\n`;
    details += `Items:\n`;
    details += `------\n`;
    
    order.items.forEach(item => {
        details += `${item.name} x ${item.quantity}\n`;
        details += `  Price: ₹${item.price.toFixed(2)} each\n`;
        details += `  Subtotal: ₹${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    details += `Total: ₹${order.total.toFixed(2)}\n`;
    
    alert(details);
}

function clearHistoryFilter() {
    document.getElementById('historyDateFilter').value = '';
    loadOrderHistory();
}

// Initialize order history event listeners
document.addEventListener('DOMContentLoaded', () => {
    const historyDateFilter = document.getElementById('historyDateFilter');
    const clearHistoryFilterBtn = document.getElementById('clearHistoryFilter');
    const refreshHistoryBtn = document.getElementById('refreshHistory');
    
    if (historyDateFilter) {
        historyDateFilter.addEventListener('change', loadOrderHistory);
        // Set max date to today
        historyDateFilter.max = new Date().toISOString().slice(0, 10);
    }
    
    if (clearHistoryFilterBtn) {
        clearHistoryFilterBtn.addEventListener('click', clearHistoryFilter);
    }
    
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', loadOrderHistory);
    }
    
    // Load initial history
    loadOrderHistory();
});

// Make functions globally available
window.loadOrderHistory = loadOrderHistory;
window.viewOrderDetails = viewOrderDetails;
window.clearHistoryFilter = clearHistoryFilter;

