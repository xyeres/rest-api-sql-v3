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
    const user = await User.findOne({
        where: { id: req.currentUser.dataValues.id },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    })
    console.log(user);
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
                as: 'user',
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    res.status(200).json(courses);
}));

// Get a course
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const courseId = req.params.id;

    const course = await Course.findOne({ // find course and include related users
        where: { id: courseId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] }

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
    const errors = [];
    const course = req.body;
    const user = req.currentUser;
    const targetCourse = await Course.findByPk(req.params.id); // The course to be updated
    if (targetCourse) { // Make sure the course in question exists before trying to update
        if (targetCourse.userId === user.id) { // Make sure current user has authorization to update course
            if (!course.title) {
                errors.push('Please provide a value for \"title\"');
            }
            if (!course.description) {
                errors.push('Please provide a value for \"description\"');
            }
            if (errors.length > 0) {
                res.status(400).json({ errors });
            }
            targetCourse.update(course); // Finally update the course if all values are sent
            res.status(204).end();
        } else {
            res.status(403).end();
        }
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}));

// Delete a course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser.dataValues;
    const course = await Course.findByPk(req.params.id);
    if (course) {
        if (course.userId === user.id) { // Check to see if current user has authorization to delete
            await course.destroy(); // Destroy the course from the DB
            res.status(204).end();
        } else {
            res.status(403).end();
        }
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}));

module.exports = router;
