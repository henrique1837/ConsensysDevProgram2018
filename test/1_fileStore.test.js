var FileStore = artifacts.require("./FileStore.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");
contract('FileStore', function(accounts) {

  const pedro = accounts[0];
  const joao = accounts[1];
  const ipfsHash1 = "aa";
  const ipfsHash2 = "a";
  const ipfsHash3 = "aaa";
  const filename = "test";
  it("User can add ipfs hash", async () => {
    const filestore = await FileStore.deployed();
    const fslib = await FileStoreLib.deployed();
    // Test if user can add ipfs hash to contract //
    await filestore.addFile(ipfsHash1,filename,{from: pedro});
    var eventEmitted = false
    // Verify if addFile method emit FileUploaded event //
    var event = filestore.FileUploaded();
    await event.watch((err, res) => {
        eventEmitted = true;
        assert.equal(eventEmitted,true, 'addFile method should call FileUploaded event');
    })
    // Check if hash of ipfs hash added is ok //
    var ipfsFile = await filestore.getUserFile(pedro,0);
    var ipfsH = await fslib.getHash(ipfsHash1);
    assert.equal(ipfsH, ipfsFile[0], 'ipfs hashes sould be the same');
  });
  it("Cannot add same file",async() => {
    const fs = await FileStore.deployed();


    // Testing if other user cannot add same file //
    try{
      var transaction = await fs.addFile(ipfsHash1,filename,{from: joao});
    } catch(err){
      // User could not add file that has owner //
    }
    assert.equal(undefined, transaction,'Other user should not be able to add same file');
    // Testing file owner cannot add same file //
    try{
      var transaction = await fs.addFile(ipfsHash1,filename,{from: pedro});
    } catch(err){
      // User owner cannot add same file //
    }
    assert.equal(undefined,transaction, 'User should not be able to add same file');

  });
  it("Another user try to add other file",async() => {
    const filestore = await FileStore.deployed();

    try{
      var transaction = await filestore.addFile(ipfsHash2,filename,{from:joao});

    } catch(err){
      
    }
    assert.equal( "object",typeof(transaction), 'Other user should be able to add other file');
    try{
      var transaction = await filestore.addFile(ipfsHash3,filename,{from:pedro});
     
    } catch(err){
      
    }
    assert.equal( "object",typeof(transaction), 'User should be able to add other file');
  });
  it("Getter functions are ok",async()=>{
    const filestore = await FileStore.deployed();
    const fslib = await FileStoreLib.deployed();
    const ipfs1 = await filestore.getUserFile(pedro,0);
    const ipfsH1 = await fslib.getHash(ipfsHash1);
    assert.equal(ipfsH1,ipfs1[0],"IPFS hashes should be the same");
    const ipfs2 = await filestore.getUserFile(joao,0);
    const ipfsH2 = await fslib.getHash(ipfsHash2);
    assert.equal(ipfsH2,ipfs2[0],"IPFS hashes should be the same");
    const ipfs3 = await filestore.getUserFile(pedro,1);
    const ipfsH3 = await fslib.getHash(ipfsHash3);
    assert.equal(ipfsH3,ipfs3[0],"IPFS hashes should be the same");
    const totalFilesPedro = await filestore.getTotalUserFiles(pedro);
    assert.equal(2,totalFilesPedro,"Wrong total files count for user 0");
    const totalFilesJoao = await filestore.getTotalUserFiles(joao);
    assert.equal(1,totalFilesJoao,"Wrong total files count for user 1");
    const contractTotalFiles = await filestore.totalFiles();
    assert.equal(3,contractTotalFiles,"Wrong total files count for contract");
  });
  it("Can get owner of file using ipfs hash",async()=>{
    const filestore = await FileStore.deployed();
    const owner = await filestore.getFileOwner(ipfsHash1);
    assert.equal(owner,pedro,"Error in getFileOwner function");
  });


});


