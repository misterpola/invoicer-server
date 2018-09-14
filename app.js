const express = require("express");
const bodyParser = require('body-parser');
const mongojs = require('mongojs')
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './temp');
  },
  filename: function(req, file, cb){
    cb(null, 'pdftemp.pdf');
  }
})

const upload = multer({storage: storage});


const app = express();
const db = mongojs('mongodb://misterpola:gonzalo123@ds129762.mlab.com:29762/invoicer', ['clients']);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(3000);

app.get('/clients', (req, res) => {
  db.clients.find((err, clients) => {
    if(err){
      throw(err);
    }
    res.json(clients);
  })
});

app.post('/clients/new', (req, res) => {
  db.clients.insert(req.body, (err, response) => {
    if(err){
      throw(err)
    }
    res.json(response);
  })
})

app.get('/clients/:id', (req, res) => {
  db.clients.findOne({_id: mongojs.ObjectId(req.params.id)}, (err, task) => {
    if(err){
      res.send(err);
    }
    res.json(task);
  });
});

app.put('/clients/:id', (req, res) => {
  db.clients.findAndModify({
    query: {_id: mongojs.ObjectId(req.params.id)},
    update: req.body
  }, (err, client, response) => {
    if(err){
      throw(err);
    }
    res.json(response);
  })
});

app.get('/invoices', (req, res) => {
  db.invoices.find().sort({invoiceNumber:-1},(err, invoices) => {
    if(err){
      throw(err)
    }
    res.send(invoices);
  })
});

app.get('/invoices/:id', (req, res) => {
  db.invoices.findOne({_id: mongojs.ObjectId(req.params.id)}, (err, invoice) => {
    if(err){
      throw(err)
    }
    res.json(invoice);
  })
})

app.post('/invoices', (req, res) =>{

  db.invoices.insert(req.body, (err, response) => {
    if(err){
      throw(err)
    }
    res.json(response);
  })
});

//                    Match name with FormData blob name
app.post('/sendMail', upload.single('pdf'), (req, res) => {

let transporter = nodemailer.createTransport({
  host: 'mail.gonzalobellanti.com',
  port: 26,
  secure: false, // true for 465, false for other ports
  auth: {
      user: 'test@gonzalobellanti.com', // generated ethereal user
      pass: 'intothecatmosphere' // generated ethereal password
  },
  tls:{
    rejectUnauthorized: false
  }
});
 
// setup email data with unicode symbols
let mailOptions = {
    from: '"invoicer" <test@gonzalobellanti.com>', // sender address
    to: 'misterpola@gmail.com', // list of receivers
    subject: 'New invoice', // Subject line
    attachments: [{
      filename: 'invoice.pdf',
      path: './temp/pdftemp.pdf',
      contentType: 'application/pdf'
    }]
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
});

  res.json('done');
})
