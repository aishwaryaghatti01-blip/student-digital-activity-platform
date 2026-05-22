const express = require('express');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all grades for a course (Teacher only)
router.get('/course/:courseId', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate('student', 'firstName lastName email usn branch semester')
      .populate('course', 'title code');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's grades
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId })
      .populate('course', 'title code credits')
      .populate('student', 'firstName lastName email usn branch');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grade by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'firstName lastName email usn branch semester')
      .populate('course', 'title code credits');
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create grade (Teacher only)
router.post('/', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { student, course, midTermScore, endTermScore, assignmentScore, projectScore } = req.body;

    // Check if grade already exists
    let grade = await Grade.findOne({ student, course });
    if (grade) {
      return res.status(400).json({ message: 'Grade already exists for this student-course combination' });
    }

    const totalScore = (midTermScore || 0) + (endTermScore || 0) + (assignmentScore || 0) + (projectScore || 0);
    
    // Calculate letter grade
    let letterGrade = 'F';
    if (totalScore >= 90) letterGrade = 'A';
    else if (totalScore >= 80) letterGrade = 'B';
    else if (totalScore >= 70) letterGrade = 'C';
    else if (totalScore >= 60) letterGrade = 'D';

    grade = new Grade({
      student,
      course,
      midTermScore: midTermScore || 0,
      endTermScore: endTermScore || 0,
      assignmentScore: assignmentScore || 0,
      projectScore: projectScore || 0,
      totalScore,
      letterGrade,
    });

    await grade.save();
    await grade.populate('student', 'firstName lastName email usn');
    await grade.populate('course', 'title code');

    res.status(201).json({ message: 'Grade created successfully', grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update grade (Teacher only)
router.put('/:id', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    const { midTermScore, endTermScore, assignmentScore, projectScore } = req.body;

    if (midTermScore !== undefined) grade.midTermScore = midTermScore;
    if (endTermScore !== undefined) grade.endTermScore = endTermScore;
    if (assignmentScore !== undefined) grade.assignmentScore = assignmentScore;
    if (projectScore !== undefined) grade.projectScore = projectScore;

    // Recalculate total and letter grade
    grade.totalScore = grade.midTermScore + grade.endTermScore + grade.assignmentScore + grade.projectScore;
    
    if (grade.totalScore >= 90) grade.letterGrade = 'A';
    else if (grade.totalScore >= 80) grade.letterGrade = 'B';
    else if (grade.totalScore >= 70) grade.letterGrade = 'C';
    else if (grade.totalScore >= 60) grade.letterGrade = 'D';
    else grade.letterGrade = 'F';

    await grade.save();
    res.json({ message: 'Grade updated successfully', grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grades by course and branch
router.get('/course/:courseId/branch/:branch', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate({
        path: 'student',
        match: { branch: req.params.branch },
        select: 'firstName lastName email usn branch semester'
      })
      .populate('course', 'title code');

    const filteredGrades = grades.filter(g => g.student !== null);
    res.json(filteredGrades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get class average for a course
router.get('/course/:courseId/average', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId });
    
    if (grades.length === 0) {
      return res.json({ average: 0, totalStudents: 0 });
    }

    const totalScore = grades.reduce((sum, grade) => sum + grade.totalScore, 0);
    const average = totalScore / grades.length;

    res.json({
      average: average.toFixed(2),
      totalStudents: grades.length,
      highestScore: Math.max(...grades.map(g => g.totalScore)),
      lowestScore: Math.min(...grades.map(g => g.totalScore))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
