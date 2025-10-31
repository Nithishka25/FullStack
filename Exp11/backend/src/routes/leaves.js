const router = require('express').Router();
const { list, apply, updateStatus, cancel, statement } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', list);
router.post('/', apply);
router.put('/:id/status', authorize('team_leader', 'team_manager', 'general_manager'), updateStatus);
router.put('/:id/cancel', cancel);
router.get('/statement', statement);

module.exports = router;
