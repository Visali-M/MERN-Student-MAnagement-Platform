const Student = require("../models/Student");

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message
    });
  }
};

// Get single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching student",
      error: error.message
    });
  }
};

// Create new student
exports.createStudent = async (req, res) => {
  try {
    const { name, age, course, email, phone } = req.body;

    // Validation
    if (!name || !age || !course) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, age, course)"
      });
    }

    if (age < 18 || age > 60) {
      return res.status(400).json({
        success: false,
        message: "Age must be between 18 and 60"
      });
    }

    const newStudent = new Student({
      name: name.trim(),
      age,
      course: course.trim(),
      email,
      phone
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: newStudent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating student",
      error: error.message
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, age, course, email, phone } = req.body;

    if (age && (age < 18 || age > 60)) {
      return res.status(400).json({
        success: false,
        message: "Age must be between 18 and 60"
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (age) updateData.age = age;
    if (course) updateData.course = course.trim();
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating student",
      error: error.message
    });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message
    });
  }
};

// Search students
exports.searchStudents = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const students = await Student.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { course: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching students",
      error: error.message
    });
  }
};
