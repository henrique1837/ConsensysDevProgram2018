
var RestrictAssignableFileStore = artifacts.require("./RestrictAssignableFileStore.sol");
var FileStoreLib = artifacts.require("./FileStoreLib.sol");

module.exports =  function(deployer) {
  
  deployer.link(FileStoreLib, RestrictAssignableFileStore);

  deployer.deploy(RestrictAssignableFileStore,1);
};
