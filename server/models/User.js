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
    email: obj.loginId,
    presentSemester: `${obj.presentYear || '4th Year'} – ${obj.presentSemester || '1st Semester'}`,
    role: obj.role
  };
};

const User = mongoose.model('User', userSchema);
export default User;
