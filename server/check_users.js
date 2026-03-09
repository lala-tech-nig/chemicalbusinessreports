const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'username email role profilePhoto');
        console.log('All Users:');
        users.forEach(u => {
            console.log(`- ${u.username} (${u.role}): ${u.profilePhoto || 'None'}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
