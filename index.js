const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userModel = require('./models/userModel');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const downloadImage = require('image-downloader');
const path = require('path')
const { json } = require('body-parser');
const { error } = require('console');
const exp = require('constants');
const multer = require('multer');
const fs = require('fs');
const placeModel = require('./models/place');
const { title } = require('process');
const { default: axios } = require('axios');
const BookingModel = require('./models/bookingSchema');
const { rejects } = require('assert');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 9000; // Use PORT from environment variable or default to 4000
app.use('/models/uploads', express.static(path.join(__dirname, 'models', 'uploads')));


app.use(cookieParser())
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://127.0.0.1:3000',
}));

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test endpoint
app.get('/test', (req, res) => {
  res.json('tested ok');
  console.log("API working");
});

// Register endpoint
app.post('/register', async (req, res) => {
  console.log('Register test');
  try {
    const { name, email, password } = req.body;
    const bcryptSalt = bcrypt.genSaltSync(10); // Generate salt with 10 rounds

    if (!password) {
      return res.json({ error: 'Password is required' });
    }

    // Hash password using bcrypt
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    // Create a new user using the UserModel
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
     
      res.json({ message: 'User registered successfully' });
    } else {
     
      res.status(500).json({ error: 'Error in registration' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "password is required" })
  }
  try {
    // Find user by email
    const userDoc = await userModel.findOne({ email: email });
    const response = {
      email: userDoc.email,
      name: userDoc.name,
    }
   
    if (!userDoc) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    if (userDoc.password == null) {
      return res.status(402).json({ error: "Password must!" })
    }
  

    // Compare passwords
    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
      const accessToken = jwt.sign(
        { email: userDoc.email, name: userDoc.name, id:userDoc.id,  },
        "jwt-access-token",
        { expiresIn: '5d' }
      );
      const refreshToken = jwt.sign(
        { email, password },
        "jwt-refresh-token",
        { expiresIn: '5d' }
      );

      const isProduction = process.env.NODE_ENV === 'production';

    
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction, // Set secure only in production
        sameSite: 'lax',
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction, // Set secure only in production
        sameSite: 'lax',
      });

      if (userDoc) {
        return res.json(response)
      }
    
      return res.json({ accessToken });
      
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Profile endpoint
app.get('/profile', (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      // Respond with 401 if the token is not provided
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Verify the token
    jwt.verify(token, "jwt-access-token", {}, (err, user) => {
      if (err) {
        // If the token is invalid, respond with 401
        return res.status(401).json({ error: 'Token invalid or expired' });
      }

      // If the token is valid, respond with the user data
      res.json(user);
     
    });

  } catch (error) {
    console.error('Error in profile endpoint:', error);
    // Respond with 500 in case of a server error
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  res.cookie('token', '').json({
    success: true,
    message: "Logout successful"
  })
  res.json("api triggered successfully")
})



app.post('/upload-by-links', async (req, res) => {
  const { link } = req.body;

  if (!link || typeof link !== 'string' || !link.trim()) {
    return res.status(400).json({ error: 'Image link is required' });
  }

  const NewName = 'photos' + Date.now() + '.jpg';
  const destPath = path.join(__dirname, 'models', 'uploads', NewName);

  try {
   

    await downloadImage.image({
      url: link,
      dest: destPath
    });

    res.json(NewName);
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ error: 'Failed to download image' });
  }
});
const PhotoMiddleWare = multer({ dest: path.join(__dirname, 'models', 'uploads') })
app.post('/uploads', PhotoMiddleWare.array('photos', 10), (req, res) => {

  const uploadedFiles = [];

  req.files.forEach(file => {
    const filename = file.filename
    const path = file.path
    const originalName = file.originalname
    if (originalName) {
      const parts = originalName.split('.')
      const exe = parts[parts.length - 1]
      const newPath = `${path}.${exe}`
      fs.renameSync(path, newPath);
  
      uploadedFiles.push(`${filename}.${exe}`)

    } else {
      console.log("there was no oroginal path")
    }
  })

  

  res.json(uploadedFiles)
 




});

app.post('/places', (req, res) => {

  try {
    const token = req.cookies.accessToken;
    const {title,description,address,photos:addedphotos,perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body
    if (token) {
    
     
          jwt.verify(token, "jwt-access-token", {}, async (err, userData) => {
            if(err) throw err;
          const placeDoc =   await placeModel.create({
               owner:userData.id,
               title,description,address,
               photos:addedphotos,perks,extraInfo,
               checkIn,checkOut,maxGuests,price
             })
             
             res.json(placeDoc)
           
        

        })
       
    
    } else {
      res.json("No token found")
    }
  } catch (err) {
    console.log(err)
  }


})
// app.post('/places', (req,res) => {
//      const {token} = req.cookies.accessToken;
//      const {
//             title,description,address,
//             photos,perks,extraInfo,
//             checkIn,checkOut,maxGuests
//           } = req.body;
    
// } )
app.get('/places', (req,res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      console.log("Token not found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, "jwt-access-token", async (err, userData) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json({ error: "Forbidden" });
      }

      try {
        // Optimize the query by selecting only necessary fields
        const response = await placeModel.find({ owner: userData.id }).select('title photos address price');

        if (!response) {
          return res.status(404).json({ error: "No places found" });
        }

        return res.json(response);
      } catch (err) {
        console.error("Database query failed:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  })
  app.get('/places/:blog', async (req, res) => {
    const { blog } = req.params;

    if (!blog) {
        return res.status(400).json({ error: "Blog ID is required" });
    }

    if (blog === "new") {
        return res.status(204).send(); // No Content for "new" blog
    }

    try {
        const place = await placeModel.findById(blog).lean().exec();
        
        if (!place) {
            return res.status(404).json({ error: "Place not found" });
        }

        return res.json(place);
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while fetching the place" });
    }
});

app.put('/places', async (req,res) =>{
  const token = req.cookies.accessToken;
  const {blog,title,description,address,photos:addedphotos,perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body

  
  jwt.verify(token,"jwt-access-token", {}, async (err,userData) => {
    const PlaceDoc = await placeModel.findById(blog)
          if(userData.id == PlaceDoc.owner) {
            PlaceDoc.set({
               title,description,address,
               photos:addedphotos,perks,extraInfo,
               checkIn,checkOut,maxGuests,price
            })
           await PlaceDoc.save()
            res.json("ok")
          }
       
  })
   
     
})
function getUserDataFromToken(req) {
  return new Promise((resolve,reject) => {
    jwt.verify(req.cookies.accessToken,"jwt-access-token", {}, async (err,userData) => {
      if (err) {
       reject(err)
      }
   resolve(userData)
 }) 
  })
}
app.post('/booking', async (req,res) => {
  try {
    const {
      checkIn,
      checkOut,
      noOfGuests,
      numberOfDays,
      name,
      mobile,
      place,
      price,
    
    } = req.body;
    const userData = await getUserDataFromToken(req)
  if(userData) {
    const booking = await BookingModel.create({
      owner: userData.id,
      checkIn,
      checkOut,
      noOfGuests,
      numberOfDays,
      name,
      mobile,
      place,
      price,
      
      
    });
    console.log(userData)
    return res.status(201).json(booking);
  }


    
   
   
  } catch (err) {
    
    console.error('Error creating booking:', err);
    return res.status(500).json({ error: 'An error occurred while creating the booking' });
  }
})

app.get('/booking', async (req,res) => {
  const userData =  await getUserDataFromToken(req);
  const bookingData = await BookingModel.find({owner:userData.id})
  res.json(bookingData)
})



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
