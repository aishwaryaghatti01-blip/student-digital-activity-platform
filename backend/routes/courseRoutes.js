const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'firstName lastName email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email')
      .populate('students', 'firstName lastName email usn branch');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course (Teacher/Admin only)
router.post('/', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, code, department, credits, startDate, endDate, maxStudents } = req.body;

    const course = new Course({
      title,
      description,
      code,
      instructor: req.user.id,
      department,
      credits: credits || 3,
      startDate,
      endDate,
      maxStudents: maxStudents || 100,
    });

    await course.save();
    await course.populate('instructor', 'firstName lastName email');

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update course (Instructor/Admin only)
router.put('/:id', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const { title, description, status, maxStudents } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (status) course.status = status;
    if (maxStudents) course.maxStudents = maxStudents;

    await course.save();
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    if (course.students.length >= course.maxStudents) {
      return res.status(400).json({ message: 'Course is full' });
    }

    course.students.push(req.user.id);
    await course.save();

    const user = await User.findById(req.user.id);
    user.enrolledCourses.push(course._id);
    await user.save();

    res.json({ message: 'Enrolled successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get courses by instructor
router.get('/instructor/:instructorId', async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.instructorId })
      .populate('instructor', 'firstName lastName email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
