pragma solidity ^0.4.17;

import "./SafeMath.sol";



library FileStoreLib {
    struct File {
      bytes32 ipfs;
      bytes32 name;
      address owner;
    }
    // ---------- Events --------------- //

    event FileUploaded(address indexed owner,uint fileId,string name,string ipfshash);

    function addHash(File storage f,uint _idFile,string _ipfs,string _name)
             public {
	bytes32 fhash = getHash(_ipfs);
	bytes32 hashName = getHash(_name);
        f.ipfs = fhash;
        f.name = hashName;
        f.owner = msg.sender;
        emit FileUploaded(msg.sender,_idFile,_name,_ipfs);
    }
    // Get Hash from IPFS hash and address //
    function getHash(string _str) public pure returns(bytes32){
        bytes32 fhash = keccak256(abi.encodePacked(_str));
        return(fhash);
    }
    function getFileOwner(File storage f) public view returns(address){
      return(f.owner);
    }
}

contract FileStore2 {
    // -------- Variables ----------- //
    uint256 public totalFiles = 0;
    using SafeMath for uint256;

    mapping(address => bytes32[]) internal userFiles;
    mapping(bytes32 => FileStoreLib.File) internal files;

    // ----------- Functions ----------- //
    // Modifiers //
    modifier hasNotOwner(bytes32 _hash){

        require(files[_hash].owner == 0);
        _;
    }

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
    function getFileOwner(string _ipfs) public view returns(address){
      bytes32 fhash = FileStoreLib.getHash(_ipfs);
      return(FileStoreLib.getFileOwner(files[fhash]));
    }
    function getUserFile(address _addr,uint256 _id) public view returns(bytes32,bytes32){
      bytes32 fileHash = userFiles[_addr][_id];
      FileStoreLib.File memory f = files[fileHash];
      return(f.ipfs,f.name);
    }
    function getTotalUserFiles(address _addr) public view returns(uint256){
      uint256 total = userFiles[_addr].length;
      return(total);
    } 


}



/*  FileStore Contract should be not owned by anyone and will map an address to an array of
  File Structure. Anyone can add ipfs hashes and a filename to the contract but only if that
  ipfs hash has not been inserted in the contract to avoid multiple onwer of file
*/


contract FileStore{
    // -------- Variables ----------- //
    uint256 public totalFiles = 0;
    using SafeMath for uint256;
    struct File {
      bytes32 ipfs;
      bytes32 name;
      address owner;
    }
    mapping(address => bytes32[]) internal userFiles;
    mapping(bytes32 => File) internal files;

    // ---------- Events --------------- //

    event FileUploaded(address indexed owner,uint fileId,string name,string ipfshash);

    // ----------- Functions ----------- //
    // Modifiers //
    modifier hasNotOwner(bytes32 _hash){

        require(files[_hash].owner == 0);
        _;
    }
    // Add File (after uploading to ipfs //
    function addFile(string _ipfs,string _name)
             public
             hasNotOwner(getHash(_ipfs))
             returns(uint){
        bytes32 fhash = getHash(_ipfs);
        totalFiles = totalFiles.add(1);
        uint idFile = userFiles[msg.sender].length;
        userFiles[msg.sender].push(fhash);
        File storage f = files[fhash];
        f.ipfs = fhash;
        f.name = getHash(_name);
        f.owner = msg.sender;
        emit FileUploaded(msg.sender,idFile,_name,_ipfs);
        return(idFile);
    }

    function getFileOwner(string _ipfs) public view returns(address){
      bytes32 fhash = getHash(_ipfs);
      return(files[fhash].owner);
    }
    function getUserFile(address _addr,uint256 _id) public view returns(bytes32,bytes32){
      bytes32 fileHash = userFiles[_addr][_id];
      File memory f = files[fileHash];
      return(f.ipfs,f.name);
    }
    function getTotalUserFiles(address _addr) public view returns(uint256){
      uint256 total = userFiles[_addr].length;
      return(total);
    }
    // Get Hash from IPFS hash and address //
    function getHash(string _str) public pure returns(bytes32){
        bytes32 fhash = keccak256(abi.encodePacked(_str));
        return(fhash);
    }
    // Fallback function to return ether in case of sending ether to this contract //
    function() public {
        revert();
    }

}
