const sqlite3 = require('sqlite3').verbose();

// Initialize the SQLite database
const db = new sqlite3.Database('inventory.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    }
});

// Create inventory table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // Create history table for tracking changes
    db.run(`
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inventory_id INTEGER,
            change_type TEXT NOT NULL,
            change_timestamp TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(inventory_id) REFERENCES inventory(id)
        )
    `);
});

module.exports = db;