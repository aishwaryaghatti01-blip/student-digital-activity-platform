const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  usn: {
    type: String,
    unique: true,
    sparse: true,
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
  },
  branch: {
    type: String,
    enum: [
      'Computer Science Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Information Science Engineering',
      'Data Science Engineering',
      'Electrical and Electronics Engineering',
      'Electronics and Communication Engineering',
      'AI/ML',
      'Chemical Engineering',
      'Aeronautical Engineering',
      'Others'
    ],
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  avatar: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return v === null || v === undefined || /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits',
    },
    default: null,
  },
  department: {
    type: String,
    default: null,
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
