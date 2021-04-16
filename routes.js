'use-strict';

// Libraries
const express = require('express');

// Middleware
const router = express.Router();
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');

// Models
const User = require('./models').User;
const Course = require('./models').Course;


/*
    USER ROUTES
*/
// Get current user
router.get("/users", authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200).json(user);
}));

// Create new user
router.post('/users', asyncHandler(async (req, res) => {
    await User.create(req.body);
    res.status(201).location('/').end();
}));

/*
    COURSE ROUTES
*/

// Get all courses
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                as: 'student',
            },
        ],
    });

    res.status(200).json(courses);
}));

// Get a course
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
    res.status(200).json(course);
}));

// Create new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.create(req.body);
    res.status(201).location('/api/courses/' + course.id).end();
}));

// Update a course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
        course.update(req.body);
        res.status(204).end();
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}));

// Delete a course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
        await course.destroy();
        res.status(204).end();
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}));

module.exports = router;
