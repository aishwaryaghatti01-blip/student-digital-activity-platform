const express = require('express');
const Activity = require('../models/Activity');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all activities for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const activities = await Activity.find({ course: req.params.courseId })
      .populate('instructor', 'firstName lastName email')
      .populate('submissions.student', 'firstName lastName email usn');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('instructor', 'firstName lastName email')
      .populate('submissions.student', 'firstName lastName email usn');
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create activity (Teacher only)
router.post('/', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, type, course, dueDate, maxScore } = req.body;

    const activity = new Activity({
      title,
      description,
      type,
      course,
      instructor: req.user.id,
      dueDate,
      maxScore: maxScore || 100,
    });

    await activity.save();
    await activity.populate('instructor', 'firstName lastName email');

    res.status(201).json({ message: 'Activity created successfully', activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update activity (Instructor only)
router.put('/:id', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this activity' });
    }

    const { title, description, dueDate, maxScore } = req.body;
    if (title) activity.title = title;
    if (description) activity.description = description;
    if (dueDate) activity.dueDate = dueDate;
    if (maxScore) activity.maxScore = maxScore;

    await activity.save();
    res.json({ message: 'Activity updated successfully', activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit activity (Student)
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const existingSubmission = activity.submissions.find(
      s => s.student.toString() === req.user.id
    );

    if (existingSubmission) {
      existingSubmission.content = content;
      existingSubmission.fileUrl = fileUrl;
      existingSubmission.submissionDate = new Date();
      existingSubmission.status = 'submitted';
    } else {
      activity.submissions.push({
        student: req.user.id,
        content,
        fileUrl,
        submissionDate: new Date(),
        status: 'submitted',
      });
    }

    await activity.save();
    res.json({ message: 'Activity submitted successfully', activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade submission (Teacher only)
router.post('/:id/grade/:submissionId', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to grade this activity' });
    }

    const submission = activity.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';

    await activity.save();
    res.json({ message: 'Submission graded successfully', activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student submissions for activity
router.get('/:id/submissions/:studentId', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('submissions.student', 'firstName lastName email usn');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const submission = activity.submissions.find(
      s => s.student._id.toString() === req.params.studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
