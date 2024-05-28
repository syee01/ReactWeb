const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const util = require('util')
const { check, validationResult } = require('express-validator');
const { table } = require("console");
require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME, // Your email
    to: email, // Recipient email
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (err) {
    console.error('Email send error:', err);
  }
};


const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../frontend/src/images')));

// create to mysql database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myhalalchecker"
})

const getUserEmail = async (userId) => {
  // Assuming you are using a library like mysql or similar for database operations
  return new Promise((resolve, reject) => {
    const query = 'SELECT email FROM user WHERE UserID = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]?.email);
      }
    });
  });
};

app.post('/send-email', async (req, res) => {
  const { userId, subject, text } = req.body;
  try {
    const userEmail = await getUserEmail(userId); // Ensure getUserEmail is secure and efficient
    console.log('Sending email to:', userEmail); // Debugging
    await sendEmail(userEmail, subject, text);
    res.send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).send({ message: 'Failed to send email' });
  }
});


const query = util.promisify(db.query).bind(db);
app.get('/api/data', async (req, res) => {
  try {
    const categories = ['product', 'restaurant', 'mosque', 'pr'];
    const countries = ['malaysia', 'korea', 'thailand'];


    const data = {};

    await Promise.all(countries.map(async (country) => {
      data[country] = await Promise.all(categories.map(async (category) => {
        const tableName = `${country}${category}`;
        // Use the promisified `query` function here
        const rows = await query(`SELECT COUNT(*) AS count FROM ${tableName}`);
        return rows[0].count; // Adjust based on the structure `query` returns
      }));
    }));

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/states/:country/:category', async (req, res) => {
  const { country, category } = req.params;
  let tableName = `${country}${category}`; // Construct table name based on country and category
  let column = category === 'restaurant' ? 'region' : 'state';

  db.query(`SELECT DISTINCT ${column} AS state FROM ${tableName}`, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    // Directly map over results if using MySQL
    const states = results.map(row => row.state);
    res.json(states);
  });
});

app.get('/district/:category', async (req, res) => {
  const { category } = req.params;
  let tableName = `malaysia${category}`; // Construct table name based on country and category
  db.query(`SELECT DISTINCT district AS state FROM ${tableName}`, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    // Directly map over results if using MySQL
    const states = results.map(row => row.state);
    res.json(states);
  });
});

app.get('/districts/:category/:state', async (req, res) => {
  const { category, state } = req.params;
  let tableName = `malaysia${category}`;

  // Use placeholders to prevent SQL injection
  db.query(`SELECT DISTINCT district FROM ?? WHERE state = ?`, [tableName, state], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Server error');
    }

    // Map over results to get the list of districts
    if (results.length > 0) {
      const districts = results.map(row => row.district);
      res.json(districts);
    } else {
      res.status(404).send('No districts found for the given state.');
    }
  });
});

app.get('/user-role/:userID', (req, res) => {
  const userID = req.params.userID;
  // Your database query here, for example:
  db.query('SELECT role FROM user WHERE UserID = ?', [userID], (err, results) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Server error');
      }
      if (results.length > 0) {
          res.json({ role: results[0].role });
      } else {
          res.status(404).send('User not found');
      }
  });
});

