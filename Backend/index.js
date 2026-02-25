//1.importexpress
const express = require('express')
var cors=require('cors')
require("./connection")
var empModel=require("./model/employee")

//2.initialize

var app=express()
//mid
app.use(express.json());
app.use(cors())

//3.api creation
app.post("/add",async(req,res)=>{
    try {
        await empModel(req.body).save()
        res.send({message:"data added"})
    } catch (error) {
        console.log(error);
        
    }

})
app.get("/view",async(req,res)=>{
    try {
        const x = await empModel.find();
        res.send(x);
        
    } catch (error) {
        console.log(error);
        
    }

})
app.delete("/remove/:id",async(req,res)=>{
    try {
         await empModel.findByIdAndDelete(req.params.id);
        res.send({ message:"successfully deleted"});
        
    } catch (error) {
        console.log(error);
        
    }

})
app.put("/update/:id",async(req,res)=>{
    try {
         var v=await empModel.findByIdAndUpdate(req.params.id,req.body);
        res.send({ message:"successfully updated"});
        
    } catch (error) {
        console.log(error);
        
    }

})

app.get('/', (req, res) => {
    res.send('Hello World')
})
app.get('/sample', (req, res) => {
    res.send("sample message")
})

//4.port setting
app.listen(3004,()=>{
    console.log("port is running at 3004")
})