import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    loginId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true
    },
    presentYear: {
      type: String,
      default: '4th Year'
    },
    presentSemester: {
      type: String,
      default: '1st Semester'
    },
    university: {
      type: String,
      default: 'JNTUK',
      trim: true
    },
    regulation: {
      type: String,
      default: 'R20',
      trim: true
    },
    branch: {
      type: String,
      default: 'CSE',
      trim: true
    },
    courseType: {
      type: String,
      default: 'B.Tech',
      trim: true
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return {
    _id: obj._id,
    name: obj.name,
    rollNumber: obj.rollNumber,
    loginId: obj.loginId,
    email: obj.email || obj.loginId,
    presentYear: obj.presentYear || '4th Year',
    presentSemester: obj.presentSemester || '1st Semester',
    university: obj.university || 'JNTUK',
    regulation: obj.regulation || 'R20',
    branch: obj.branch || 'CSE',
    courseType: obj.courseType || 'B.Tech',
    role: obj.role || 'student'
  };
};

const User = mongoose.model('User', userSchema);
export default User;
