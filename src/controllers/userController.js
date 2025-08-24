const knex = require('../database/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_key'; // ¡En una app real, usa una variable de entorno!

// --- Funciones para el API REST ---

const getAllUsers = async (req, res) => {
    try {
        const users = await knex('users').select('id', 'username', 'role', 'created_at', 'fullname');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios.' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await knex('users').where({ id }).select('id', 'username', 'role', 'created_at', 'fullname').first();
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuario.' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, role, fullname } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ success: false, message: 'Usuario, contraseña y rol son obligatorios.' });
        }

        const existingUser = await knex('users').where({ username }).first();
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'El nombre de usuario ya existe.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const [id] = await knex('users').insert({ username, password_hash, role, fullname });
        res.status(201).json({ success: true, id });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear usuario.' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role, fullname } = req.body;

        const userData = {
            username,
            role,
            fullname
        };

        // Si se proporciona una nueva contraseña, la encriptamos
        if (password) {
            userData.password_hash = await bcrypt.hash(password, 10);
        }

        const updated = await knex('users').where({ id }).update(userData);

        if (updated) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar usuario.' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await knex('users').where({ id }).del();
        if (deleted) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar usuario.' });
    }
};


// --- Funciones para uso interno de Electron (IPC) ---

const loginUser = async (username, password) => {
    try {
        const user = await knex('users').where({ username }).first();
        if (!user) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return { success: false, message: 'Contraseña incorrecta.' };
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return { success: true, message: 'Login exitoso', token };

    } catch (error) {
        console.error('Error en el login:', error);
        return { success: false, message: 'Error en el servidor durante el login.' };
    }
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, message: 'Token inválido o expirado.' };
    }
};


module.exports = {
    // Para API REST
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    // Para IPC
    loginUser,
    verifyToken
};