app.get('/user-count', async (req, res) => {
  try {
      const rows = await query('SELECT COUNT(*) AS count FROM user WHERE role = ?', ['user']);
      res.json({ usersCount: rows[0].count });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/officer-count', async (req, res) => {
  try {
      const rows = await query('SELECT COUNT(*) AS count FROM user WHERE role = ?', ['officer']);
      res.json({ officerCount: rows[0].count });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get the total reports submitted
app.get('/reports-count', async (req, res) => {
  try {
    const restaurantsReports = await query('SELECT COUNT(*) AS count FROM restaurant_reports');
    const productsReports = await query('SELECT COUNT(*) AS count FROM product_reports');
    res.json({
      totalReports: restaurantsReports[0].count + productsReports[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal server error'});
  }
});

app.get('/enquiries-count', async (req, res) => {
  try {
    const restaurantsEnquiry = await query('SELECT COUNT(*) AS count FROM restaurant_enquiry');
    const productsEnquiry = await query('SELECT COUNT(*) AS count FROM product_enquiry');
    res.json({
      totalEnquiries: restaurantsEnquiry[0].count + productsEnquiry[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal server error'});
  }
});

app.get('/status-details', async (req, res) => {
  try {
    const role = req.query.role; // Assume role is passed as a query parameter
    const categories = ['restaurant_reports', 'product_reports', 'restaurant_enquiry', 'product_enquiry'];
    let results = {};

    // Define status filters for different roles
    let statusFilter = [];
    if (role === 'head officer') {
      statusFilter = ['To Be Confirmed', 'Completed'];
    } else if (role === 'officer') {
      statusFilter = ['Pending', 'In Progress', 'Completed'];
    } else if (role === 'data admin') {
      statusFilter = ['Pending', 'In Progress', 'To Be Confirmed', 'Completed'];
    }
    
    for (const category of categories) {
      results[category] = {};
      for (const status of statusFilter) {
        const queryResult = await query(`SELECT COUNT(*) AS count FROM ${category} WHERE status = ?`, [status]);
        results[category][status] = queryResult[0] ? queryResult[0].count : 0;
      }
    }
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const imagesDir = path.join(__dirname, '../frontend/src/images');
app.use('/images', express.static(imagesDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const country = req.body.country;
    let destinationDir = ''; // Default directory
    
    // Check the country and set the destination directory accordingly
    if (country === 'mas') {
      destinationDir = path.join(imagesDir, 'malaysiaProductImage');
    } else if (country === 'thai') {
      destinationDir = path.join(imagesDir, 'thailandProductImage');
    } else if (country === 'kr') {
      destinationDir = path.join(imagesDir, 'koreaProductImage');
    }
  
    // Make sure the directory exists
    if (!fs.existsSync(destinationDir)){
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    cb(null, destinationDir);
  },
  filename: function (req, file, cb) {
    const tempName = 'temp_' + Date.now() + path.extname(file.originalname);
    cb(null, tempName); // Temporarily name the file until product ID is known
  }
});

const upload = multer({ storage: storage });

// Route to handle finalizing report
app.post('/finalise_report/:category', (req, res) => {
  const { reportId, updateData } = req.body;
  const { category } = req.params;

  let tableName = '';
  if (category === 'Restaurants') {
    tableName = 'restaurant_reports';
  } else if (category === 'Products') {
    tableName = 'product_reports';
  } else {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const query = `UPDATE ${tableName} SET ? WHERE ReportID = ?`;

  db.query(query, [updateData, reportId], (err, result) => {
    if (err) {
      console.error('Error updating report:', err);
      return res.status(500).json({ error: 'Failed to update report' });
    }
    console.log('Report updated successfully');
    res.status(200).json({ message: 'Report updated successfully' });
  });
});

app.post('/finalise_enquiry/:category', (req, res) => {
  const { reportId, updateData } = req.body;
  const { category } = req.params;

  let tableName = '';
  if (category === 'Restaurants') {
    tableName = 'restaurant_enquiry';
  } else if (category === 'Products') {
    tableName = 'product_enquiry';
  } else {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const query = `UPDATE ${tableName} SET ? WHERE ReportID = ?`;

  db.query(query, [updateData, reportId], (err, result) => {
    if (err) {
      console.error('Error updating report:', err);
      return res.status(500).json({ error: 'Failed to update report' });
    }
    console.log('Report updated successfully');
    res.status(200).json({ message: 'Report updated successfully' });
  });
});


app.post('/update_report/:category', (req, res) => {
  const { category } = req.params;
  const { reportId, comment } = req.body;
  
  let tableName = '';
  if (category === 'Products') {
    tableName = 'product_reports';
  } else if (category === 'Restaurants') {
    tableName = 'restaurant_reports';
  } else {
    res.status(400).send('Invalid category');
    return;
  }

  const sql = `UPDATE ${tableName} SET Comment = ?, Status = 'To Be Confirmed' WHERE ReportID = ?`;
  db.query(sql, [comment, reportId], (err, result) => {
    if (err) {
      console.error(`Error updating ${category} report:`, err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(`${category} report updated successfully`);
    res.status(200).send(`${category} report updated successfully`);
  });
});

app.post('/update_enquiry/:category', (req, res) => {
  const { category } = req.params;
  const { reportId, comment } = req.body;
  
  let tableName = '';
  if (category === 'Products') {
    tableName = 'product_enquiry';
  } else if (category === 'Restaurants') {
    tableName = 'restaurant_enquiry';
  } else {
    res.status(400).send('Invalid category');
    return;
  }

  const sql = `UPDATE ${tableName} SET Comment = ?, Status = 'To Be Confirmed' WHERE ReportID = ?`;
  db.query(sql, [comment, reportId], (err, result) => {
    if (err) {
      console.error(`Error updating ${category} report:`, err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(`${category} report updated successfully`);
    res.status(200).send(`${category} report updated successfully`);
  });
});

app.get('/reportImages/:reportId', (req, res) => {
  const reportId = req.params.reportId;
  getImagesForReportId(reportId, (err, imagePaths) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.json(imagePaths);
  });
});

app.get('/enquiryImages/:reportId', (req, res) => {
  const reportId = req.params.reportId;
  getImagesForReportId(reportId, (err, imagePaths) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.json(imagePaths);
  });
});


const getImagesForReportId = (reportId, callback) => {
  db.query('SELECT ImagePath FROM report_images WHERE ReportID = ?', [reportId], (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    // Assuming that 'ImagePath' contains only the filename
    const imagePaths = results.map(row => row.ImagePath);
    callback(null, imagePaths);
  });
};


// Route to get username by user ID
app.get('/getUsername/:userID', (req, res) => {
  const userID = req.params.userID;

  // If userID is 'null' (as a string), return null for username and don't query the DB
  if (userID === 'null') {
    return res.json({ username: null });
  }

  const parsedUserID = parseInt(userID, 10); // Convert the userID to integer

  if (isNaN(parsedUserID)) {
    return res.status(400).send('Invalid user ID'); // Send error if userID is not a number
  }

  const sql = 'SELECT username FROM user WHERE UserID = ?';
  db.query(sql, [parsedUserID], (err, results) => {
    if (err) {
      console.error('Error fetching username:', err);
      return res.status(500).json({ message: 'Error fetching username' });
    }

    if (results.length > 0) {
      const username = results[0].username;
      res.json({ username });
    } else {
      // If no user is found, also return null for username
      res.json({ username: null });
    }
  });
});

app.get('/specificReports/:category/:reportId', (req, res) => {
  const { category, reportId } = req.params;
  let tableName = category === 'Restaurants' ? 'restaurant_reports' : 'product_reports';
  
  db.query(`SELECT * FROM ${tableName} WHERE ReportID = ?`, [reportId], (err, results) => {
    if (err) {
      return res.status(500).send('An error occurred');
    }
    if (results.length === 0) {
      return res.status(404).send('Report not found');
    }
    res.json(results[0]);
  });
});

app.get('/specificEnquiry/:category/:reportId', (req, res) => {
  const { category, reportId } = req.params;
  let tableName = category === 'Restaurants' ? 'restaurant_enquiry' : 'product_enquiry';
  
  db.query(`SELECT * FROM ${tableName} WHERE ReportID = ?`, [reportId], (err, results) => {
    if (err) {
      console.log(error)
      return res.status(500).send('An error occurred');
    }
    if (results.length === 0) {
      console.log(error)
      return res.status(404).send('Report not found');
    }
    res.json(results[0]);
  });
});

app.put('/viewByReportUpdate/:reportId', (req, res) => {
  const { reportId } = req.params;
  const { viewedBy, category, status } = req.body;
  let tableName = category === 'Products' ? 'product_reports' : 'restaurant_reports';
  const sql = `UPDATE ${tableName} SET ViewedBy = ?, Status = ? WHERE ReportID = ?`;

  console.log('Route hit with reportId:', typeof(req.params.reportId));

  db.query(sql, [viewedBy, status, reportId], (error, results) => {
    if (error) {
      console.log('Error updating report:', error);
      return res.status(500).send('Error updating report');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Report not found');
    }
    res.json({ message: 'Report updated successfully' });
  });
});

app.put('/viewByEnquiryUpdate/:reportId', (req, res) => {
  const { reportId } = req.params;
  const { viewedBy, category, status } = req.body;
  let tableName = category === 'Products' ? 'product_enquiry' : 'restaurant_enquiry';
  const sql = `UPDATE ${tableName} SET ViewedBy = ?, Status = ? WHERE ReportID = ?`;

  console.log('Route hit with reportId:', typeof(req.params.reportId));

  db.query(sql, [viewedBy, status, reportId], (error, results) => {
    if (error) {
      ('Error updating report:', error);
      return res.status(500).send('Error updating report');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Report not found');
    }
    res.json({ message: 'Report updated successfully' });
  });
});

app.get('/reports', (req, res) => {
  const { category, status } = req.query;
  let tableName = '';

  if (category === 'Products') {
    tableName = 'product_reports';
  } else if (category === 'Restaurants') {
    tableName = 'restaurant_reports';
  } else {
    return res.status(400).send('Invalid category');
  }

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  // Adjust this query based on your actual database schema
  // This example assumes that you have a 'users' table where the username for a given userID can be found
  const query = `
    SELECT r.*, u1.username AS ViewedByUsername, u2.username AS ApprovedByUsername
    FROM ${tableName} r
    LEFT JOIN user u1 ON r.ViewedBy = u1.UserID
    LEFT JOIN user u2 ON r.ApprovedBy = u2.UserID
    WHERE r.Status = ?
  `;

  db.query(query, [formattedStatus], (error, results) => {
    if (error) {
      console.error('SQL Error:', error.message);
      return res.status(500).send('Error fetching reports');
    }
    // Process the results to replace NULL with a dash
    const processedResults = results.map(report => ({
      ...report,
      ViewedByUsername: report.ViewedByUsername || '-',
      ApprovedByUsername: report.ApprovedByUsername || '-'
    }));
    res.json(processedResults);
  });
});

app.get('/enquiry', (req, res) => {
  const { category, status } = req.query;
  let tableName = '';

  if (category === 'Products') {
    tableName = 'product_enquiry';
  } else if (category === 'Restaurants') {
    tableName = 'restaurant_enquiry';
  } else {
    return res.status(400).send('Invalid category');
  }

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  // Adjust this query based on your actual database schema
  // This example assumes that you have a 'users' table where the username for a given userID can be found
  const query = `
    SELECT r.*, u1.username AS ViewedByUsername, u2.username AS ApprovedByUsername
    FROM ${tableName} r
    LEFT JOIN user u1 ON r.ViewedBy = u1.UserID
    LEFT JOIN user u2 ON r.ApprovedBy = u2.UserID
    WHERE r.Status = ?
  `;

  db.query(query, [formattedStatus], (error, results) => {
    if (error) {
      console.error('SQL Error:', error.message);
      return res.status(500).send('Error fetching reports');
    }
    // Process the results to replace NULL with a dash
    const processedResults = results.map(report => ({
      ...report,
      ViewedByUsername: report.ViewedByUsername || '-',
      ApprovedByUsername: report.ApprovedByUsername || '-'
    }));
    res.json(processedResults);
  });
});


// write login error 
app.post('/login', [check('email', "Email length error").isEmail().isLength({ min: 10, max: 30 }), check('password', "password length 8-10").isLength({ min: 1, max: 10 })], (req, res) => {
    const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ status: "Failed", errors: errors.array() });
        } else {
          if (err) {
            console.error("Database error:", err);
            return res.json({ status: "Error", message: "An error occurred", error: err.message });
          }
        
            if (data.length > 0) {
                // Assuming 'username' is a field in your user table
                return res.json({ status: "Success", username: data[0].username, userID: data[0].UserID, role:data[0].role });
            } else {
                return res.json({ status: "Failed", message: "Invalid email or password" });
            }
        }
    });
});

app.get('/malaysiapr', (req, res) => {
  // Assuming you have a database connection setup with a query function
  const sql = 'SELECT * FROM malaysiapr'; // Selects all products
  db.query(sql, (err, results) => {
    if (err) {
      // Handle error
  
      console.error(err);
      res.status(500).json({ message: 'Error retrieving products' });
    } else {
      res.json(results);
    }
  });
});

app.get('/thailandpr', (req, res) => {
  // Assuming you have a database connection setup with a query function
  const sql = 'SELECT * FROM thailandpr'; // Selects all products
  db.query(sql, (err, results) => {
    if (err) {
      // Handle error
      console.error(err);
      res.status(500).json({ message: 'Error retrieving products' });
    } else {
      res.json(results);
    }
  });
});

app.get('/koreapr', (req, res) => {
  // Assuming you have a database connection setup with a query function
  const sql = 'SELECT * FROM koreapr'; // Selects all products
  db.query(sql, (err, results) => {
    if (err) {
      // Handle error
  
      console.error(err);
      res.status(500).json({ message: 'Error retrieving products' });
    } else {
      res.json(results);
    }
  });
});

app.get('/malaysiamosque', (req, res) => {
  // Assuming you have a database connection setup with a query function
  const sql = 'SELECT * FROM malaysiamosque'; // Selects all products
  db.query(sql, (err, results) => {
    if (err) {
      // Handle error
      console.error(err);
      res.status(500).json({ message: 'Error retrieving products' });
    } else {
      res.json(results);
    }
  });
});

app.get('/thailandmosque', (req, res) => {
  // Assuming you have a database connection setup with a query function
  const sql = 'SELECT * FROM thailandmosque'; // Selects all products
  db.query(sql, (err, results) => {
    if (err) {
      // Handle error
  
      console.error(err);
      res.status(500).json({ message: 'Error retrieving products' });
    } else {
      res.json(results);
    }
  });
});

app.get('/koreamosque', (req, res) => {
  // Assuming you have a database connection setup with a query function
  const sql = 'SELECT * FROM koreamosque'; // Selects all products
  db.query(sql, (err, results) => {
    if (err) {
      // Handle error
      console.error(err);
      res.status(500).json({ message: 'Error retrieving products' });
    } else {
      res.json(results);
    }
  });
});

app.get('/masproduct', (req, res) => {
    // Assuming you have a database connection setup with a query function
    const sql = 'SELECT * FROM malaysiaproduct'; // Selects all products
    db.query(sql, (err, results) => {
      if (err) {
        // Handle error
        console.error(err);
        res.status(500).json({ message: 'Error retrieving products' });
      } else {
        res.json(results);
      }
    });
  });

  app.get('/thaiproduct', (req, res) => {
    // Assuming you have a database connection setup with a query function
    const sql = 'SELECT * FROM thailandproduct'; // Selects all products
    db.query(sql, (err, results) => {
      if (err) {
        // Handle error
    
        console.error(err);
        res.status(500).json({ message: 'Error retrieving products' });
      } else {
        res.json(results);
      }
    });
  });

  app.get('/krproduct', (req, res) => {
    // Assuming you have a database connection setup with a query function
    const sql = 'SELECT * FROM koreaproduct'; // Selects all products
    db.query(sql, (err, results) => {
      if (err) {
        // Handle error
    
        console.error(err);
        res.status(500).json({ message: 'Error retrieving products' });
      } else {
        res.json(results);
      }
    });
  });

  app.get('/malaysiarestaurant', (req, res) => {
    // Assuming you have a database connection setup with a query function
    const sql = 'SELECT * FROM malaysiarestaurant'; // Selects all products
    db.query(sql, (err, results) => {
      if (err) {
        // Handle error
    
        console.error(err);
        res.status(500).json({ message: 'Error retrieving products' });
      } else {
        res.json(results);
      }
    });
  });

  app.get('/thailandrestaurant', (req, res) => {
    // Assuming you have a database connection setup with a query function
    const sql = 'SELECT * FROM thailandrestaurant'; // Selects all products
    db.query(sql, (err, results) => {
      if (err) {
        // Handle error
    
        console.error(err);
        res.status(500).json({ message: 'Error retrieving products' });
      } else {
        res.json(results);
      }
    });
  });

  app.get('/korearestaurant', (req, res) => {
    // Assuming you have a database connection setup with a query function
    const sql = 'SELECT * FROM korearestaurant'; // Selects all products
    db.query(sql, (err, results) => {
      if (err) {
        // Handle error
    
        console.error(err);
        res.status(500).json({ message: 'Error retrieving products' });
      } else {
        res.json(results);
      }
    });
  });

  app.get('/masproduct/:id', (req, res) => {
    const productId = req.params.id; // Get the product ID from the route parameter
    const sql = 'SELECT * FROM malaysiaproduct WHERE productID = ?'; // SQL query to select the product by ID
    db.query(sql, [productId], (err, results) => {
        if (err) {
            // Handle error
            console.error(err);
            res.status(500).json({ message: 'Error retrieving product' });
        } else {
            if (results.length > 0) {
                res.json(results[0]); // Send back the found product
            } else {
                res.status(404).json({ message: 'Product not found' }); // No product found for the given ID
            }
        }
    });
});

app.post('/masproduct/add', upload.single('image'), (req, res) => {
  const { name, brand, date, status } = req.body;
  const initialImagePath = req.file ? req.file.path : 'default.jpg'; // Handle no file uploaded scenario
  
  const sqlInsert = 'INSERT INTO malaysiaproduct (name, brand, date, status, imageURL) VALUES (?, ?, ?, ?, ?)';
  db.query(sqlInsert, [name, brand, date, status, initialImagePath], (err, result) => {
    if (err) {
      console.error('Error adding new product:', err);
      return res.status(500).json({ message: 'Error adding new product', error: err.message });
    }

    const productId = result.insertId;
    const newFileName = `image_${productId}${path.extname(req.file.originalname)}`;
    const newPath = path.join(path.dirname(req.file.path), newFileName);

    fs.rename(req.file.path, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing image file', error: err.message });
      }

      // Update the database with the new image path
      const sqlUpdate = 'UPDATE malaysiaproduct SET imageURL = ? WHERE productID = ?';
      db.query(sqlUpdate, [newFileName, productId], (err) => {
        if (err) {
          console.error('Error updating product with new image path:', err);
          return res.status(500).json({ message: 'Error updating product image path', error: err.message });
        }
        res.json({ message: 'New product added successfully', productID: productId, newImagePath: newFileName });
      });
    });
  });
});


app.put('/masproduct/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, brand, date, status } = req.body;

  // First, handle the existing product details update
  const updateProduct = () => {
    const sqlUpdate = 'UPDATE malaysiaproduct SET name = ?, brand = ?, date = ?, status = ?, imageURL = ? WHERE productID = ?';
    db.query(sqlUpdate, [name, brand, date, status, newImagePath, id], (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ message: 'Error updating product', error: err.message });
      }
      res.json({ message: 'Product updated successfully', updatedImagePath: newImagePath });
    });
  };

  let newImagePath = req.body.imageURL; // Fallback to existing imageURL if no new file is uploaded

  if (req.file) {
    // A new image was uploaded, process the file
    const newFileName = `image_${id}${path.extname(req.file.originalname)}`;
    const newPath = path.join(req.file.destination, newFileName);

    // Rename the new file using the existing product ID
    fs.rename(req.file.path, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing image file', error: err.message });
      }

      newImagePath = newFileName; // Update the image path to the new file name
      updateProduct(); // Proceed to update the product details in the database
    });
  } else {
    // No new file uploaded, just update the product details
    updateProduct();
  }
});

app.get('/thaiproduct/:id', (req, res) => {
  const productId = req.params.id; // Get the product ID from the route parameter
  const sql = 'SELECT * FROM thailandproduct WHERE productID = ?'; // SQL query to select the product by ID
  db.query(sql, [productId], (err, results) => {
      if (err) {
          // Handle error
          console.error(err);
          res.status(500).json({ message: 'Error retrieving product' });
      } else {
          if (results.length > 0) {
              res.json(results[0]); // Send back the found product
          } else {
              res.status(404).json({ message: 'Product not found' }); // No product found for the given ID
          }
      }
  });
});

app.post('/thaiproduct/add', upload.single('image'), (req, res) => {
  const { name, brand, date, status } = req.body;
  const initialImagePath = req.file ? req.file.path : 'default.jpg'; // Handle no file uploaded scenario
  
  const sqlInsert = 'INSERT INTO thailandproduct (name, brand, date, status, imageURL) VALUES (?, ?, ?, ?, ?)';
  db.query(sqlInsert, [name, brand, date, status, initialImagePath], (err, result) => {
    if (err) {
      console.error('Error adding new product:', err);
      return res.status(500).json({ message: 'Error adding new product', error: err.message });
    }

    const productId = result.insertId;
    const newFileName = `image_${productId}${path.extname(req.file.originalname)}`;
    const newPath = path.join(path.dirname(req.file.path), newFileName);

    fs.rename(req.file.path, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing image file', error: err.message });
      }

      // Update the database with the new image path
      const sqlUpdate = 'UPDATE thailandproduct SET imageURL = ? WHERE productID = ?';
      db.query(sqlUpdate, [newFileName, productId], (err) => {
        if (err) {
          console.error('Error updating product with new image path:', err);
          return res.status(500).json({ message: 'Error updating product image path', error: err.message });
        }
        res.json({ message: 'New product added successfully', productID: productId, newImagePath: newFileName });
      });
    });
  });
});

app.put('/thaiproduct/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, brand, date, status } = req.body;

  // First, handle the existing product details update
  const updateProduct = () => {
    const sqlUpdate = 'UPDATE thailandproduct SET name = ?, brand = ?, date = ?, status = ?, imageURL = ? WHERE productID = ?';
    db.query(sqlUpdate, [name, brand, date, status, newImagePath, id], (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ message: 'Error updating product', error: err.message });
      }
      res.json({ message: 'Product updated successfully', updatedImagePath: newImagePath });
    });
  };

  let newImagePath = req.body.imageURL; // Fallback to existing imageURL if no new file is uploaded

  if (req.file) {
    // A new image was uploaded, process the file
    const newFileName = `image_${id}${path.extname(req.file.originalname)}`;
    const newPath = path.join(req.file.destination, newFileName);

    // Rename the new file using the existing product ID
    fs.rename(req.file.path, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing image file', error: err.message });
      }

      newImagePath = newFileName; // Update the image path to the new file name
      updateProduct(); // Proceed to update the product details in the database
    });
  } else {
    // No new file uploaded, just update the product details
    updateProduct();
  }
});

