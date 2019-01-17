var FileStore = artifacts.require("./FileStore.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");



module.exports =  function(deployer) {
  deployer.deploy(FileStoreLib);

  deployer.link(FileStoreLib,FileStore);
 
  deployer.deploy(FileStore);

};
