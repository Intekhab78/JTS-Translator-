const User = require('../models/User');

// Simulated checkout that immediately upgrades the user
exports.simulatePurchase = async (req, res) => {
    try {
        const userId = req.user._id;

        // In a real Stripe implementation, this endpoint would:
        // 1. Create a Stripe Checkout Session
        // 2. Return the session.url to the frontend for redirection
        
        // For simulation, we just upgrade the user directly here
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const requestedPlan = req.body.plan || 'advanced';
        user.plan = requestedPlan;
        await user.save();

        res.json({ 
            message: `Purchase successful! Welcome to the ${requestedPlan} Plan.`,
            plan: user.plan
        });
    } catch (error) {
        console.error('Purchase simulation error:', error);
        res.status(500).json({ message: 'Server error processing purchase' });
    }
};