app.get('/krproduct/:id', (req, res) => {
  const productId = req.params.id; // Get the product ID from the route parameter
  const sql = 'SELECT * FROM koreaproduct WHERE productID = ?'; // SQL query to select the product by ID
  db.query(sql, [productId], (err, results) => {
      if (err) {
          // Handle error
          console.error(err);
          res.status(500).json({ message: 'Error retrieving product' });
      } else {
          if (results.length > 0) {
              res.json(results[0]); // Send back the found product
          } else {
              res.status(404).json({ message: 'Product not found' }); // No product found for the given ID
          }
      }
  });
});

app.post('/krproduct/add', upload.single('image'), (req, res) => {
  const { name, brand, status } = req.body;
  const initialImagePath = req.file ? req.file.path : 'default.jpg'; // Handle no file uploaded scenario
  
  const sqlInsert = 'INSERT INTO koreaproduct (name, brand, status, imageURL) VALUES (?, ?, ?, ?)';
  db.query(sqlInsert, [name, brand, status, initialImagePath], (err, result) => {
    if (err) {
      console.error('Error adding new product:', err);
      return res.status(500).json({ message: 'Error adding new product', error: err.message });
    }

    const productId = result.insertId;
    const newFileName = `image_${productId}${path.extname(req.file.originalname)}`;
    const newPath = path.join(path.dirname(req.file.path), newFileName);

    fs.rename(req.file.path, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing image file', error: err.message });
      }

      // Update the database with the new image path
      const sqlUpdate = 'UPDATE koreaproduct SET imageURL = ? WHERE productID = ?';
      db.query(sqlUpdate, [newFileName, productId], (err) => {
        if (err) {
          console.error('Error updating product with new image path:', err);
          return res.status(500).json({ message: 'Error updating product image path', error: err.message });
        }
        res.json({ message: 'New product added successfully', productID: productId, newImagePath: newFileName });
      });
    });
  });
});

