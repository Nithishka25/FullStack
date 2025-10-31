const router = require('express').Router();
const { listUsers, listManagers, updateUser, listDepartmentUsers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Only general_manager can manage users
router.get('/', authorize('general_manager'), listUsers);
router.get('/managers', authorize('general_manager'), listManagers);
router.put('/:id', authorize('general_manager'), updateUser);
router.delete('/:id', authorize('general_manager'), deleteUser);

// Team manager: view department users
router.get('/department', authorize('team_manager'), listDepartmentUsers);

module.exports = router;
