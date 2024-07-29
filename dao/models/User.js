const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'usuario'], default: 'usuario' }
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        console.log('Senha antes de hash:', this.password);
        this.password = await bcrypt.hash(this.password, 10);
        console.log('Senha após hash:', this.password);
    }
    next();
});


module.exports = mongoose.model('User', UserSchema);
