import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true
    },
    grade: {
      type: String,
      required: true,
      enum: ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'Ab'],
      default: 'A'
    },
    gradePoint: {
      type: Number,
      required: true,
      default: 9
    },
    credits: {
      type: Number,
      required: true,
      default: 3
    },
    status: {
      type: String,
      default: 'Regular'
    }
  },
  { timestamps: true }
);

const semesterSchema = new mongoose.Schema(
  {
    semesterName: {
      type: String,
      required: true,
      trim: true
    },
    subjects: [subjectSchema]
  },
  { timestamps: true }
);

const academicRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    semesters: [semesterSchema]
  },
  { timestamps: true }
);

const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
export default AcademicRecord;
