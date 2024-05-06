require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const cors = require("cors");
const router = require("./Routes/router")
const cookiParser = require("cookie-parser")


const PORT = process.env.PORT;

app.use(cors())
app.use(express.json())
app.use(cookiParser());
app.use("/uploads",express.static("./uploads"));
app.use(router)

app.use("/files",express.static("./public/files"));



app.listen(PORT,()=>{
    console.log(`server start at port no ${PORT}`)
})