app.put('/krproduct/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, brand, status } = req.body;

  // First, handle the existing product details update
  const updateProduct = () => {
    const sqlUpdate = 'UPDATE koreaproduct SET name = ?, brand = ?, status = ?, imageURL = ? WHERE productID = ?';
    db.query(sqlUpdate, [name, brand, status, newImagePath, id], (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ message: 'Error updating product', error: err.message });
      }
      res.json({ message: 'Product updated successfully', updatedImagePath: newImagePath });
    });
  };

  let newImagePath = req.body.imageURL; // Fallback to existing imageURL if no new file is uploaded

  if (req.file) {
    // A new image was uploaded, process the file
    const newFileName = `image_${id}${path.extname(req.file.originalname)}`;
    const newPath = path.join(req.file.destination, newFileName);

    // Rename the new file using the existing product ID
    fs.rename(req.file.path, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error processing image file', error: err.message });
      }

      newImagePath = newFileName; // Update the image path to the new file name
      updateProduct(); // Proceed to update the product details in the database
    });
  } else {
    // No new file uploaded, just update the product details
    updateProduct();
  }
});


app.get("/userProfile/:userID", (req, res) => {
  const { userID } = req.params;
  const sql = "SELECT * FROM user WHERE UserID = ?";
  db.query(sql, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({ message: "Error fetching user profile" });
    }
    if (results.length > 0) {
      const userProfile = results[0]; // Assuming only one user with this ID
      res.json(userProfile);
    } else {
      res.status(404).json({ message: "User not found with ID " + userID });
    }
  });
});


