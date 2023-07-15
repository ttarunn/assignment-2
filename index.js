const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const postModel = require('./src/model/postModel');
const middleware = require('./src/authMiddleware/auth');
const bodyParser = require('body-parser');
const userModel = require('./src/model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// config for reading env variables

dotenv.config();

// mongoDB connection

mongoose.connect(process.env.DataBaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })

//User Registration And Login Endpoints

app.post('/register', (req, res) => {
    const body = req.body;
    if(body.name || body.email || body.password){
        bcrypt.hash(body.password, 10).then(encryptedData => {
            const userDetail = new userModel({
                name: body.name,
                email: body.email,
                password: encryptedData
            });
    
            userDetail.save().then((user) => {
                res.status(201).json({
                    status: "Success",
                    data: user
                })
            }).catch(err => {
                res.status(500).json({
                    status: "Failed To Encrypt"
                })
            })
    
        }).catch(err => {
            res.status(500).json({
                status: "Error While Encrypting",
                err: "Invalid Details"
            })
        })
    }else{
        res.status(400).json({
            status: "Invalid Details",
        })
    }
});

app.post("/login", (req, res) => {
    const body = req.body;
    userModel.findOne({ email: body.email }).then(user => {
        if (user) {
            bcrypt.compare(body.password, user.password).then(status => {
                if (status) {
                    const signedToken = jwt.sign({
                        id: user._id,
                        email: user.email
                    },
                        process.env.JWT_PASSWORD,
                        {
                            expiresIn: "1hr"
                        });
                    res.status(201).json({
                        status: "Success",
                        token: signedToken
                    })
                } else {
                    res.status(400).json({
                        status: "Email or Password Incorrect",
                    })
                }
            })
        } else {
            res.status(401).json({
                status: "No Data Found",
            })
        }
    })
});


// CRUD Operations

app.post('/posts', middleware, (req, res) => {
    const token = req.jwt_token
    const post = new postModel({
        title: req.body.title,
        body: req.body.body,
        image: req.body.image,
        user: token.email
    });

    post.save().then(data => {
        res.status(201).json({
            status: "post created",
            data: data
        })
    }).catch(err => {
        res.status(500).json({
            status: "Failed To Create Post.",
            err: err.message
        })
    })
});

app.get('/posts', middleware, (req, res) => {

    postModel.find().then(data => {
        res.status(200).json({
            status: "Success",
            posts: data
        })
    }).catch(err => {
        res.status(404).json({
            status: "No Post Found"
        })
    })
});

app.put('/posts/:postId', middleware, (req, res) => {
    const id = req.params.postId;
    const body = req.body;
    const token = req.jwt_token
    const filter = {
        _id: id,
        user: token.email
    }
    postModel.findOneAndUpdate(filter, body).then(result => {
        if (result) {
            res.status(201).json({
                status: "Success",
            })
        } else {
            res.status(400).json({
                status: "Some Details are Incorrect",
            })
        }
    }).catch(err => {
        res.status(404).json({
            status: "Something Wrong"
        })
    })
});

app.delete('/posts/:postId', middleware, (req, res) => {
    const id = req.params.postId;
    const token = req.jwt_token;
    const filter = {
        _id: id,
        user: token.email
    }
    postModel.findOneAndDelete(filter).then(result => {
        if (result) {
            res.status(201).json({
                status: "Successfully deleted"
            })
        } else {
            res.status(400).json({
                status: "User Not Found"
            })
        }
    }).catch(err => {
        res.status(400).json({
            status: "Some Error Occured"
        })
    })
});


app.use((req, res) => {
    res.send("Hello Welcome To Our Api Home Page!")
});

app.listen(3000, () => {
    console.log("Server is Listening...")
});