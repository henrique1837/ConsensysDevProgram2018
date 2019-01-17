var RestrictAssignableFileStore = artifacts.require("./RestrictAssignableFileStore.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");
contract('RestrictAssignableFileStore', function(accounts) {

  const pedro = accounts[0];
  const joao = accounts[1];
  const alice = accounts[3];
  const ipfsHash1 = "aa";
  const ipfsHash2 = "a";
  const ipfsHash3 = "aaa";
  const filename = "test";
  it("Owner can add ipfs hash", async () => {
    const fs = await RestrictAssignableFileStore.deployed();
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
    assert.equal(ipfsH, ipfsFile[0], 'ipfs hashes should be the same');
  });
  it("Onwer can add admin ",async() => {
    const fs = await RestrictAssignableFileStore.deployed();
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
    const fs = await RestrictAssignableFileStore.deployed();
    // If transaction was successfull admin can add file to contract //
    var transaction = await fs.addFile(ipfsHash2,filename,{from: joao});
    // Check if addFile method call FileUploaded event //
    var eventEmitted = false
    var event = fs.FileUploaded();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'addFile method should call FileUploaded event');
    })
    assert.equal("object",typeof(transaction), 'Admin should be able to add file');

  });
  it("Admin can verify file that is not him's",async()=>{
    const fs = await RestrictAssignableFileStore.deployed();
    // Verify if file can be verified and is set to verified by admin that is not owner //
    await fs.verifyFile(ipfsHash1,{from:joao});
    // Check if verifyFile method calls  AdminSignFile event //
    var eventEmitted = false
    var event = fs.AdminSignFile();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'verifyFile method should call AdminSignFile event');
    })
    // Check if FileVerified event is called when file has minimum of verifications //
    var eventEmitted = false
    var event = fs.FileVerified();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'File should be set as verified');
    })
    // Check if getFileSignatures method is ok //
    const fileSignatures = await fs.getFileSignatures(ipfsHash1);
    assert.equal(joao,fileSignatures[0],'Admin should be able to verify file');
  });
  it("Admin canot verify own file",async()=>{
    const fs = await RestrictAssignableFileStore.deployed();
    // Check if admin can not verify own file, transaction should fail //
    try{
      var transaction = await fs.verifyFile(ipfsHash2,{from:joao});
    } catch(err){
    }
    assert.equal( "undefined",typeof(transaction), 'Admin should not be able to verify own file');
    // getFileSignatures method should not return any wallet
    const fileSignatures = await fs.getFileSignatures(ipfsHash2);
    assert.equal(fileSignatures.length,0,'fileSignatures length should be 0');
  });
  it("Can check if file is verified",async()=>{
    const fs = await RestrictAssignableFileStore.deployed();
    const isVerified = await fs.isVerified(ipfsHash1);
    assert.equal(isVerified,true,'File should be verified');
  });

});
