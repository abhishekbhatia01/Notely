    const express = require('express');
    const app = express();
    const path = require('path');
    const fs = require('fs');

    app.set("view engine","ejs");
    app.use(express.json());
    app.use(express.urlencoded({extended : true}));
    app.use(express.static(path.join(__dirname,'public')));
    const taskFile = path.join(__dirname,"task.json");


    app.get('/', (req,res)=>{
        setTimeout(()=>{
            res.render("index");
        },2000);
    });


    let tasks = [];
    if(fs.existsSync(taskFile)){
        const data = fs.readFileSync(taskFile, 'utf-8');
        if(data){
            tasks = JSON.parse(data);
        }
    }
    app.get('/task', (req, res) => {
        // setTimeout(() => {x
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

        res.render('taskdetail',{ task });
    });

    app.get('/delnote/:id', (req,res)=>{
        tasks = tasks.filter(task => task.id != req.params.id);
        fs.writeFileSync(taskFile, JSON.stringify(tasks, null, 2));
        res.redirect('/view')
    });

    
    

    app.listen(2004);
