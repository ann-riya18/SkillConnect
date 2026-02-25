const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ann-riya18:1812005@cluster0.zwffitz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() =>{
     console.log('Connected!')
    })
  .catch((err)=>{
        console.log(err)
    })