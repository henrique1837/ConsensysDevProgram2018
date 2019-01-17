var RestrictFileStore = artifacts.require("./RestrictFileStore.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");
contract('RestrictFileStore', function(accounts) {

  const pedro = accounts[0];
  const joao = accounts[1];
  const alice = accounts[3];
  const ipfsHash1 = "aa";
  const ipfsHash2 = "a";
  const ipfsHash3 = "aaa";
  const filename = "test";
  it("Onwer can add ipfs hash", async () => {
    const fs = await RestrictFileStore.deployed();
    const fslib = await FileStoreLib.deployed();
    // Test if owner can add ipfs hash to contract //
    await fs.addFile(ipfsHash1,filename,{from: pedro});
    // Verify if addFile method emit FileUploaded event //
    var eventEmitted = false
    var event = fs.FileUploaded();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'addFile method should call FileUploaded event');
    })
    // Check if hash of ipfs hash added is ok //
    var ipfsFile = await fs.getUserFile(pedro,0);
    var ipfsH = await fslib.getHash(ipfsHash1);
    assert.equal(ipfsH, ipfsFile[0], 'ipfs hashes sould be the same');
  });
  it("Onwer can add admin ",async() => {
    const fs = await RestrictFileStore.deployed();
    // Verify if owner can add admin //
    await fs.addAdmin(joao,{from: pedro});
    // isAdmin should be true //
    var isAdmin = await fs.checkIsAdmin(joao);
    // Verify if addAdmin method emits AdminAdded event //
    var eventEmitted = false
    var event = fs.AdminAdded();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'addAdmin method should call AdminAdded event');
    })
    assert.equal(true,isAdmin, 'Admin should be added');

  });
  it("Admin can add file ",async() => {
    const fs = await RestrictFileStore.deployed();
    var transaction = await fs.addFile(ipfsHash2,filename,{from: joao});
    // If transaction was successfull admin can add file to contract //
    assert.equal("object",typeof(transaction), 'Admin should be able to add file');
    // Check if addFile method call FileUploaded event //
    var eventEmitted = false
    var event = fs.FileUploaded();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'addFile method should call FileUploaded event');
    })

  });
  it("Onwer can remove admin ",async() => {
    const fs = await RestrictFileStore.deployed();
    // Verify if owner can remove admin //
    await fs.removeAdmin(joao,{from: pedro});
    // isAdmin should be false //
    var isAdmin = await fs.checkIsAdmin(joao);
    // Verify if removeAdmin method emits AdminRemoved event //
    var eventEmitted = false
    var event = fs.AdminRemoved();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'removeAdmin method should call AdminRemoved event');
    })
    assert.equal(false,isAdmin, 'Admin should be removed');

  });
  it("Not admin cannot add file",async() => {
    const fs = await RestrictFileStore.deployed();
    // If user that is not admin try to call addFile method the transaction should fail //
    try{
      var transaction = await fs.addFile(ipfsHash3,filename,{from:alice});
      
    } catch(err){
      
    }
    assert.equal( "undefined",typeof(transaction), 'Only Admins should be able to add file');
  });
  it("Getter functions are ok",async()=>{
    const fs = await RestrictFileStore.deployed();
    const fslib = await FileStoreLib.deployed();
    const ipfs1 = await fs.getUserFile(pedro,0);
    const ipfsH1 = await fslib.getHash(ipfsHash1);
    assert.equal(ipfsH1,ipfs1[0],"IPFS hashes should be the same");
    const totalFilesPedro = await fs.getTotalUserFiles(pedro);
    assert.equal(1,totalFilesPedro,"Wrong total files count for user 1");
    const contractTotalFiles = await fs.totalFiles();
    assert.equal(2,contractTotalFiles,"Wrong total files count for contract");
    var isAdmin = await fs.checkIsAdmin(joao);
    assert.equal(false,isAdmin, 'Wallet should not be admin');
  });
  it("Can get owner of file using ipfs hash",async()=>{
    const fs = await RestrictFileStore.deployed();
    const owner = await fs.getFileOwner(ipfsHash1);
    assert.equal(owner,pedro,"Error in getFileOwner function");
  });


});
