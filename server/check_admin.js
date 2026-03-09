const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Admin User Found:');
            console.log('Username:', admin.username);
            console.log('Email:', admin.email);
            console.log('Profile Photo:', admin.profilePhoto || 'None');
        } else {
            console.log('No Admin user found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAdmin();
