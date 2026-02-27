const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
app.use(bodyParser.json());

let conn = null;
const initMtSQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'wabdb',
        port:8700
    });
    console.log('Connected to MySQL database');
}

app.get('/users', async(req,res) => {
    const results = await conn.query('SELECT * FROM users');
    res.json(results[0]);
})

app.post('/users', async(req,res) => {
    try {
        let user = req.body;
        const results = await conn.query('INSERT INTO users SET ?',user);
        console.log('results:',results);
        res.json({
            massage: 'User added successfully',
            data: results[0]
        });
    }catch (error) {
        console.error('Error inserting user:',error);
        res.status(500).json({ message: 'Error adding user'});
    }
})

app.get('/users/:id', async (req,res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT *FROM users WHERE id = ?',id);
        if (results[0].length === 0) {
            throw {statusCode: 404, message: 'User not found'};
        }
        res.json(results[0][0]);
    } catch (error) {
        console.error('Error fetching user:',error);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ 
            message: error.massage || 'Error fetching user'});
    }
})

//Path: put
app.put('/users/:id', async (req,res) => {
    try{
        let id = req.params.id;
        let updateUser = req.body;
        const results = await conn.query('UPDATE users SET ? WHERE id = ?', [updateUser, id]);
        res.json({
            massage: 'User updated successfully',
            data: results[0]
        });
    } catch (error) {
        console.error('Error updating user:',error);
        res.status(500).json({ message: 'Error updating user'});
    }
})

app.delete('/users/:id', async (req,res) => {
    try{
        let id = req.params.id;
        const results = await conn.query('DELETE FROM users WHERE id = ?',[id]);
        res.json({
            massage: 'User deleted successfully',
            data: results[0]
        });
    } catch (error) {
        console.error('Error deleting user:',error);
        res.status(500).json({ message: 'Error deleting user'});
    }
})

app.listen(port, async () => {
    await initMtSQL();
    console.log(`server is running on http://localhost:${port}`);
});