app.put('/updateUserProfile/:userID', (req, res) => {
  const userID = req.params.userID;
  const fieldName = Object.keys(req.body)[0]; // assuming the object has a single key
  const fieldValue = req.body[fieldName];

  // Construct your SQL query to update only the specified field
  const query = `UPDATE user SET ${fieldName} = ? WHERE UserID = ?`;
  const values = [fieldValue, userID];

  db.query(query, values, (error, results, fields) => {
      if (error) {
          res.status(500).send('Error updating user profile');
          return;
      }
      res.send('Profile updated successfully');
  });
});

app.put('/changePassword/:userID', (req, res) => {
  const userID = req.params.userID;
  const newPassword = req.body.newPassword; // Make sure you hash this password before storing

  // Replace with your actual database update logic, make sure to hash the password
  const query = 'UPDATE user SET password = ? WHERE UserID = ?';
  const values = [newPassword, userID]; // Use a proper hashing function like bcrypt

  db.query(query, values, (error, results) => {
    if (error) {
      res.status(500).send('Error updating password');
    } else {
      res.send('Password updated successfully');
    }
  });
});

app.get('/:datacountry/mosque/:id', (req, res) => {
  const datacountry = req.params.datacountry; // Get the datacountry from the route parameter
  const mosqueprId = req.params.id; // Get the product ID from the route parameter
  const sql = `SELECT * FROM ${datacountry}mosque WHERE mosqueprID = ?`; // SQL query to select the product by ID and datacountry
  db.query(sql, [mosqueprId], (err, results) => {
      if (err) {
          // Handle error
          console.error(err);
          res.status(500).json({ message: 'Error retrieving mosque' });
      } else {
          if (results.length > 0) {
              res.json(results[0]); // Send back the found product
          } else {
              res.status(404).json({ message: 'Mosque not found' }); // No product found for the given ID
          }
      }
  });
});

