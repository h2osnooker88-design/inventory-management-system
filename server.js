const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing application/json
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create inventory table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
    )`);
});

// API endpoints
// Get all inventory items
app.get('/api/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ inventory: rows });
    });
});

// Add new inventory item
app.post('/api/inventory', (req, res) => {
    const { item_name, quantity, price } = req.body;
    db.run(`INSERT INTO inventory (item_name, quantity, price) VALUES (?, ?, ?)`, [item_name, quantity, price], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Update inventory item
app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { item_name, quantity, price } = req.body;
    db.run(`UPDATE inventory SET item_name = ?, quantity = ?, price = ? WHERE id = ?`, [item_name, quantity, price, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ updated: this.changes });
    });
});

// Delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM inventory WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
