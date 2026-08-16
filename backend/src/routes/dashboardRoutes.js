const {Router} = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = Router();

router.get('/stats', getDashboardStats);

module.exports = router;