const express = require("express");
const mysql = require ('mysql');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

// create to mysql database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "user"
})

// write login error 
app.post('/login',[ check('email', "Emaill length error").isEmail().isLength({min: 10, max:30}),    
check('password', "password length 8-10").isLength({min: 1, max: 10})], 
(req, res) => {    const sql = "SELECT * FROM login WHERE email = ? AND password = ?";    
// get login result (successful or failed)
db.query(sql, [req.body.email,req.body.password ], 
    (err, data) => {
        const errors = validationResult(req);        
        if(!errors.isEmpty()) {           
             return res.json(errors);        
        } else {            
            if(err) {                
                return res.json("Error");            
            }            
            if(data.length > 0) {               
                 return res.json("Success");            
            } 
            else {               
                 return res.json("Failed");            
            }        
        }            
    })})
    
app.listen(8085, ()=> {console.log("listening");})