app.put('/malaysiamosque/:id', (req, res) => {
  console.log('mosquemalaysia')
  const mosqueprId = req.params.id;

  const { name, address, state, district, status } = req.body;

  const sql = `UPDATE malaysiamosque SET name = ?, address = ?, state = ?, district = ?, status = ? WHERE mosqueprID = ?`;

  db.query(sql, [name, address, state, district, status, mosqueprId], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Error updating mosque' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Mosque updated successfully' });
      } else {
        res.status(404).json({ message: 'Mosque not found' });
      }
    }
  });
});

app.post('/malaysiamosque/add', (req, res) => {
  const { name, address, state, district, status } = req.body;

  const sql = `INSERT INTO malaysiamosque (name, address, state, district, status) VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [name, address, state, district, status], (err, result) => {
    if (err) {
      console.error('Error adding new mosque:', err);
      res.status(500).json({ message: 'Error updating mosque' });
    } else {
      // Send a response back to the client
      res.json({ message: 'Prayer room added successfully', insertId: result.insertId });
    }
  });
});

app.put('/thailandmosque/:id', (req, res) => {
  
  const mosqueprId = req.params.id;

  const { name, address, state, status } = req.body;

  const sql = `UPDATE thailandmosque SET name = ?, address = ?, state = ?, status = ? WHERE mosqueprID = ?`;

  db.query(sql, [name, address, state,status, mosqueprId], (err, result) => {
    if (err) {
      console.error('Error updating mosque:', err);
      res.status(500).json({ message: 'Error updating mosque' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Mosque updated successfully' });
      } else {
        res.status(404).json({ message: 'Mosque not found' });
      }
    }
  });
});

app.post('/thailandmosque/add', (req, res) => {
  const { name, address, state, status } = req.body;

  const sql = `INSERT INTO thailandmosque (name, address, state, status) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, address, state, status], (err, result) => {
    if (err) {
      console.error('Error adding new mosque:', err);
      res.status(500).json({ message: 'Error updating mosque' });
    } else {
      // Send a response back to the client
      res.json({ message: 'Prayer room added successfully', insertId: result.insertId });
    }
  });
});

