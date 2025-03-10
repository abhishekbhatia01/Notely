    const express = require('express');
    const app = express();
    const path = require('path');
    const fs = require('fs');

    app.set("view engine","ejs");
    app.use(express.json());
    app.use(express.urlencoded({extended : true}));
    app.use(express.static(path.join(__dirname,'public')));
    const taskFile = path.join(__dirname,"task.json");
    const taskUserid = path.join(__dirname,"users.json");


    app.get('/', (req,res)=>{
        setTimeout(()=>{
            res.render("index");
        },2000);
    });

    // after login
    app.get('/ind2',(req,res)=>{
        res.render("index2");
    });


    let tasks = [];
    if(fs.existsSync(taskFile)){
        const data = fs.readFileSync(taskFile, 'utf-8');
        if(data){
            tasks = JSON.parse(data);
        }
    }
    app.get('/task', (req, res) => {
        // setTimeout(() => {
            res.render("notes"); 
        // }, 1000); 
    });
    
    app.post('/tasks', (req,res) =>{
        const {date, title, description} = req.body;

        let task_id;

        if(tasks.length == 0){
            task_id = 1;
        }else{
            task_id = tasks[tasks.length-1].id+1;
        }

        const new_task = {
            id : task_id,
            date : new Date().toLocaleString(),
            title : req.body.title,
            description : req.body.description
        }

        tasks.push(new_task);
        console.log(tasks);
        fs.writeFileSync(taskFile, JSON.stringify(tasks, null, 2));
        res.redirect('/view');
    });
    
    app.get('/view',(req,res)=>{
        res.render("show",{ tasks });
    })
    app.get('/taskview/:id', (req,res) =>{
        const taskId = parseInt(req.params.id);
        const task = tasks.find(t => t.id === taskId);

        if(!task){
            return res.status(404).send("Task not found...");
        }
        setTimeout(() =>{
            res.render('taskdetail',{ task });
        },1000);
    });

    app.get('/edit/:id', (req,res)=>{
        const taskId = parseInt(req.params.id);
        const task = tasks.find(t => t.id === taskId);

        if(!task){
            return res.status(404).send("Task not found...");
        }

        res.render('edit',{ task });
    });

    app.post('/update/:id', (req,res)=>{
        const taskId = parseInt(req.params.id, 10);

        if(isNaN(taskId)){
            return res.status(400).send("Invalid ID");
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if(taskIndex === -1){
            return res.status(404).send("Task not found...");
        }

        tasks[taskIndex].title = req.body.title;
        tasks[taskIndex].description = req.body.description;

        res.redirect('/view');
    });

    app.get('/delnote/:id', (req,res)=>{
        tasks = tasks.filter(task => task.id != req.params.id);
        fs.writeFileSync(taskFile, JSON.stringify(tasks, null, 2));
        res.redirect('/view')
    });

    app.get('/signup', (req,res)=>{
        res.render("signup", { message :"" });        
    });


    let taskUser = [];
    if(fs.existsSync(taskUserid)){
        taskUser = JSON.parse(fs.readFileSync(taskUserid, "utf-8"));
    }
    app.post('/signup1', (req,res)=>{
        const{name, username, email, phone, password} = req.body;

        if (taskUser.find(user => user.username === username)) {
            return res.render("signup", { message: "User already exists..." });
        }
        

        const new_user = {
            name: req.body.name,
            username: req.body.username, 
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password
        };
        
        taskUser.push(new_user);

        fs.writeFileSync(taskUserid, JSON.stringify(taskUser, null, 2));

        res.render("login", { message : "Signup sucessful!" });
    })

    app.get('/login', (req,res)=>{
        res.render("login",{ message :"" });        
    });

    app.post("/login",(req,res)=>{
        const{login, password} = req.body;

        const user = taskUser.find(user => user.username === login || user.email === login);

        if(!user || user.password !== password){
            return res.render("login", { message : "Invalid username or password" });
        }

        res.redirect('/ind2');
    });

    app.listen(2004);
