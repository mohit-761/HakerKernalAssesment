const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./database');
const router = express.Router();
const excelJs = require('exceljs');
const validation = require('./validation');

const app = express();
const port = 3000;
let name = "";
let mobile_number = "";
let email = "";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


// custom middleware
function listener(req, res, next){
  name = req.body["uname"];
  mobile_number = req.body["mno"];
  email = req.body["umail"];
   const emailIsValid = validation.isEmailValid(email);
   const mobileIsValid = validation.isMobileValid(mobile_number);
   // console.log(emailIsValid, email);
   //console.log(mobileIsValid, mobile_number);
   console.log(req.path); 
   const request = req.path;
    if(emailIsValid === true && mobileIsValid === true || request !== null) { 
    next()
   }else{
    res.render("index.hbs",{errorMessage: 'Please check your email or mobile number'});
   } 
}

app.get("/",(req,res)=>{
  res.render("index.hbs");
})

app.use(listener);

// to add the user
app.post("/addUser",async (req,res)=>{
  try{
     const sql = `insert into user(name, mobile_number, email) values (?,?,?)`;
     const[result]  = await connection.query(sql,[name, mobile_number, email]);
     //console.log(result);
     res.render("index.hbs",{ successMessage: 'Registration successful!' });
    }catch(error){
      console.log(error);
      res.status(400).render("index.hbs",{ errorMessage: 'Registration failed: ' + error.message  });
    }
});

// to get the task form
app.get("/task",async (req,res)=>{
  try{
    const sql = `select * from user`;  
    const[result] = await connection.query(sql);       
    res.render("task.hbs",{users : result}); 
  }catch(error){
    console.log(error);
    res.status(400).render("index.hbs",{ errorMessage: 'Registration failed: ' + error.message  });
  }
})

//to assign the task
app.post("/assignTask", async (req,res)=>{
    try{
      const uids = req.body.user;
      const name = req.body.tname;
      const type = req.body.type;
      console.log(type);
      //console.log(uid, name, type);
      const sql = `insert into task(user_id, task_name, task_status) values (?,?,?)`; 
      const con = await connection.getConnection();
      await con.beginTransaction();
      for(id of uids){
        const record = [id, name, type];
        await con.query(sql, record);
      }
      await con.commit();
     res.render("task.hbs",{successMessage:"task assigned successfully!"});
    }catch(error){
      console.log(error);
      res.status(400).render("task.hbs",{ errorMessage: 'Registration failed: ' + error.message  });
    }
});


// code for step 3 and 4

 app.get("/gettingData",async(req,res)=>{
try{
    const [user_data] = await connection.execute(`select * from user`);
    const [task_data] = await connection.execute(`select * from task`);

    const workbook = new excelJs.Workbook();
    // Create a worksheet for users
    const usersSheet = workbook.addWorksheet('Users');

    usersSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 20 },
    ];
      // Populate users sheet data
      user_data.forEach((user) => {
        usersSheet.addRow(user);
      });
      // Create a worksheet for tasks
    const tasksSheet = workbook.addWorksheet('Tasks');
    tasksSheet.columns = [
      { header: 'User ID', key: 'user_id', width: 10 }, // Use user_id here
      { header: 'Task Name', key: 'task_name', width: 25 },
      { header: 'Task Status', key: 'task_status', width: 15 },
    ];
    
    // Populate tasks sheet data
    task_data.forEach((task) => {
      tasksSheet.addRow(task);
    });

    // Write the Excel file to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users_and_tasks.xlsx');

    // Send the Excel file as a response
    res.send(buffer);
}catch(error){
console.log(error);
}
}); 


//step 4
app.get("/show",(req,res)=>{
  res.render("showTask.hbs");
})

app.post("/showTask",async (req,res)=>{
  try{
    const id = req.body['userId'];
    console.log(id);
    const sql = `SELECT t.* FROM task t INNER JOIN user u ON t.user_id = u.id AND u.id = ?`;
    const[result] = await connection.query(sql,id);
    const tasks = result;
    console.log(tasks);
    res.render('showTask.hbs', { tasks });
  }catch(error){
    console.log(error);
    res.status(400).render("showTask.hbs",{ errorMessage: 'Registration failed: ' + error.message  });
    
  }
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
