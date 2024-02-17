const express = require('express')
const cors = require('cors')
const {decodeDataFrame} = require('../util')
const bodyParser = require('body-parser')

app = express()
app.use(cors())
// app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.text())


app.get('/', (req,res)=>{
    res.send("welcome");
});

app.post('/', (req,res)=>{
  frameData = decodeDataFrame(req.body);
 
});

app.listen(3000 , ()=>{
    console.log("Server is running on http://localhost:3000")
});


module.exports = app