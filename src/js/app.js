const Buffer = require('safe-buffer').Buffer;
App = {
  web3Provider: null,
  contracts: {},
  root: $("#root"),
  menu: $("#menu"),
  userInfo: $("#userInfo"),
  pageText: $("#page_text"),
  appInfo: $("#appInfo"),
  transactionInfo: $("#transactionInfo"),
  ipfs: window.IpfsApi({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }),
  buffer: Buffer,
  
  sectionContractUse: "<div class='row'>"+
		       "<ul class='nav nav-tabs'>"+
			  "<li class='active'><a data-toggle='tab' href='#div_userFiles'>Your Files</a></li>"+
			  "<li><a data-toggle='tab' href='#div_contractFiles'>Contract Files</a></li>"+
		       "</ul>"+
		       "</div>"+

		       "<div class='tab-content'>"+
 			"<div id='div_userFiles' class='tab-pane fade in active'>"+
			 "<div class='row'>"+
                            "<h3>Aplication</h3>"+
		            "<div class='col-sm-6'>"+
				    "<h4>Upload and refer</h4>"+
	  			    "<p>Use this section to upload an file to IPFS and refer the hash to your own wallet</p>"+
				"<div class='div_input'>"+
					    "<label class='label label-default' for='input_file'>File</label>"+
					    "<input id='input_file' type='file'>"+
				    "<label class='label label-default' for='input_name'>File Name</label>"+
				 "</div>"+
				 "<div class='div_input'>"+
					    "<input id='input_name' type='text'>"+
		  			    "<div><button id='uploadDoc' class='btn'>Upload</button></div>"+
				 "</div>"+
			     "</div>"+
			     "<div class='col-sm-6'>"+
				    "<h4>Refer IPFS hash</h4>"+
	  			    "<p>Use this section to refer an IPFS hash to your wallet</p>"+
				    "<div class='div_input'>"+
					"<label class='label label-default' for='input_hash'>IPFS hash</label>"+
                  	   	    	"<input id='input_hash' type='text'>"+
				    "</div>"+
				    "<div class='div_input'>"+
		          	            "<label class='label label-default' for='input_contentName'>Content Name</label>"+
		          		    "<input id='input_contentName' type='text'>"+
				    "</div>"+
			     "</div>"+
				    "<div><button id='addIPFShash' class='btn'>Add ipfs hash</button></div>"+
		           "</div>"+
		           "<div class='row' id='user_events'>"+
		           "</div>"+
			   "<div class='row' id='userFiles'>"+
			      "<h4>Your Files</h4>"+
			      "<div class='table-responsive'>"+
				  "<table class='table table-hover'>"+
				      "<thead>"+
				          "<tr>"+
				            "<th>ID</th>"+
				            "<th>File Name</th>"+
				            "<th>IPFS Hash</th>"+
				          "</tr>"+
				      "</thead>"+
				       "<tbody id='t_events'>"+
				       "</tbody>"+
				   "</table>"+
				"</div>"+
			    "</div>"+

			    "<center class='row' id='file_content'></center>"+
			   "</div>"+

			   "<div id='div_contractFiles' class='tab-pane fade'>"+

				   "<div class='row' id='contractFiles'>"+
				      "<h4>Contract Files</h4>"+
				      "<div class='table-responsive'>"+
					  "<table class='table table-hover'>"+
					      "<thead>"+
						  "<tr>"+
						    "<th>Owner</th>"+
						    "<th>ID</th>"+
						    "<th>File Name</th>"+
						    "<th>IPFS Hash</th>"+
						  "</tr>"+
					      "</thead>"+
					       "<tbody id='t_Cevents'>"+
					       "</tbody>"+
					   "</table>"+
					"</div>"+
				    "</div>"+

		           "</div>"+
		          "</div>",
  init: async function() {
    
    App.root.html("");
    App.appInfo.html("");
    App.userInfo.html("");
    return(await App.initWeb3());
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
	App.root.html("<p>In order to use the dApp you need to confirm account access</p>");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }

    return(App.initContract());
  },

  initContract: async function() {

    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var FileStoreArtifact = await $.getJSON('FileStore.json');
    var RestrictFileStoreArtifact = await $.getJSON('RestrictFileStore.json');
    App.contracts.FileStore = TruffleContract(FileStoreArtifact);
    App.contracts.RestrictFileStore = TruffleContract(RestrictFileStoreArtifact);

    // Set the provider for our contract
    App.contracts.FileStore.setProvider(App.web3Provider);
    App.contracts.RestrictFileStore.setProvider(App.web3Provider);
    App.transactionInfo.html("");
    App.renderMenu();
    App.renderAppInfo();
    return(App.renderHome());
  },

  handleUpload: async function(fsContract){

      var ipfs = App.ipfs;
      const file = $('#input_file').prop('files')[0];
      const fileName = $('#input_name').val();
      const reader = new FileReader();
      reader.onload =  function(e) {
        var buffer = App.buffer.from(reader.result);
        console.log(buffer);
        ipfs.files.add(buffer,function(err,res){
          if (err || !res) {
            return(console.error('ipfs add error', err));
          }
          console.log(res);
          res.forEach(function (file) {
            if (file && file.hash) {
              console.log('successfully stored', file.hash)
              App.addIPFSHash(fsContract,file.hash,fileName);
            }
          });
        });

			}

			reader.readAsDataURL(file);


  },
  renderDownloadButton: async function(){
    $("#file_content").html("IPFS: getting file ...")
    const ipfs = App.ipfs;
    const ipfsHash = $(this).html();
    console.log(ipfsHash);
    // const stream = ipfs.catReadableStream(ipfsHash);
    // console.log(stream)
    ipfs.cat(ipfsHash, function (err, file) {
      if (err) {
        throw err
      }

      console.log(file.toString('utf8'));
      $("#file_content").html("<p>File Hash: <a href='https://ipfs.io/ipfs/"+ipfsHash+"' target='_blank'>"+ipfsHash+"</a></p>"+
                              "<p><a href='"+file.toString('utf-8')+"' target='_blank'>Download File</a></p>"+
                              "<h4>File Preview</h4>"+
                              "<embed src='"+file.toString('utf-8')+"' width='500' height='375'>");
    })
  },
  addIPFSHash: async function(fsContract,ipfsHash,fileName){
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();
    var isIPFSHash = await App.verifyIPFSHash(ipfsHash);
    if(isIPFSHash){
          const transaction = await filestoreInstance.addFile(ipfsHash,fileName,{from: web3.eth.coinbase});
          console.log("Transaction: "+transaction.tx);
          App.transactionInfo.html('<div class="alert alert-success" role="alert">'+
				    '<p>Transaction hash: '+transaction.tx+'</p>'+
				  '</div>');
          setTimeout(function(){ 
		App.transactionInfo.html("");
	  }, 5000);
    } else {
          App.transactionInfo.html('<div class="alert alert-danger" role="alert">'+
				    '<p>An error has ocurred</p>'+
				  '</div>');
          setTimeout(function(){ 
		App.transactionInfo.html("");
	  }, 5000);
    }
    await App.getAllContractFiles(fsContract);
    return(App.getUserFiles(fsContract));
  },
  
  // Verify if IPFS hash exists in IPFS network //
  verifyIPFSHash: async function(ipfsHash){
	const ipfs = App.ipfs;
	try{
	  var file = await ipfs.cat(ipfsHash);
	  var isIPFSHash = true;
        }catch(err){
	  console.log(err);
	  var isIPFSHash = false;
        }	
	
        return(isIPFSHash);
  },

  getAllContractFiles: async function(fsContract) {
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();


   var event = filestoreInstance.FileUploaded({},
                                              { fromBlock: 0, toBlock: 'latest' });
   $("#file_content").html("");
   $("#t_Cevents").html("");
   await App.renderInfo(fsContract);
   await event.get((err, res) => {
      if (err){
        console.log('Error in FileUploaded event handler: ' + err);
        throw(err);
      } else {
        try{
          $("#t_Cevents").html("");
          for(i=0;i<res.length;i++){
            var ipfsHash = res[i].args.ipfshash;
            var fileId = res[i].args.fileId;
            var fileName = res[i].args.name;
            var owner = res[i].args.owner;
            $("#t_Cevents").append(  "<tr>"+
					"<td>"+owner+"</td> "+
                                        "<td>"+fileId+"</td> "+
                                        "<td>"+fileName+"</td>"+
                                        "<td><a href='https://ipfs.io/ipfs/"+ipfsHash+"' value='"+fileId+"' class='a_ipfs' target='_blank' >"+ipfsHash+"</a></td> "+
                                      "</tr>");

          }
          //$(".a_ipfs").click(App.renderDownloadButton);
        } catch(error){
          console.log(error);
        }


      }

    });
    

  },
  getUserFiles: async function(fsContract) {
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();


   var event = filestoreInstance.FileUploaded({owner: web3.eth.coinbase},
                                              { fromBlock: 0, toBlock: 'latest' });
   $("#file_content").html("");
   $("#t_events").html("");
   await App.renderInfo(fsContract);
   await event.get((err, res) => {
      if (err){
        console.log('Error in FileUploaded event handler: ' + err);
        throw(err);
      } else {
        try{
          console.log('FileUploaded: ' + JSON.stringify(res[0].args));
          $("#t_events").html("");
          for(i=0;i<res.length;i++){
            var ipfsHash = res[i].args.ipfshash;
            var fileId = res[i].args.fileId;
            var fileName = res[i].args.name;
            $("#t_events").append(  "<tr>"+
                                        "<td>"+fileId+"</td> "+
                                        "<td>"+fileName+"</td>"+
                                        "<td><a href='#"+ipfsHash+"' value='"+fileId+"' class='a_ipfs' >"+ipfsHash+"</a></td> "+
                                      "</tr>");

          }
          $(".a_ipfs").click(App.renderDownloadButton);
        } catch(error){
          console.log(error);
        }


      }

    });
  },
  // Common FileStore and RestrictFileStore getter functions //
  getTotalUserFiles: async function(fsContract,account){
    const filestoreInstance = await fsContract.deployed();
    var totalFiles = await filestoreInstance.getTotalUserFiles(account);
    return(totalFiles);

  },
  getContractFiles: async function(fsContract){
    const filestoreInstance = await fsContract.deployed();
    var totalFiles = await filestoreInstance.totalFiles();
    return(totalFiles);

  },
  getContractAddress: async function(fsContract){
    const filestoreInstance = await fsContract.deployed();
    var address = filestoreInstance.address
    return(address);

  },
  // RestrictFileStore getter functions
  getContractOwner: async function(fsContract){
    const filestoreInstance = await fsContract.deployed();
    const owner = await filestoreInstance.owner();
    return(owner)
  },
  verifyIsAdmin: async function(fsContract,addr){
    const filestoreInstance = await fsContract.deployed();
    const isAdmin = await filestoreInstance.checkIsAdmin(addr);
    return(isAdmin);
  },

  // Render menu for aplication and bind events //
  renderMenu: function(){
    // Render menu //
    App.menu.html('<nav class="navbar navbar-inverse">'+
                    '<div class="container">'+
                      '<div class="navbar-header">'+
                        '<a class="navbar-brand" href="#">Descentralized File Store</a>'+
                     '</div>'+
                      '<ul class="nav navbar-nav">'+
                        '<li><a id="a_fs">FileStore</a></li>'+
                        '<li><a id="a_rfs">RestrictFileStore</a></li>'+
                      '</ul>'+
                    '</div>'+
                  '</nav>');
    // Menu events //
    $("#a_fs").click(App.renderHome);
    $("#a_rfs").click(App.renderRestrictFileStore);
  },
 
  // Render App information and usage //

  renderAppInfo: function(){
     App.appInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
			"If App does not load please connect your metamask to ropsten network and reload the page"+
  	                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
			    "<span aria-hidden='true'>&times;</span>"+
			  "</button>"+
			"</div>"+
		     "<div class='row'>"+
			"<h3>Informations</h3>"+
			"<p>Use 'Upload and refer' column to upload an file to IPFS and refer the hash to your own wallet</p>"+
			"<p>Use 'Refer IPFS hash' to refer the hash of some file added by yourself in IPFS to your own wallet</p>"+
		      "</div>");
  $('.alert').alert()
  },

  // Render user info and contract info for aplication //
  renderInfo: async function(fsContract){
    var web3 = new Web3(App.web3Provider);


    var userTotalFiles = await App.getTotalUserFiles(fsContract,web3.eth.coinbase);
    var contractTotalFiles = await App.getContractFiles(fsContract);
    var contractAddress = await App.getContractAddress(fsContract);
    try{
       var owner = await App.getContractOwner(fsContract);
       var isAdmin = await App.verifyIsAdmin(fsContract,web3.eth.coinbase);
    }catch(err){
       // If error contract does not have owner
       console.log(err);
    }
    
    App.userInfo.html("<div class='row'>"+
		        "<p>Your wallet: "+web3.eth.coinbase+"</p>"+
"<p>FileStore contract address: "+contractAddress+"</p>"+
 			"<p>Total files added by you: "+userTotalFiles+"</p>"+
			"<p>Total files in contract: "+contractTotalFiles+"</p>"+
		      "</div>");
    if(owner != null){
     App.userInfo.append("<div class='row'>"+
                           "<p>Contract's owner: "+owner+"</p>"+
                           "<p>Can your wallet use this contract: "+isAdmin+"</p>"+
                         "</div>");
    }
    
                      
  },

  // Render home of aplication//

  renderHome: async function(){
    App.pageText.html("Descentralized File Store");


    await App.renderInfo(App.contracts.FileStore);
    App.root.html(App.sectionContractUse);
    $("#uploadDoc").click(function(){
	App.handleUpload(App.contracts.FileStore);
    });
    $("#addIPFShash").click(function(){
	App.addIPFSHash(App.contracts.FileStore,
		        $("#input_hash").val(),
 			$("#input_contentName").val());
    });
    await App.getAllContractFiles(App.contracts.FileStore);
    return(App.getUserFiles(App.contracts.FileStore));

  },
 
  // Render Restrict FileStore page of aplication//

  renderRestrictFileStore: async function(){
      App.pageText.html("Restrict File Store");
      var web3 = new Web3(App.web3Provider);
      await App.renderInfo(App.contracts.RestrictFileStore);
      App.root.html(App.sectionContractUse);
      $("#uploadDoc").click(function(){
	App.handleUpload(App.contracts.RestrictFileStore);
      });
      $("#addIPFShash").click(function(){
	App.addIPFSHash(App.contracts.RestrictFileStore,
		        $("#input_hash").val(),
 			$("#input_contentName").val());
      });
      await App.getAllContractFiles(App.contracts.RestrictFileStore);
      return(App.getUserFiles(App.contracts.RestrictFileStore));
  },
};

$(function() {
  $(window).load(function() {
    App.init();
    window.ethereum.on('accountsChanged', function () {
	  App.init();
    });
    window.ethereum.on('networkChanged', function () {
        App.init();
    });
  });
});