app.put('/koreamosque/:id', (req, res) => {

  const mosqueprId = req.params.id;
 
  const { name, address, state, status } = req.body;

  const sql = `UPDATE koreamosque SET name = ?, address = ?, state = ?, status = ? WHERE mosqueprID = ?`;

  db.query(sql, [name, address, state, status, mosqueprId], (err, result) => {
    if (err) {
      console.error('Error updating mosque:', err);
      res.status(500).json({ message: 'Error updating mosque' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Mosque updated successfully' });
      } else {
        res.status(404).json({ message: 'Mosque not found' });
      }
    }
  });
});

app.post('/koreamosque/add', (req, res) => {
  const { name, address, state, status } = req.body;

  const sql = `INSERT INTO koreamosque (name, address, state, status) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, address, state, status], (err, result) => {
    if (err) {
      console.error('Error adding new mosque:', err);
      res.status(500).json({ message: 'Error updating mosque' });
    } else {
      // Send a response back to the client
      res.json({ message: 'Prayer room added successfully', insertId: result.insertId });
    }
  });
});

app.get('/:datacountry/pr/:id', (req, res) => {
  const datacountry = req.params.datacountry; // Get the datacountry from the route parameter
  const mosqueprId = req.params.id; // Get the product ID from the route parameter
  const sql = `SELECT * FROM ${datacountry}pr WHERE mosqueprID = ?`; // SQL query to select the product by ID and datacountry
  db.query(sql, [mosqueprId], (err, results) => {
      if (err) {
          // Handle error
          console.error(err);
          res.status(500).json({ message: 'Error retrieving mosque' });
      } else {
          if (results.length > 0) {
              res.json(results[0]); // Send back the found product
          } else {
              res.status(404).json({ message: 'Mosque not found' }); // No product found for the given ID
          }
      }
  });
});

app.put('/malaysiapr/:id', (req, res) => {
  
  const mosqueprId = req.params.id;

  const { name, address, state, district, status } = req.body;

  const sql = `UPDATE malaysiapr SET name = ?, address = ?, state = ?, district = ?, status = ? WHERE mosqueprID = ?`;

  db.query(sql, [name, address, state, district, status, mosqueprId], (err, result) => {
    if (err) {
      console.error('Error updating prayer room:', err);
      res.status(500).json({ message: 'Error updating mosque' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Mosque updated successfully' });
      } else {
        res.status(404).json({ message: 'Mosque not found' });
      }
    }
  });
});

app.post('/malaysiapr/add', (req, res) => {
  const { name, address, state, district, status } = req.body;

  const sql = `INSERT INTO koreapr (name, address, state, district, status) VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [name, address, state, district, status], (err, result) => {
    if (err) {
      console.error('Error adding new prayer room:', err);
      res.status(500).json({ message: 'Error updating prayer room' });
    }else {
      // Send a response back to the client
      res.json({ message: 'Prayer room added successfully', insertId: result.insertId });
    }
  });
});

app.put('/thailandpr/:id', (req, res) => {
  const mosqueprId = req.params.id;
  
  const { name, address, state, status} = req.body;

  const sql = `UPDATE thailandpr SET name = ?, address = ?, state = ?, status = ? WHERE mosqueprID = ?`;

  db.query(sql, [name, address, state, status, mosqueprId], (err, result) => {
    if (err) {
      console.error('Error updating prayer room:', err);
      res.status(500).json({ message: 'Error updating prayer room' });
    } else {
    
      if (result.affectedRows > 0) {
        res.json({ message: 'Prayer Room updated successfully' });
      } else {
        res.status(404).json({ message: 'Prayer Room not found' });
      }
    }
  });
});

app.post('/thailandpr/add', (req, res) => {
  const { name, address, state, status } = req.body;

  const sql = `INSERT INTO thailandpr (name, address, state, status) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, address, state, status], (err, result) => {
    if (err) {
      console.error('Error adding new prayer room:', err);
      res.status(500).json({ message: 'Error updating prayer room' });
    } else {
      // Send a response back to the client
      res.json({ message: 'Prayer room added successfully', insertId: result.insertId });
    }
  });
});

app.put('/koreapr/:id', (req, res) => {
  const mosqueprId = req.params.id;

  const { name, address, state, status } = req.body;

  const sql = `UPDATE koreapr SET name = ?, address = ?, state = ?, status = ? WHERE mosqueprID = ?`;

  db.query(sql, [name, address, state, status, mosqueprId], (err, result) => {
    if (err) {
      // If an error occurs, log it and return a server error response
      console.error('Error updating prayer room:', err);
      res.status(500).json({ message: 'Error updating prayer room' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Prayer Room updated successfully' });
      } else {
        res.status(404).json({ message: 'Prayer Room not found' });
      }
    }
  });
});

app.post('/koreapr/add', (req, res) => {
  const { name, address, state, status } = req.body;

  const sql = `INSERT INTO koreapr (name, address, state, status) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, address, state, status], (err, result) => {
    if (err) {
      console.error('Error adding new prayer room:', err);
      res.status(500).json({ message: 'Error updating prayer room' });
    } else {
      // Send a response back to the client
      res.json({ message: 'Prayer room added successfully', insertId: result.insertId });
    }
  });
});


app.get('/:datacountry/restaurant/:id', (req, res) => {
  const datacountry = req.params.datacountry; // Get the datacountry from the route parameter
  const restaurantId = req.params.id; // Get the product ID from the route parameter
  const sql = `SELECT * FROM ${datacountry}restaurant WHERE restaurantID = ?`; // SQL query to select the product by ID and datacountry
  db.query(sql, [restaurantId], (err, results) => {
      if (err) {
          // Handle error
          console.error(err);
          res.status(500).json({ message: 'Error retrieving mosque' });
      } else {
          if (results.length > 0) {
              res.json(results[0]); // Send back the found product
          } else {
              res.status(404).json({ message: 'Mosque not found' }); // No product found for the given ID
          }
      }
  });
});

