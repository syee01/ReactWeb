const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const util = require('util')
const { check, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

// create to mysql database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myhalalchecker"
})

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

app.get('/user-count', async (req, res) => {
  try {
      const rows = await query('SELECT COUNT(*) AS count FROM user WHERE role = ?', ['user']);
      res.json({ usersCount: rows[0].count });
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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
  const { reportId, halalStatus, comment } = req.body;
  
  let tableName = '';
  if (category === 'Products') {
    tableName = 'product_reports';
  } else if (category === 'Restaurants') {
    tableName = 'restaurant_reports';
  } else {
    res.status(400).send('Invalid category');
    return;
  }

  const sql = `UPDATE ${tableName} SET HalalStatus = ?, Comment = ?, Status = 'To Be Confirmed' WHERE ReportID = ?`;
  db.query(sql, [halalStatus, comment, reportId], (err, result) => {
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
  const { reportId, halalStatus, comment } = req.body;
  
  let tableName = '';
  if (category === 'Products') {
    tableName = 'product_enquiry';
  } else if (category === 'Restaurants') {
    tableName = 'restaurant_enquiry';
  } else {
    res.status(400).send('Invalid category');
    return;
  }

  const sql = `UPDATE ${tableName} SET HalalStatus = ?, Comment = ?, Status = 'To Be Confirmed' WHERE ReportID = ?`;
  db.query(sql, [halalStatus, comment, reportId], (err, result) => {
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
      console.log('Error updating report:', error);
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
      console.log('here')
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
      console.log('here')
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
      console.log('here')
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
      console.log('here')
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
      console.log('here')
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
      console.log('here')
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
        console.log('here')
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
        console.log('here')
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
        console.log('here')
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
        console.log('here')
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
        console.log('here')
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
        console.log('here')
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

// app.put to handle update requests
// app.put('/masproduct/:id', (req, res) => {
//   // Extract the product ID from the URL path
//   const productId = req.params.id;
//   // Extract updated data from the request body
//   const { name, brand, date } = req.body;

//   // Construct the SQL query for updating the product information
//   const sql = `UPDATE malaysiaproduct SET name = ?, brand = ?, date = ? WHERE productID = ?`;

//   // Execute the query with the provided data
//   db.query(sql, [name, brand, date, productId], (err, result) => {
//     if (err) {
//       // If an error occurs, log it and return a server error response
//       console.error('Error updating product:', err);
//       res.status(500).json({ message: 'Error updating product' });
//     } else {
//       // If the update is successful, return a success response
//       // result.affectedRows checks how many rows were affected. If no rows were affected, it means the product was not found
//       if (result.affectedRows > 0) {
//         res.json({ message: 'Product updated successfully' });
//       } else {
//         res.status(404).json({ message: 'Product not found' });
//       }
//     }
//   });
// });

app.put('/masproduct/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, brand, date } = req.body;
  let newImagePath = req.file ? req.file.path : '';

  if (req.file) {
    // A new image was uploaded, process the file
    const newFileName = `image_${id}${path.extname(req.file.originalname)}`;
    newImagePath = newFileName;
  } else {
    // No new image was uploaded, use the original imageURL
    newImagePath = req.body.imageURL;
  }
  const sql = 'UPDATE malaysiaproduct SET name = ?, brand = ?, date = ?, imageURL = ? WHERE productID = ?';
  db.query(sql, [name, brand, date, newImagePath, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Error updating product', error: err.message });
    }
    res.json({ message: 'Product updated successfully' });
  });
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

app.put('/thaiproduct/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, brand, date } = req.body;
  let newImagePath = req.file ? req.file.path : '';

  if (req.file) {
    // A new image was uploaded, process the file
    const newFileName = `image_${id}${path.extname(req.file.originalname)}`;
    newImagePath = newFileName;
  } else {
    // No new image was uploaded, use the original imageURL
    newImagePath = req.body.imageURL;
  }
  const sql = 'UPDATE thailandproduct SET name = ?, brand = ?, date = ?, imageURL = ? WHERE productID = ?';
  db.query(sql, [name, brand, date, newImagePath, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Error updating product', error: err.message });
    }
    res.json({ message: 'Product updated successfully' });
  });
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

app.put('/krproduct/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, brand } = req.body;
  let newImagePath = req.file ? req.file.path : '';

  if (req.file) {
    // A new image was uploaded, process the file
    const newFileName = `image_${id}${path.extname(req.file.originalname)}`;
    newImagePath = newFileName;
  } else {
    // No new image was uploaded, use the original imageURL
    newImagePath = req.body.imageURL;
  }
  const sql = 'UPDATE koreaproduct SET name = ?, brand = ?, imageURL = ? WHERE productID = ?';
  db.query(sql, [name, brand, newImagePath, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Error updating product', error: err.message });
    }
    res.json({ message: 'Product updated successfully' });
  });
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

  // Perform the database query
  // Replace with your actual database code
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

app.get('/malaysiamosque/:id', (req, res) => {
  const mosqueprId = req.params.id; // Get the product ID from the route parameter
  const sql = 'SELECT * FROM malaysiamosque WHERE mosqueprID = ?'; // SQL query to select the product by ID
  db.query(sql, [mosqueprId], (err, results) => {
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


app.put('/malaysiamosque/:id', (req, res) => {
  // Extract the product ID from the URL path
  const mosqueprId = req.params.id;
  // Extract updated data from the request body
  const { name, address, state, district } = req.body;

  // Construct the SQL query for updating the product information
  const sql = `UPDATE malaysiamosque SET name = ?, address = ?, state = ?, district = ? WHERE mosqueprID = ?`;

  // Execute the query with the provided data
  db.query(sql, [name, address, state, district, mosqueprId], (err, result) => {
    if (err) {
      // If an error occurs, log it and return a server error response
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Error updating product' });
    } else {
      // If the update is successful, return a success response
      // result.affectedRows checks how many rows were affected. If no rows were affected, it means the product was not found
      if (result.affectedRows > 0) {
        res.json({ message: 'Product updated successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  });
});

app.get('/thailandmosque/:id', (req, res) => {
  const mosqueprId = req.params.id; // Get the product ID from the route parameter
  const sql = 'SELECT * FROM thailandmosque WHERE mosqueprID = ?'; // SQL query to select the product by ID
  db.query(sql, [mosqueprId], (err, results) => {
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


app.put('/thailandmosque/:id', (req, res) => {
  // Extract the product ID from the URL path
  const mosqueprId = req.params.id;
  // Extract updated data from the request body
  const { name, address, state } = req.body;

  // Construct the SQL query for updating the product information
  const sql = `UPDATE thailandmosque SET name = ?, address = ?, state = ? WHERE mosqueprID = ?`;

  // Execute the query with the provided data
  db.query(sql, [name, address, state, mosqueprId], (err, result) => {
    if (err) {
      // If an error occurs, log it and return a server error response
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Error updating product' });
    } else {
      // If the update is successful, return a success response
      // result.affectedRows checks how many rows were affected. If no rows were affected, it means the product was not found
      if (result.affectedRows > 0) {
        res.json({ message: 'Product updated successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  });
});


app.get('/koreamosque/:id', (req, res) => {
  const mosqueprId = req.params.id; // Get the product ID from the route parameter
  const sql = 'SELECT * FROM koreamosque WHERE mosqueprID = ?'; // SQL query to select the product by ID
  db.query(sql, [mosqueprId], (err, results) => {
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


app.put('/koreamosque/:id', (req, res) => {
  // Extract the product ID from the URL path
  const mosqueprId = req.params.id;
  // Extract updated data from the request body
  const { name, address, state } = req.body;

  // Construct the SQL query for updating the product information
  const sql = `UPDATE koreamosque SET name = ?, address = ?, state = ? WHERE mosqueprID = ?`;

  // Execute the query with the provided data
  db.query(sql, [name, address, state, mosqueprId], (err, result) => {
    if (err) {
      // If an error occurs, log it and return a server error response
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Error updating product' });
    } else {
      // If the update is successful, return a success response
      // result.affectedRows checks how many rows were affected. If no rows were affected, it means the product was not found
      if (result.affectedRows > 0) {
        res.json({ message: 'Product updated successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  });
});

app.listen(8085, ()=> {console.log("listening");})