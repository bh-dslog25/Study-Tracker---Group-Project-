'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/goalController');
const { validate } = require('../middleware/validateMiddleware');

// XÓA DÒNG IMPORT AUTHENTICATE Ở ĐÂY (nếu có)
// XÓA DÒNG router.use(authenticate) Ở ĐÂY

router.get('/', ctrl.getAll);
router.post('/', [ /* ... validate ... */ ], ctrl.create);
router.put('/:id', [ validate ], ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;