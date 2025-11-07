// Daily Sales Report Functionality (up to 6 months)

// Get reports from localStorage
function getSavedReports() {
    const reports = localStorage.getItem('savedReports');
    return reports ? JSON.parse(reports) : [];
}

// Save report to localStorage
function saveReport(reportData) {
    const reports = getSavedReports();
    reports.push(reportData);
    localStorage.setItem('savedReports', JSON.stringify(reports));
}

function loadReports() {
    const selectedDate = document.getElementById('reportDate').value;
    const orders = getOrders();
    
    if (!selectedDate) {
        const currentDate = new Date().toISOString().slice(0, 10);
        document.getElementById('reportDate').value = currentDate;
        filterAndDisplayReports(currentDate, orders);
        return;
    }
    
    filterAndDisplayReports(selectedDate, orders);
}

function filterAndDisplayReports(selectedDate, orders) {
    // Calculate date range: selected date to 6 months back
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999); // End of selected day
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0); // Start of day 6 months ago
    
    // Filter orders within the 6-month range
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Group orders by date and track item sales
    const dailyData = {};
    filteredOrders.forEach(order => {
        const orderDate = new Date(order.timestamp);
        const dateKey = orderDate.toISOString().slice(0, 10); // YYYY-MM-DD format
        const dateDisplay = orderDate.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                date: dateDisplay,
                dateKey: dateKey,
                orders: [],
                totalSales: 0,
                orderCount: 0,
                itemSales: {} // Track items sold: {itemName: {quantity, revenue}}
            };
        }
        
        dailyData[dateKey].orders.push(order);
        dailyData[dateKey].totalSales += order.total;
        dailyData[dateKey].orderCount += 1;
        
        // Track item sales for this day
        order.items.forEach(item => {
            if (!dailyData[dateKey].itemSales[item.name]) {
                dailyData[dateKey].itemSales[item.name] = {
                    quantity: 0,
                    revenue: 0
                };
            }
            dailyData[dateKey].itemSales[item.name].quantity += item.quantity;
            dailyData[dateKey].itemSales[item.name].revenue += item.price * item.quantity;
        });
    });
    
    // Convert to array and sort by date (newest first)
    const dailyReports = Object.values(dailyData).sort((a, b) => {
        return new Date(b.dateKey) - new Date(a.dateKey);
    });
    
    // Calculate overall statistics
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Create report data object for saving
    const reportData = {
        id: Date.now(),
        selectedDate: selectedDate,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dailyReports: dailyReports,
        totalSales: totalSales,
        totalOrders: totalOrders,
        avgOrderValue: avgOrderValue,
        generatedAt: new Date().toISOString()
    };
    
    // Save report to localStorage
    saveReport(reportData);
    
    // Store current report data globally for PDF download
    window.currentReportData = reportData;
    
    // Update summary cards
    document.getElementById('totalSales').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('avgOrderValue').textContent = `₹${avgOrderValue.toFixed(2)}`;
    
    // Display daily reports table
    const tableBody = document.getElementById('reportTableBody');
    
    if (dailyReports.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #999;">
                    No orders found for the selected period (last 6 months).
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = dailyReports.map((day, index) => {
        const avgOrderValue = day.orderCount > 0 ? day.totalSales / day.orderCount : 0;
        
        // Convert itemSales object to array and sort by revenue (descending)
        const itemSalesArray = Object.entries(day.itemSales || {})
            .map(([name, data]) => ({
                name,
                quantity: data.quantity,
                revenue: data.revenue
            }))
            .sort((a, b) => b.revenue - a.revenue);
        
        // Create item sales HTML
        const itemSalesHTML = itemSalesArray.length > 0
            ? itemSalesArray.map(item => `
                <div class="item-sale-row">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">Qty: ${item.quantity}</span>
                    <span class="item-revenue">₹${item.revenue.toFixed(2)}</span>
                </div>
            `).join('')
            : '<div class="item-sale-row">No items sold</div>';
        
        return `
            <tr class="daily-report-row" data-day-index="${index}">
                <td>
                    <strong>${day.date}</strong>
                    <button class="toggle-items-btn" onclick="toggleDayItems(${index})" data-expanded="false">
                        <span class="toggle-icon">▼</span> Items
                    </button>
                </td>
                <td>${day.orderCount}</td>
                <td><strong>₹${day.totalSales.toFixed(2)}</strong></td>
                <td>₹${avgOrderValue.toFixed(2)}</td>
            </tr>
            <tr class="item-details-row" id="day-items-${index}" style="display: none;">
                <td colspan="4">
                    <div class="item-sales-container">
                        <h4>Items Sold:</h4>
                        <div class="item-sales-list">
                            ${itemSalesHTML}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Download report as PDF
function downloadReportPDF() {
    if (!window.currentReportData) {
        alert('Please generate a report first!');
        return;
    }
    
    const reportData = window.currentReportData;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.text('Anwar Al Khaleej', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Daily Sales Report', 105, 28, { align: 'center' });
    doc.text('Kayalpattinam | Ph No: 7418304663', 105, 35, { align: 'center' });
    
    // Report period
    doc.setFontSize(10);
    const startDateStr = new Date(reportData.startDate).toLocaleDateString('en-IN');
    const endDateStr = new Date(reportData.endDate).toLocaleDateString('en-IN');
    doc.text(`Period: ${startDateStr} to ${endDateStr}`, 105, 42, { align: 'center' });
    doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString('en-IN')}`, 105, 48, { align: 'center' });
    
    // Summary section
    let yPos = 58;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Sales: ₹${reportData.totalSales.toFixed(2)}`, 14, yPos);
    yPos += 6;
    doc.text(`Total Orders: ${reportData.totalOrders}`, 14, yPos);
    yPos += 6;
    doc.text(`Average Order Value: ₹${reportData.avgOrderValue.toFixed(2)}`, 14, yPos);
    yPos += 10;
    
    // Daily report table
    if (reportData.dailyReports.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Daily Breakdown', 14, yPos);
        yPos += 8;
        
        // Table headers
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Date', 14, yPos);
        doc.text('Orders', 80, yPos);
        doc.text('Total Sales', 120, yPos);
        doc.text('Avg Order', 170, yPos);
        yPos += 6;
        
        // Draw line under header
        doc.line(14, yPos - 2, 196, yPos - 2);
        yPos += 2;
        
        // Table rows
        doc.setFont('helvetica', 'normal');
        reportData.dailyReports.forEach(day => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            const avgOrderValue = day.orderCount > 0 ? day.totalSales / day.orderCount : 0;
            doc.setFontSize(9);
            doc.text(day.date, 14, yPos);
            doc.text(day.orderCount.toString(), 80, yPos);
            doc.text(`₹${day.totalSales.toFixed(2)}`, 120, yPos);
            doc.text(`₹${avgOrderValue.toFixed(2)}`, 170, yPos);
            yPos += 6;
            
            // Add item sales details if available
            if (day.itemSales && Object.keys(day.itemSales).length > 0) {
                const itemSalesArray = Object.entries(day.itemSales)
                    .map(([name, data]) => ({
                        name,
                        quantity: data.quantity,
                        revenue: data.revenue
                    }))
                    .sort((a, b) => b.revenue - a.revenue);
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                itemSalesArray.forEach(item => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    const itemText = `  • ${item.name}: ${item.quantity}x (₹${item.revenue.toFixed(2)})`;
                    // Check if text fits on line, wrap if needed
                    if (itemText.length > 50) {
                        const wrappedText = doc.splitTextToSize(itemText, 180);
                        doc.text(wrappedText, 16, yPos);
                        yPos += (wrappedText.length * 4);
                    } else {
                        doc.text(itemText, 16, yPos);
                        yPos += 4;
                    }
                });
                yPos += 2; // Extra space after items
                doc.setFont('helvetica', 'normal');
            }
        });
    } else {
        doc.setFontSize(10);
        doc.text('No orders found for the selected period.', 14, yPos);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }
    
    // Generate filename
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `Sales_Report_${dateStr}.pdf`;
    
    // Save PDF
    doc.save(filename);
    
    showNotification('Report downloaded as PDF successfully!');
}

// Initialize report event listeners
document.addEventListener('DOMContentLoaded', () => {
    const reportDate = document.getElementById('reportDate');
    const generateReportBtn = document.getElementById('generateReport');
    const downloadPDFBtn = document.getElementById('downloadPDF');
    
    // Set current date as default
    const currentDate = new Date().toISOString().slice(0, 10);
    if (reportDate) {
        reportDate.value = currentDate;
        // Set max date to today
        reportDate.max = currentDate;
    }
    
    if (reportDate) {
        reportDate.addEventListener('change', loadReports);
    }
    
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', loadReports);
    }
    
    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener('click', downloadReportPDF);
    }
    
    // Load initial report
    loadReports();
});

// Toggle item details for a specific day
function toggleDayItems(dayIndex) {
    const itemRow = document.getElementById(`day-items-${dayIndex}`);
    const toggleBtn = document.querySelector(`[onclick="toggleDayItems(${dayIndex})"]`);
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');
    
    if (itemRow.style.display === 'none') {
        itemRow.style.display = 'table-row';
        toggleIcon.textContent = '▲';
        toggleBtn.setAttribute('data-expanded', 'true');
    } else {
        itemRow.style.display = 'none';
        toggleIcon.textContent = '▼';
        toggleBtn.setAttribute('data-expanded', 'false');
    }
}

// Make functions globally available
window.loadReports = loadReports;
window.downloadReportPDF = downloadReportPDF;
window.getSavedReports = getSavedReports;
window.saveReport = saveReport;
window.toggleDayItems = toggleDayItems;


