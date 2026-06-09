const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

// Store orders in memory (will reset on server restart)
let orders = [];

// ============================================
// API ROUTES
// ============================================

// Get all orders
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Get single order by tracking number
app.get('/api/orders/:orderNumber', (req, res) => {
    const order = orders.find(o => o.orderNumber === req.params.orderNumber);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
});

// Create new order
app.post('/api/orders', (req, res) => {
    const { orderNumber, customerName, customerPhone, deliveryAddress, items, totalAmount, paymentMethod } = req.body;
    
    if (!orderNumber || !customerName || !customerPhone || !deliveryAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newOrder = {
        orderNumber: orderNumber,
        customerName: customerName,
        customerPhone: customerPhone,
        deliveryAddress: deliveryAddress,
        specialInstructions: req.body.specialInstructions || '',
        items: items || [],
        totalAmount: totalAmount || 0,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    console.log('✅ Order created:', orderNumber);
    res.json({ success: true, orderNumber: orderNumber });
});

// Update order status
app.put('/api/orders/:orderNumber/status', (req, res) => {
    const { orderNumber } = req.params;
    const { status } = req.body;
    
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    console.log(`✅ Order ${orderNumber} status updated to: ${status}`);
    res.json({ success: true, status: status });
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const out_for_delivery = orders.filter(o => o.status === 'out_for_delivery').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    res.json({
        total_orders: total,
        pending: pending,
        confirmed: confirmed,
        preparing: preparing,
        out_for_delivery: out_for_delivery,
        delivered: delivered,
        total_revenue: revenue
    });
});

// ============================================
// HTML PAGE ROUTES
// ============================================

// Serve HTML files directly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/order.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'order.html'));
});

app.get('/admin-orders.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-orders.html'));
});

app.get('/track-order.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'track-order.html'));
});

app.get('/services.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/event.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'event.html'));
});

app.get('/outdoor.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'outdoor.html'));
});

app.get('/reservation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'reservation.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Order page: https://top-chef-eateries-production.up.railway.app/order.html`);
    console.log(`👨‍💼 Admin page: https://top-chef-eateries-production.up.railway.app/admin-orders.html`);
    console.log(`🔍 Track page: https://top-chef-eateries-production.up.railway.app/track-order.html`);
});
