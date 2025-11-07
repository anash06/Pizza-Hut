// Menu CRUD Operations (Manage Menu)

let editingItemId = null;

function loadAdminMenu() {
    const menuItems = getMenuItems();
    const adminMenuList = document.getElementById('adminMenuList');
    
    if (menuItems.length === 0) {
        adminMenuList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No menu items. Add your first item using the form.</p>';
        return;
    }
    
    adminMenuList.innerHTML = menuItems.map(item => `
        <div class="admin-menu-item">
            <img src="${item.image || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(item.name)}" 
                 alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/400x200?text=' + encodeURIComponent('${item.name}')">
            <h4>${item.name}</h4>
            <div class="category">${item.category}</div>
            <div class="price">₹${item.price.toFixed(2)}</div>
            <div class="description">${item.description || 'No description'}</div>
            <div class="admin-menu-actions">
                <button class="btn-edit" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function editMenuItem(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Populate form with item data
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemImage').value = item.image || '';
    
    // Change form title and button
    document.getElementById('formTitle').textContent = 'Edit Item';
    document.getElementById('saveItem').textContent = 'Update Item';
    document.getElementById('cancelEdit').style.display = 'inline-block';
    
    editingItemId = itemId;
    
    // Scroll to form
    document.querySelector('.menu-form-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }
    
    let menuItems = getMenuItems();
    menuItems = menuItems.filter(i => i.id !== itemId);
    saveMenuItems(menuItems);
    
    loadAdminMenu();
    if (typeof loadMenu === 'function') loadMenu(); // Refresh customer menu
    
    showNotification('Menu item deleted successfully!');
}

function cancelEdit() {
    editingItemId = null;
    document.getElementById('menuForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Item';
    document.getElementById('saveItem').textContent = 'Add Item';
    document.getElementById('cancelEdit').style.display = 'none';
}

function saveMenuItem(event) {
    event.preventDefault();
    
    const menuItems = getMenuItems();
    const formData = {
        name: document.getElementById('itemName').value.trim(),
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value.trim(),
        image: document.getElementById('itemImage').value.trim()
    };
    
    // Validation
    if (!formData.name || formData.price <= 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    if (editingItemId) {
        // Update existing item
        const itemIndex = menuItems.findIndex(i => i.id === editingItemId);
        if (itemIndex !== -1) {
            menuItems[itemIndex] = {
                ...menuItems[itemIndex],
                ...formData
            };
            saveMenuItems(menuItems);
            showNotification('Menu item updated successfully!');
        }
    } else {
        // Create new item
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
        const newItem = {
            id: newId,
            ...formData
        };
        menuItems.push(newItem);
        saveMenuItems(menuItems);
        showNotification('Menu item added successfully!');
    }
    
    // Reset form
    cancelEdit();
    
    // Reload menus
    loadAdminMenu();
    if (typeof loadMenu === 'function') loadMenu(); // Refresh customer menu
}

// Initialize form event listeners
document.addEventListener('DOMContentLoaded', () => {
    const menuForm = document.getElementById('menuForm');
    const cancelEditBtn = document.getElementById('cancelEdit');
    
    if (menuForm) {
        menuForm.addEventListener('submit', saveMenuItem);
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEdit);
    }
});

// Make functions globally available
window.loadAdminMenu = loadAdminMenu;
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.cancelEdit = cancelEdit;
window.saveMenuItem = saveMenuItem;


