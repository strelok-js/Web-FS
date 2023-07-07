const FS = require('fs').promises;
const express = require('express');
const path = require('path');
const child = require('child_process');
const config = require('./config.json');


async function makeDomFiles(folder, DOM, deep) {
    if(deep===0) return {name:"Deep Folder", path:folder};
    const asyncFolder = [];
    for (const file of await FS.readdir(folder).catch(err=>[])) {
        const stat = await FS.stat(folder+file).catch(err=>null);
        if(stat) {
            if(stat.isDirectory()) asyncFolder.push({
                name:file, 
                isDirectory:stat.isDirectory(), 
                path:folder+file+"/", files: await makeDomFiles(folder+file+"/", [], deep-1)
            });
            else DOM.push({name:file, path:folder+file});
        } 
    }
    DOM.push(...await Promise.all(asyncFolder));
    if(folder.split("").filter(el=>el==="/").length>1) DOM.push({
        name:"...", isDirectory:true, 
        path:(folder.startsWith("/")?"/":"")+folder.split("/").filter(Boolean).slice(0,-1).join("/")+"/", files: []
    });
    return DOM;
}

async function startServer({pass, port, ip}) {
    const app = express();
    app.use(express.static(path.join(__dirname, 'public')));

    const localDisc = await new Promise((resolve, reject) => {  
        child.exec('wmic logicaldisk get name', (error, stdout) => {
            if(error) reject(null);
            const out = stdout.split('\r\r\n')
                .filter(value => /[A-Za-z]:/.test(value))
                .map(value => value.trim()+"/");
            resolve(out);
        });
    }).catch(err=>null);

    app.get('/get', (req, res) => {
        if(pass!==req.query.pass) return;
        if(!req.query.folder) return res.redirect("/get?folder=/&pass="+pass);
        res.sendFile('public/main.html', {root: __dirname });
    });

    app.get('/api', async (req, res) => {
        if(pass!==req.query.pass) return;
        if(req.query.localDisc) return res.send(localDisc??["/"]);
        if(req.query.action) {
            switch (req.query.action) {
                case "rename":
                    await FS.rename(req.query.oldWay, req.query.oldWay.split("/").filter(Boolean).slice(0,-1).join("/")+"/"+req.query.newName);
                    res.send("good");
                    break;
                case "rmdir":
                case "rm":
                    await FS[req.query.action](req.query.rmPath, {recursive:true});
                    res.send("good");
                    break;
                case "download":
                    res.sendFile(req.query.way);
                    break;
                default:
                    break;
            }
        } else res.send(await makeDomFiles(req.query.folder??"/", [], !isNaN(+req.query.deep)?+req.query.deep:1));
    });

    app.listen(port, ip, () => console.log('Web Folder listening on port '+port,));
}

startServer(config);