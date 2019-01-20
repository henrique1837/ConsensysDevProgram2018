pragma solidity ^0.4.24;

import "installed_contracts/zeppelin/contracts/math/SafeMath.sol";
import "./FileStoreLib.sol";

/** @title FileStore.
  * @dev The FileStore Contract refer some IPFS hash to an wallet.
  * An IPFS hash should not be able to be inserted in the File struct when it already has an owner.
  * This contract should be the most simpliest possible and does not have an owner.
  */


contract FileStore {
    // -------- Variables ----------- //
    uint256 public totalFiles = 0;
    using SafeMath for uint256;

    mapping(address => bytes32[]) internal userFiles;
    mapping(bytes32 => FileStoreLib.File) internal files;

    // ---------- Events --------------- //

    event FileUploaded(address indexed owner,uint fileId,string name,string ipfshash);

  // ----------- Functions ----------- //
    // Modifiers //
    /**
      * @dev Throws if the hash to be uploaded already has an owner.
      */
    modifier hasNotOwner(bytes32 _hash){

        require(files[_hash].owner == 0);
        _;
    }



    /** @dev Allow an wallet to refer some IPFS hash to itself 
      * @param _ipfs is the ipfs hash generated when adding file in IPFS.
      * @param _name is a string that user has used to name the content in IPFS.
      * @return uint that is the fileId for the wallet that called the function
      */

    function addFile(string _ipfs,string _name)
             public
             hasNotOwner(FileStoreLib.getHash(_ipfs))
             returns(uint){
        bytes32 fhash = FileStoreLib.getHash(_ipfs);
        totalFiles = totalFiles.add(1);
        uint idFile = userFiles[msg.sender].length;
        userFiles[msg.sender].push(fhash);
        FileStoreLib.File storage f = files[fhash];
        FileStoreLib.addHash(f,idFile,_ipfs,_name);
        return(idFile);
    }



    /** @dev Get the owner of some file
      * @param _ipfs IPFS hash generated when adding file in IPFS.
      * @return address File owner
      */

    function getFileOwner(string _ipfs) public view returns(address){
      bytes32 fhash = FileStoreLib.getHash(_ipfs);
      return(FileStoreLib.getFileOwner(files[fhash]));
    }

    /** @dev Get File atributes ipfs and name
      * @param _addr Owner of the file
      * @param _id File id 
      * @return bytes32 File ipfs hash 
      * @return bytes32 File name hash 
      */

    function getUserFile(address _addr,uint256 _id) public view returns(bytes32,bytes32){
      bytes32 fileHash = userFiles[_addr][_id];
      FileStoreLib.File memory f = files[fileHash];
      return(f.ipfs,f.name);
    }

    /** @dev Return total files added by an wallet
      * @param _addr Owner of the files
      * @return uint Total files added by the wallet
      */

    function getTotalUserFiles(address _addr) public view returns(uint256){
      uint256 total = userFiles[_addr].length;
      return(total);
    }
    

    /** @dev Fallback function to return ether in case of sending ether to this contract
      */

    function() public {
        revert();
    }

}


