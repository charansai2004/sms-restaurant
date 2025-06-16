const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 2004;

// Initialize Firebase
const serviceAccount = require('./kalki-1cee9-firebase-adminsdk-gamyx-11e8925c50.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/home2.html");
});

// Sign up route
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + "/sign.html");
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    console.log('Received signup data:', { name, email, password });

    if (!name || !email || !password) {
        return res.status(400).send('Missing required fields');
    }

    const userRef = db.collection('users').doc(email);

    try {
        const doc = await userRef.get();

        if (doc.exists) {
            console.log('User already exists');
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userRef.set({
            name,
            email,
            password: hashedPassword
        });

        console.log('User registered successfully');
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});


// Login route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
        return res.redirect('/login');
    }

    const userData = doc.data();
    const isPasswordMatch = await bcrypt.compare(password, userData.password);

    if (isPasswordMatch) {
        res.redirect('/menu'); // Redirect to the menu or another page after successful login
    } else {
        res.redirect('/login');
    }
});

// Table reservation route
app.get('/reserve', (req, res) => {
    res.sendFile(path.join(__dirname,  'rtable.html'));
});

// Handle reservation placement
app.post('/reserve', async (req, res) => {
    const { name, phone, email, date, time, numberOfPeople, requests } = req.body;

    console.log('Received reservation data:', { name, phone, email, date, time, numberOfPeople, requests });

    if (!name || !phone || !email || !date || !time || !numberOfPeople) {
        return res.status(400).send('Missing required fields');
    }

    try {
        await db.collection('reservations').add({
            name,
            phone,
            email,
            date,
            time,
            numberOfPeople: parseInt(numberOfPeople, 10), // Ensure it's stored as a number
            requests
        });

        console.log('Reservation stored successfully');
        res.status(201).send('Table reserved successfully');
    } catch (error) {
        console.error('Error storing reservation:', error);
        res.status(500).send('Error reserving table');
    }
});


// Menu route (get items)
app.get('/menu', (req, res) => {
    res.sendFile(__dirname + "/menu.html");
});

app.get('/menu', async (req, res) => {
    try {
        const menuSnapshot = await db.collection('menu').get();
        const menuItems = menuSnapshot.docs.map(doc => doc.data());
        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(400).send('Error fetching menu');
    }
});

// Cart route (add items)
app.get('/cart', (req, res) => {
    res.sendFile(__dirname + "/cartpage.html");
});

app.post('/cart', async (req, res) => {
    const { email, items } = req.body;
    try {
        await db.collection('carts').doc(email).set({
            items
        });
        res.status(201).send('Cart updated successfully');
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(400).send('Error updating cart');
    }
});

// order route
app.get('/order', (req, res) => {
    res.sendFile(__dirname + '/address.html');
});

// Handle order placement
app.post('/order', async (req, res) => {
    console.log('Received POST request:', req.body); // Debugging line

    const { name, phone, doorno, street, city, state, pin, cartData } = req.body;

    if (!name || !phone || !doorno || !street || !city || !state || !pin || !cartData) {
        console.error('Missing required fields');
        return res.status(400).send('Missing required fields');
    }

    try {
        // Parse cart data
        const cartItems = JSON.parse(cartData);
        console.log('Parsed cart data:', cartItems); // Debugging line

        // Save order information
        const orderRef = db.collection('orders').doc(); // Auto-generate an ID
        await orderRef.set({
            name,
            phone,
            doorno,
            street,
            city,
            state,
            pin,
            items: cartItems,
            timestamp: admin.firestore.Timestamp.now()
        });

        console.log('Order placed successfully:', {
            name,
            phone,
            doorno,
            street,
            city,
            state,
            pin,
            items: cartItems
        });

        res.status(200).send('Order placed successfully');
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send('Error placing order');
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
