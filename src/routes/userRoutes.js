const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para Usuarios
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Login (REST) para escenarios sin IPC (ej. Live Server en navegador)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son obligatorios.' });
    }
    const result = await userController.loginUser(username, password);
    if (result.success) {
      return res.json(result);
    }
    return res.status(401).json(result);
  } catch (error) {
    console.error('Error en /usuarios/login:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor durante el login.' });
  }
});

module.exports = router;
