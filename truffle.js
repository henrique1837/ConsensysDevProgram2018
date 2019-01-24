//Only needed if migrating to ropsten 
//var HDWalletProvider = require("truffle-hdwallet-provider");
//var mnemonic = "mnemonic or private key";
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },/*
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/<<INFRURA API>>")
      },
      network_id: 3,
      gasPrice: 1000000000
    }*/
  }
};
