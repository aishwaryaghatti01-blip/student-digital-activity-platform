const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
  },
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    default: 100,
  },
  percentage: {
    type: Number,
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
  },
  feedback: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Grade', gradeSchema);
