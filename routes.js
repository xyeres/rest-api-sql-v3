'use-strict';

// Libraries
const express = require('express');

// Middleware
const router = express.Router();
const { asyncHandler } = require = ('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');

// Models
const { User } = require('./models/user');
const { Course } = require('./models/course');


/*
    USER ROUTES
*/
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;

    res.status(200).json({ user });
}));


router.post('/users', asyncHandler(async (req, res) => {
    // TODO: Create new user

    // TODO: Set Location header to "/"

    res.status(201).end();
}));

/*
    COURSE ROUTES
*/
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                as: 'student',
            },
        ],
    });

    res.status(200).json({ courses });
}));

router.get('/courses/:id', asyncHandler(async (req, res) => {
    const courseId = req.params.id;

    const course = await Course.findOne({ // this may not work???
        where: { id: courseId },
        include: [
            {
                model: User,
                as: 'student',
            },
        ],
    });
    res.status(200).json({ course });
}));

