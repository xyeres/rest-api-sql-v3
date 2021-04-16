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
router.get("/users", authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200).json(user);
}));


router.post('/users', asyncHandler(async (req, res) => {
    await User.create(req.body);
    res.status(201).location('/').end();
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

    res.status(200).json(courses);
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
    res.status(200).json(course);
}));

router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    const course = req.body;
    // create new course
    const newCourse = await Course.create({
        title: course.title,
        description: course.description,
        userId: req.currentUser.id, // set userid to current user ID!
    });

    
    res.status(201).location('/api/courses/' + newCourse.id).end();
}));

router.put('/courses/:id', asyncHandler(async (req, res) => {

    const course = await Course.findByPk(req.params.id);
    if (course) {
        course.update(req.body);
        res.status(204).end();
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}));

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
