const mongoose = require('mongoose');
const Folders = mongoose.model('folders');

const IncomingForm = require('formidable').IncomingForm;

const fs = require("fs");
let fileCount = 0;

require('./fileBuilder');

//error handling
const sendError = (err, res) => {
    response.status = '501';
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
}

const mongoExec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){
    const result = await mongoExec.apply(this, arguments);
    return result;
}

module.exports = app => {
    app.get('/api/folders', async (req, res) => {
        const folders = await Folders
            .find()
        
        res.json(folders);
    });
    
    app.get('/api/folders/:heroId', async (req, res) => {
        const folder = await Folders
            .findById(req.params.heroId)
            .select({_id:0, name:0})
                
        res.json(folder);
    });
    
    app.post('/api/folders', async (req, res) => {
        var powers = 
            req.body.powers.split(",")
            .map(
                power => this.power = power.trim()
            )

        var query = { 
            name: req.body.name, 
            powers : powers
        }
        
        var object = await Folders
            .insertMany(query)
            
        res.json(object);
    });

    var file = new Array();
    var tokenId = -1;
    app.post('/api/fileUpload', async (req, res) => {
        let ok = 0;
        let percentComplete = (req.body.fileOffset/file[tokenId]["size"])*100;
        file[tokenId][req.body.fileOffset] = req.body.fileContent;
        res.status(200).json({
            ok: ok,
            percentComplete: percentComplete
        });
        if(percentComplete == 100){
            const writerStream = fs.createWriteStream(`uploads/img.file`);
            for(index in file[tokenId]){
                if(index != "size")
                    writerStream.write(file[tokenId][index]);
            }
            writerStream.end();
            fileCount++;
        }
    })
    app.post('/api/fileDetails', async (req, res) => {
        tokenId++;
        file[tokenId] = new Array();
        file[tokenId]["size"] = req.body.fileSize;
        // file[tokenId]["name"] = req.body.fileName;
        res.json({tokenId: tokenId}); 
    });

    app.post(`/api/fooUpload`, async (req, res) => {
        var form = new IncomingForm();
        form.on('file', (field, file) => {
            console.log(`file.path-------------------------`);
            console.log(file.path);
        });
        form.on('end', () => {
            res.json();
        });
        form.parse(req);
    })
};