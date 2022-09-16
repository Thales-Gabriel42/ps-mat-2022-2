const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario');
const verifToken = require("../lib/verif_token");

router.post('/', verifToken, controller.create);
router.get('/', verifToken, controller.retrieve);
router.get('/:id', verifToken, controller.retrieveOne);
router.patch('/:id', verifToken, controller.update);
router.delete('/:id', verifToken, controller.delete);

router.post('/login', controller.login);

module.exports = router;