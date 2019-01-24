
App = {
  web3Provider: null,
  contracts: {},
  root: $("#root"),
  menu: $("#menu"),
  userInfo: $("#userInfo"),
  pageText: $("#page_text"),
  transactionInfo: $("#transactionInfo"),
  ipfs: window.IpfsApi({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }),
  
sectionContractUse: "<div class='row'>"+
                            "<h3>Aplication</h3>"+
		            "<div>"+
				    "<h4>Upload File to IPFS</h4>"+
	  			    "<p>Use this section to upload a file to IPFS</p>"+
				"<div class='div_input'>"+
					    "<label class='label label-default' for='input_file'>File</label>"+
					    "<input id='input_file' type='file'>"+
				    "<div><button id='uploadDoc' class='btn'>Upload to IPFS</button></div>"+
				 "</div>"+
				 "<h4>Add IPFS hash in the FileStore Contract</h4>"+
	  			 "<p>Use this section to refer ipfs hash of a file to your Ethereum wallet</p>"+
				 "<div class='div_input'>"+
					    "<label class='label label-default' for='input_name'>File Name</label>"+
					    "<input id='input_name' type='text'>"+
		  			    
				 "</div>"+
				"<div class='div_input'>"+
					"<label class='label label-default' for='input_hash'>IPFS hash</label>"+
                  	   	    	"<input id='input_hash' type='text'>"+
				    "</div>"+
				"<div><button id='addIPFShash' class='btn'>Add IPFS hash to contract</button></div>"+
			     "</div>"+
			    
				    
		           "</div>"+
			"<div class='row'>"+
		       "<ul class='nav nav-tabs'>"+
			  "<li class='active'><a data-toggle='tab' href='#div_userFiles'>Your Files</a></li>"+
			  "<li><a data-toggle='tab' href='#div_contractFiles'>Contract Files</a></li>"+
		       "</ul>"+
		       "</div>"+

		       "<div class='tab-content'>"+
 			"<div id='div_userFiles' class='tab-pane fade in active'>"+
			 
		           
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
    App.root.html('<center><i class="fas fa-sync fa-spin fa-10x"></i></center>');
    App.userInfo.html("");
    App.renderMenu();
    return(App.renderHome());
  },

  handleUpload: async function(){
      $('#input_hash').val("");	
      var ipfs = App.ipfs;
      // Get file to be uploaded //
      const file = $('#input_file').prop('files')[0];
      // Verify if there is a file //
      if(typeof(file) == "undefined"){
	return(App.transactionInfo.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
		  	                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					    "<span aria-hidden='true'>&times;</span>"+
					  "</button>"+
					"<p>No file selected to upload to IPFS</p>"+
				    "</div>"));
      }
      const fileName = $('#input_name').val();
      // Prepare to read file //
      const reader = new FileReader();
      App.transactionInfo.html('<center><i class="fas fa-sync fa-spin fa-5x"></i></center>');
      reader.onload =  function(e) {
	// Reading file function //
        var buffer = App.ipfs.types.Buffer(reader.result);
        console.log(buffer);
	// Adding file in ipfs //
        ipfs.files.add(buffer,function(err,res){
          if (err || !res) {
	    // In case of error display error //
            App.transactionInfo.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
					"Error while uploading to IPFS: "+err+
		  	                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					    "<span aria-hidden='true'>&times;</span>"+
					  "</button>"+
				    "</div>");
            return(console.error('ipfs add error', err));
          }
          console.log(res);
          res.forEach(function (file) {
	    // Show file hash and prepare to insert hash in the contract //
            if (file && file.hash) {
              console.log('successfully stored', file.hash)
              App.transactionInfo.html('<div class="alert alert-success alert-dismissible" role="alert">'+
					  "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					    "<span aria-hidden='true'>&times;</span>"+
					  "</button>"+
				           '<p>File hash: '+file.hash+'</p>'+
					    
				          '</div>');
	      $('.alert').alert();
              $("#input_hash").val(file.hash);
            }
          });
        });

			}
			//Reading file //
			reader.readAsArrayBuffer(file);
			
			
  },
  renderDownloadButton: async function(){
    // Render preview of file in IPFS //
    $("#file_content").html("IPFS: getting file ...")
    const ipfs = App.ipfs;
    const ipfsHash = $(this).html();
    console.log(ipfsHash);
    // const stream = ipfs.catReadableStream(ipfsHash);
    // console.log(stream)
    $("#file_content").html("<p>File Hash: <a href='https://ipfs.io/ipfs/"+ipfsHash+"' target='_blank'>"+ipfsHash+"</a></p>"+
                            "<h4>File Preview</h4>"+
                            "<embed src='https://ipfs.io/ipfs/"+ipfsHash+"' width='500' height='375'>");
  },
  addIPFSHash: async function(fsContract,ipfsHash,fileName){
    
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();
    App.transactionInfo.html('<center><i class="fas fa-sync fa-spin fa-5x"></i></center>'); 
    // Verify if hash to be inserted in contract is IPFS hash //
    var isIPFSHash = App.verifyIPFSHash(ipfsHash);
    if(!isIPFSHash){
	// Display message that hash is not ipfs hash //
	return(App.transactionInfo.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
		  	                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					    "<span aria-hidden='true'>&times;</span>"+
					  "</button>"+
					 "<p>Error when checking IPFS hash</p>"+
				    "</div>"));
    }
    // Ask to confirm transaction //
    App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
					"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					 "<span aria-hidden='true'>&times;</span>"+

					  "</button>"+
					"<p>File hash: "+ipfsHash+"</p>"+
					'<p>Confirm transaction <i class="fas fa-sync fa-spin fa-2x"></i> </p>'+
		  	                
				    "</div>");
      // If transaction is refused code bellow will fail and an message will be showed //
      try{
	   const transaction = await filestoreInstance.addFile(ipfsHash,fileName,{from: web3.eth.coinbase});
          console.log("Transaction: "+transaction.tx);
          // Show message that transaction has been submited and waiting for 1 confirmation //
          App.transactionInfo.html("<div class='alert alert-info alert-dismissible' role='alert'>"+
					"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					 "<span aria-hidden='true'>&times;</span>"+

					  "</button>"+
					'<p>File hash: '+ipfsHash+"</p>"+
				        "<p>Transaction hash: "+transaction.tx+" waiting 1 confirmation <i class='fas fa-sync fa-spin fa-2x'></i> </p></p>"+
		  	                
				    "</div>");
	   // Clear inputs //
           $('#input_file').val("");
           $('#input_name').val("");
	   $('#input_hash').val("");
           // Verify if transaction has been confirmed //
           interval = setInterval(function(){
	       web3.eth.getTransactionReceipt(transaction.tx, function(err,res){
		if(res.blockNumber != null){
		   // Show that transaction has been confirmed //
          	   App.transactionInfo.html("<div class='alert alert-success alert-dismissible' role='alert'>"+
					"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
					 "<span aria-hidden='true'>&times;</span>"+

					  "</button>"+
					'<p>File hash: '+ipfsHash+"</p>"+
				        "<p>Transaction hash: "+transaction.tx+" confirmed </p></p>"+
		  	                
				    "</div>");
		   // Show contract events and stop interval //
	           App.getUserFiles(fsContract)
                   App.getAllContractFiles(fsContract);		
		   clearInterval(interval); 
		}
	       });
	   },3000);
           
	  }catch(err){
		// Transaction refused //
		App.transactionInfo.html("<div class='alert alert-danger alert-dismissible' role='alert'>"+
						"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
						 "<span aria-hidden='true'>&times;</span>"+

						  "</button>"+
						"<p>Transaction refused</p>"+
			  	                
					    "</div>");
	  }

    $('.alert').alert();
  },
  
  // Verify if IPFS hash is ok //
  verifyIPFSHash:  function(ipfsHash){
	
	// For directory the ipfs.cat does not work //
	if((ipfsHash[0]+ipfsHash[1]) == "Qm" && ipfsHash.length == 46 ) {
              var isIPFSHash = true;  
        } else {
              var isIPFSHash = false;
	}	
        return(isIPFSHash);
  },

  getAllContractFiles: async function(fsContract) {
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();

   // Check FileUploaded event //
   var event = filestoreInstance.FileUploaded({},
                                              { fromBlock: 0, toBlock: 'latest' });
   $("#file_content").html("");
   $("#t_Cevents").html('<center><i class="fas fa-sync fa-spin fa-5x"></i></center>');
   await App.renderInfo(fsContract);
   await event.get((err, res) => {
      if (err){
        console.log('Error in FileUploaded event handler: ' + err);
        throw(err);
      } else {
        try{
          $("#t_Cevents").html('');
          for(i=0;i<res.length;i++){
            var ipfsHash = res[i].args.ipfshash;
            var fileId = res[i].args.fileId;
            var fileName = res[i].args.name;
            var owner = res[i].args.owner;
            $("#t_Cevents").append(  "<tr>"+
						"<td>"+owner+"</td> "+
		                                "<td>"+fileId+"</td> "+
		                                "<td>"+fileName+"</td>"+
		                                "<td><a href='https://ipfs.io/ipfs/"+ipfsHash+"' value='"+fileId+"'  target='_blank' >"+ipfsHash+"</a></td> "+
		                              "</tr>");

          }
          //$(".a_ipfs").click(App.renderDownloadButton);
        } catch(error){
          $("#t_Cevents").html('');
          console.log(error);
        }


      }

    });
    

  },
  getUserFiles: async function(fsContract) {
    var web3 = new Web3(App.web3Provider);
    const filestoreInstance = await fsContract.deployed();

   // Check FileUploaded event //
   var event = filestoreInstance.FileUploaded({owner: web3.eth.coinbase},
                                              { fromBlock: 0, toBlock: 'latest' });
   $("#file_content").html("");
   $("#t_events").html('<center><i class="fas fa-sync fa-spin fa-5x"></i></center>');
   await App.renderInfo(fsContract);
   await event.get((err, res) => {
      if (err){
        console.log('Error in FileUploaded event handler: ' + err);
        throw(err);
      } else {
        try{
          console.log('FileUploaded: ' + JSON.stringify(res[0].args));
          $("#t_events").html('');
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
          $("#t_events").html('');
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
    App.pageText.html("Decentralized File Store");


    await App.renderInfo(App.contracts.FileStore);
    App.root.html(App.sectionContractUse);
    $("#input_file").on("change",function(){
	const file = $('#input_file').prop('files')[0];
	$("#input_name").val(file.name);
        App.transactionInfo.html("");
    });
    $("#uploadDoc").click(function(){
	App.handleUpload();
    });
    $("#addIPFShash").click(function(){
	App.addIPFSHash(App.contracts.FileStore,
		        $("#input_hash").val(),
 			$("#input_name").val());
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
      $("#input_file").on("change",function(){
	const file = $('#input_file').prop('files')[0];
	$("#input_name").val(file.name);
        App.transactionInfo.html("");
      });
      $("#uploadDoc").click(function(){
	App.handleUpload();
      });
      $("#addIPFShash").click(function(){
	App.addIPFSHash(App.contracts.RestrictFileStore,
		        $("#input_hash").val(),
 			$("#input_name").val());
      });
      await App.getAllContractFiles(App.contracts.RestrictFileStore);
      return(App.getUserFiles(App.contracts.RestrictFileStore));
  },
};

$(function() {
  $(window).load(function() {
    $("#b_load").click(function(){
	App.init();
    });
    window.ethereum.on('accountsChanged', function () {
	  App.init();
    });
    window.ethereum.on('networkChanged', function () {
        App.init();
    });
  });
});
