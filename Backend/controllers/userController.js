// In backend/controllers/userController.js



const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');

// @desc    Register a new student
// @route   POST /api/users/signup
// @access  Public
const registerUser = async (req, res) => {
  // 1. Get the data from the request body
  const { name, email, password, prn } = req.body;

  try {
    // 2. Check if a user with this email or PRN already exists
    const userExists = await User.findOne({ $or: [{ email }, { prn }] });

    if (userExists) {
      // 400 means Bad Request
      return res.status(400).json({ message: 'User with this email or PRN already exists' });
    }

    // 3. Create a new user in the database
    // The password will be automatically hashed by our pre-save hook in the User model
    const user = await User.create({
      name,
      email,
      password, // Send the plain text password, Mongoose will hash it
      prn,
      role: 'student', // Default role for this route is student
    });

    // 4. If user was created successfully, send back the user's info
    if (user) {
      // 201 means Something was Successfully Created
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        prn: user.prn,
        role: user.role,
        status: user.status
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // 1. Find the user by email
      const user = await User.findOne({ email });
  
      // 2. Check if user exists AND if the password matches
      if (user && (await user.matchPassword(password))) {
        // 3. If everything is correct, send back user info and a token
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          // For students, include their status
          ...(user.role === 'student' && { status: user.status }),
          token: generateToken(user._id),
        });
      } else {
        // 401 means Unauthorized
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server Error: ' + error.message });
    }
  };
  
// login teacher
// const loginTeacher = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (user && (await user.matchPassword(password))) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id),
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error: ' + error.message });
//   }
// };




const loginTeacher = async (req, res) => {
  const { email, password } = req.body;
  try {
      // 1. Find the user by email in the main User collection
      const user = await User.findOne({ email });

      // 2. Check if user exists, if the password matches, AND if their role is 'teacher'
      if (user && user.role === 'teacher' && (await user.matchPassword(password))) {
          res.json({
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              token: generateToken(user._id),
          });
      } else {
          // 3. If any of the checks fail, send an "Unauthorized" error
          res.status(401).json({ message: 'Invalid email or password' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};



//get all students  
const getStudents = async (req, res) => {
  try {
    // Find all users with the role of 'student' and exclude their passwords
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // The 'protect' middleware already fetched the user and attached it to the request
    const user = req.user;
  
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'student' && { prn: user.prn, status: user.status }),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  };


  // @desc    Update a student's status (approve/reject)
// @route   PUT /api/users/:id/status
// @access  Private/Teacher
const updateStudentStatus = async (req, res) => {
  try {
    // The new status will be in the request body, e.g., { "status": "approved" }
    const { status } = req.body;
    
    // Find the student by the ID in the URL parameter
    const student = await User.findById(req.params.id);

    if (student && student.role === 'student') {
      student.status = status;
      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
  


// @desc    Submit answers for an exam
// @route   POST /api/student/exam/:examId/submit (This route will need to be defined)
// @access  Private (Student)
// const submitExam = async (req, res) => {
//   try {
//       const { examId } = req.params;
//       const { answers } = req.body; // The frontend will send this
//       const studentId = req.user._id; // From our auth middleware

//       // 1. Find the exam to get the correct answers
//       const exam = await Exam.findById(examId);
//       if (!exam) {
//           return res.status(404).json({ message: 'Exam not found' });
//       }

//       // 2. Check if the student has already submitted this exam
//       const existingSubmission = await Submission.findOne({ examId, studentId });
//       if (existingSubmission) {
//           return res.status(400).json({ message: 'You have already submitted this exam.' });
//       }

//       // 3. Calculate the score
//       let score = 0;
//       const answerMap = new Map(exam.questions.map(q => [q._id.toString(), q.correctAnswer]));

//       answers.forEach(answer => {
//           if (answerMap.get(answer.questionId) === answer.selectedAnswer) {
//               score++;
//           }
//       });

//       // 4. Create the new submission document
//       const submission = await Submission.create({
//           examId,
//           studentId,
//           answers,
//           score,
//       });

//       // 5. Send back the final result
//       res.status(201).json({
//           message: 'Exam submitted successfully!',
//           score: score,
//           totalQuestions: exam.questions.length,
//           submission: submission,
//       });

//   } catch (error) {
//       console.error('Error submitting exam:', error);
//       res.status(500).json({ message: 'Server Error' });
//   }
// };


//delete student by id
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
 
// @desc    Register a new teacher
// @route   POST /api/users/add-teacher
// @access  Private/Teacher
const addTeacher = async (req, res) => {
  // 1. Get the data from the request body
  const { name, email, password } = req.body;

  try {
      // 2. Check if a user with this email already exists
      const userExists = await User.findOne({ email });

      if (userExists) {
          return res.status(400).json({ message: 'A user with this email already exists' });
      }

      // 3. Create a new user with the role of 'teacher'
      const user = await User.create({
          name,
          email,
          password,
          role: 'teacher',
          status: 'approved', // Teachers are approved by default
      });

      // 4. If the teacher was created successfully, send back their details
      if (user) {
          res.status(201).json({
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
          });
      } else {
          res.status(400).json({ message: 'Invalid teacher data' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


module.exports = { registerUser, loginUser, getUserProfile, getStudents, updateStudentStatus, loginTeacher, deleteStudent, addTeacher };