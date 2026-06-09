const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (simple array for orders)
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
    
    // Validate
    if (!orderNumber || !customerName || !customerPhone || !deliveryAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newOrder = {
        id: orders.length + 1,
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        special_instructions: req.body.specialInstructions || '',
        items: items || [],
        total_amount: totalAmount || 0,
        payment_method: paymentMethod || 'Cash on Delivery',
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    orders.push(newOrder);
    console.log('✅ Order created:', orderNumber);
    res.json({ success: true, orderNumber: orderNumber });
});

// Update order status
app.put('/api/orders/:orderNumber/status', (req, res) => {
    const { orderNumber } = req.params;
    const { status } = req.body;
    
    const order = orders.find(o => o.order_number === orderNumber);
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
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const revenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
    res.json({
        total_orders: total,
        pending: pending,
        preparing: preparing,
        delivered: delivered,
        total_revenue: revenue
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Order page: http://localhost:${PORT}/order.html`);
    console.log(`👨‍💼 Admin page: http://localhost:${PORT}/admin-orders.html`);
});