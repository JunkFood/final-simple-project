// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// use static file
app.use(express.static(path.join(__dirname, 'views')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// main page routing
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

async function cc_call(fn_name, args){
    
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('teamate');

    var result;
    
    if(fn_name == 'addUser'){
        cid = args[0]
        cissue = args[1]

        result = await contract.submitTransaction('addUser', cid, cissue);
    }
    else if( fn_name == 'addRating')
    {
        cid = args[0]
        cstate = args[1]
        result = await contract.submitTransaction('addRating', cid, cstate);
    }
    else if(fn_name == 'readRating')
        result = await contract.evaluateTransaction('readRating', args);
    else
        result = 'not supported function'

    return result;
}

//create mate
app.post('/donate', async(req, res)=>{
    const cid = req.body.cid;
    const cissue = req.body.cissue;

    console.log("add donate cid: " + cid);
    console.log("add donate cissue: " + cissue);

    var args = [cid, cissue]

    result = cc_call('addUser', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

// add score
app.post('/state', async(req, res)=>{
    const cid = req.body.cid;
    const cstate = req.body.cstate

    console.log("change state cid: " + cid);
    console.log("change state cstate: " + cstate);

    var args = [cid, cstate]

    result = cc_call('addRating', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

// find mate
app.post('/donate/:cid', async (req,res)=>{
    const cid = req.body.cid;
    console.log("cid: " + req.body.cid);
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('teamate');
    const result = await contract.evaluateTransaction('readRating', cid);
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
    // res.status(200).json(result)

});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);