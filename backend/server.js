const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
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
  const sql = "SELECT username, profilePic FROM user WHERE userID = ?";
  db.query(sql, [userID], (err, results) => {
      if (err) {
          console.error("Error fetching user profile:", err);
          return res.status(500).json({ message: "Error fetching user profile" });
      }
      if (results.length > 0) {
          const { username, profilePic } = results[0];
          res.json({ username, profilePic });
      } else {
          res.status(404).json({ message: "User not found" });
      }
  });
});

app.post("/updateUserProfile/:userID", upload.single('profilePic'), (req, res) => {
  const { userID } = req.params;
  const { username } = req.body;
  const profilePic = req.file ? req.file.path : null;

  let sql = "UPDATE user SET username = ?, profilePic = ? WHERE UserID = ?";
  let values = [username, profilePic, userID];
  
  db.query(sql, values, (err, result) => {
      if (err) {
          console.error("Error updating user profile:", err);
          return res.status(500).json({ message: "Error updating user profile" });
      }
      res.json({ message: "Profile updated successfully" });
  });
});

app.put("/changeUserPassword/:userID", (req, res) => {
  const { userID, newPassword } = req.body;
  const sql = "UPDATE user SET password = ? WHERE UserID = ?";
  
  db.query(sql, [newPassword, userID], (err, result) => {
      if (err) {
          console.error("Error changing password:", err);
          return res.status(500).json({ message: "Error changing password" });
      }
      res.json({ message: "Password updated successfully" });
  });
});

app.put('/malaysiamosque/:id', (req, res) => {
  // Extract the product ID from the URL path
  const productId = req.params.id;
  // Extract updated data from the request body
  const { name, brand, date } = req.body;

  // Construct the SQL query for updating the product information
  const sql = `UPDATE malaysiaproduct SET name = ?, brand = ?, date = ? WHERE productID = ?`;

  // Execute the query with the provided data
  db.query(sql, [name, brand, date, productId], (err, result) => {
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