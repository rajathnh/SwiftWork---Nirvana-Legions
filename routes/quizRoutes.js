const express = require("express");
const router = express.Router();
const Freelancer = require("../models/freelancer");
const Badge = require("../models/Badges");
// const htmlQuestions = require("../data/htmlQuestions");

// Function to determine badge level
const determineBadgeLevel = (score) => {
    if (score >= 27) return 'Expert';
    if (score >= 24) return 'Advanced';
    if (score >= 20) return 'Intermediate';
    if (score >= 15) return 'Beginner';
    return null;
};

// Route to submit HTML quiz result
router.post("/submit-html-test", async (req, res) => {
    console.log("♨️SUBMIT TEST♨️", req.body);
    try {
        const { freelancerId, testName, score } = req.body;

        // Validate input
        if (!freelancerId || !testName || score === undefined) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields' 
            });
        }

        // Find the freelancer
        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Freelancer not found' 
            });
        }

        // Determine badge level
        const badgeLevel = determineBadgeLevel(score);
        if (!badgeLevel) {
            return res.status(200).json({ 
                status: 'fail', 
                message: 'Did not meet minimum passing criteria' 
            });
        }

        // Find or create badge based on performance level
        let htmlBadge = await Badge.findOne({ 
            name: `HTML ${badgeLevel} Certified`, 
            category: 'Skills Test',
            level: badgeLevel
        });

        if (!htmlBadge) {
            htmlBadge = await Badge.create({
                name: `HTML ${badgeLevel} Certified`,
                category: 'Skills Test',
                description: `Demonstrated ${badgeLevel.toLowerCase()} proficiency in HTML fundamentals`,
                level: badgeLevel,
                iconUrl: `/badges/html-${badgeLevel.toLowerCase()}.png`
            });
        }

        // Check for existing badges of this category and remove them
        const existingHtmlBadges = await Badge.find({ 
            category: 'Skills Test',
            name: { $regex: /HTML.*Certified/ }
        });

        // Remove lower-level HTML badges
        const badgesToRemove = existingHtmlBadges.filter(badge => 
            ['Beginner', 'Intermediate', 'Advanced', 'Expert']
            .indexOf(badge.level) < ['Beginner', 'Intermediate', 'Advanced', 'Expert'].indexOf(badgeLevel)
        );

        // Remove lower-level badges from freelancer
        freelancer.badges = freelancer.badges.filter(
            badgeId => !badgesToRemove.some(b => b._id.toString() === badgeId.toString())
        );

        // Add new badge if not already present
        const badgeAlreadyExists = freelancer.badges.some(
            badge => badge.toString() === htmlBadge._id.toString()
        );

        if (!badgeAlreadyExists) {
            freelancer.badges.push(htmlBadge._id);
        }

        await freelancer.save();

        res.status(200).json({ 
            status: 'success', 
            message: `HTML ${badgeLevel} test completed successfully`,
            badge: {
                id: htmlBadge._id,
                name: htmlBadge.name,
                level: badgeLevel,
                description: htmlBadge.description
            }
        });

    } catch (error) {
        console.error('Error in HTML quiz submission:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error',
            error: error.message 
        });
    }
});

// Route to get freelancer's badges
router.get("/freelancer-badges/:freelancerId", async (req, res) => {
    try {
        const freelancer = await Freelancer.findById(req.params.freelancerId)
            .populate('badges');

        if (!freelancer) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Freelancer not found' 
            });
        }

        res.status(200).json({
            status: 'success',
            badges: freelancer.badges
        });

    } catch (error) {
        console.error('Error fetching freelancer badges:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error',
            error: error.message 
        });
    }
});

module.exports = router;