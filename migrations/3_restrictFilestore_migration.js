
var RestrictFileStore = artifacts.require("./RestrictFileStore.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");

module.exports =  function(deployer) {
  
  deployer.link(FileStoreLib, RestrictFileStore);

  deployer.deploy(RestrictFileStore);
};