app.put('/malaysiarestaurant/:id', (req, res) => {
  const restaurantId = req.params.id;

  const { name, address, region, date, status, description, category} = req.body;

  const sql = `UPDATE malaysiarestaurant SET name = ?, address = ?, region = ?, date = ?, status = ?, description= ?, category = ? WHERE restaurantID = ?`;

  db.query(sql, [ name, address, region, date, status, description, category, restaurantId], (err, result) => {
    if (err) {
      console.error('Error updating restaurant:', err);
      res.status(500).json({ message: 'Error updating restaurant' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Restaurant updated successfully' });
      } else {
        res.status(404).json({ message: 'Restaurant not found' });
      }
    }
  });
});

app.post('/malaysiarestaurant/add', (req, res) => {
  const { name, address, region, date, status, description, category } = req.body;

  const sql = `INSERT INTO malaysiarestaurant (name, address, region, date, status, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, address, region, date, status, description, category], (err, result) => {
    if (err) {
      console.error('Error adding new restaurant:', err);
      res.status(500).json({ message: 'Error adding new restaurant' });
    } else {
      res.status(201).json({ message: 'Restaurant added successfully', restaurantID: result.insertId });
    }
  });
});


app.put('/thailandrestaurant/:id', (req, res) => {
  const restaurantId = req.params.id;

  const { name, address, region, status } = req.body;

  const sql = `UPDATE thailandrestaurant SET name = ?, address = ?, region = ?, status = ? WHERE restaurantID = ?`;

  db.query(sql, [ name, address, region, status, restaurantId], (err, result) => {
    if (err) {
      console.error('Error updating restaurant:', err);
      res.status(500).json({ message: 'Error updating restaurant' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Restaurant updated successfully' });
      } else {
        res.status(404).json({ message: 'Restaurant not found' });
      }
    }
  });
});

app.post('/thailandrestaurant/add', (req, res) => {
  const { name, address, region, status, description, category } = req.body;

  const sql = `INSERT INTO thailandrestaurant (name, address, region, status, description= ?, category = ?) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, address, region, status, description, category], (err, result) => {
    if (err) {
      console.error('Error adding new restaurant:', err);
      res.status(500).json({ message: 'Error adding new restaurant' });
    } else {
      res.status(201).json({ message: 'Restaurant added successfully', restaurantID: result.insertId });
    }
  });
});

app.put('/korearestaurant/:id', (req, res) => {
  const restaurantId = req.params.id;

  const { name, address, region, status } = req.body;

  const sql = `UPDATE korearestaurant SET name = ?, address = ?, region = ?, status = ? WHERE restaurantID = ?`;

  db.query(sql, [ name, address, region, status, restaurantId], (err, result) => {
    if (err) {
      console.error('Error updating restaurant:', err);
      res.status(500).json({ message: 'Error updating restaurant' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Restaurant updated successfully' });
      } else {
        res.status(404).json({ message: 'Restaurant not found' });
      }
    }
  });
});

app.post('/korearestaurant/add', (req, res) => {
  const { name, address, region, status, description, category } = req.body;

  const sql = `INSERT INTO korearestaurant (name, address, region, status, description= ?, category = ?) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, address, region, status, description, category], (err, result) => {
    if (err) {
      console.error('Error adding new restaurant:', err);
      res.status(500).json({ message: 'Error adding new restaurant' });
    } else {
      res.status(201).json({ message: 'Restaurant added successfully', restaurantID: result.insertId });
    }
  });
});

app.get('/:country/:category/reviewed', async (req, res) => {
  const { country, category } = req.params;
  let tableCategory = ''
  if (category == 'products')
      tableCategory = 'product'
  else if(category == 'restaurants')
      tableCategory ='restaurant'
  else if(category =='mosques')
      tableCategory ='mosque'
  else if(category =="prayer room")
    tableCategory = 'pr'
  
  const tableName = `${country}${tableCategory}`;
  try {
      const sql = `SELECT * FROM ${tableName} WHERE status = 'reviewed'`;
      const results = await query(sql);
      res.json(results);
  } catch (error) {
      console.error('Error fetching reviewed items:', error);
      res.status(500).json({ message: 'Error fetching data', error });
  }
});

app.put('/:country/:category/:id/status', async (req, res) => {
  const { country, category, id } = req.params;
  const { status } = req.body; // Assuming status is sent in the body of the request
  let tableCategory = '';
  let idColumnName = '';

  switch (category) {
    case 'products':
      tableCategory = 'product';
      idColumnName = 'productID';
      break;
    case 'restaurants':
      tableCategory = 'restaurant';
      idColumnName = 'restaurantID';
      break;
    case 'prayerroom':
      tableCategory = 'pr';
      idColumnName = 'mosqueprID';
      break;
    case 'mosques':
      tableCategory = 'mosque';
      idColumnName = 'mosqueprID';
      break;
    default:
      res.status(400).json({ message: 'Invalid category' });
      return;
  }

  const tableName = `${country}${tableCategory}`;

  try {
    const sql = `UPDATE ${tableName} SET status = ? WHERE ${idColumnName} = ?`;
    await query(sql, [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating data', error });
  }
});

app.get('/review-counts', async (req, res) => {
  const categories = ['product', 'restaurant', 'mosque', 'pr']; // assuming these are your categories
  const countries = ['malaysia', 'korea', 'thailand']; // assuming these are your countries

  try {
    const results = await Promise.all(countries.map(async (country) => {
      return Promise.all(categories.map(async (category) => {
        const tableName = `${country}${category}`;
        const count = await query(`SELECT COUNT(*) AS count FROM ${tableName} WHERE status = 'reviewed'`);
        return {[category]: count[0].count};
      }));
    }));

    const counts = countries.reduce((acc, country, index) => {
      acc[country] = results[index].reduce((obj, item) => ({...obj, ...item}), {});
      return acc;
    }, {});

    res.json(counts);
  } catch (error) {
    console.error('Error fetching review counts:', error);
    res.status(500).json({ message: 'Error fetching data', error });
  }
});


app.listen(8085, ()=> {console.log("listening");})