pragma solidity ^0.4.24;


/** @title FileStoreLib.
  * @dev The FileStoreLib is a library that should be used to facilitate and reduce gas cost of    
  * referring an file stored in IPFS to an wallet
  */
library FileStoreLib {
    
    struct File {
      bytes32 ipfs;
      bytes32 name;
      address owner;
    }
 
    event FileUploaded(address indexed owner,uint fileId,string name,string ipfshash);
 
    /** @dev Allow an wallet to refer some IPFS hash to itself 
      * @param f File struct.
      * @param _idFile Uint that is used as id.
      * @param _ipfs IPFS hash generated when adding file in IPFS.
      * @param _name String that user has used to name the content in IPFS.
      */

    function addHash(File storage f,uint _idFile,string _ipfs,string _name)
             public {
	bytes32 fhash = getHash(_ipfs);
	bytes32 hashName = getHash(_name);
        f.ipfs = fhash;
        f.name = hashName;
        f.owner = msg.sender;
	emit FileUploaded(msg.sender,_idFile,_name,_ipfs);

    }


    /** @dev Return the bytes32 keccak256 hash from an string
      * @param _str The string that will be transformed into bytes32.
      * @return bytes32 Hash of the string.
      */
    function getHash(string _str) public pure returns(bytes32){
        bytes32 fhash = keccak256(abi.encodePacked(_str));
        return(fhash);
    } 
    /** @dev Get an owner of some file.
      * @param f File struct.
      * @return address The owner of the file.
      */
    function getFileOwner(File storage f) public view returns(address){
      return(f.owner);
    }
}

