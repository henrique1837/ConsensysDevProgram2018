pragma solidity ^0.4.24;

import "./FileStore.sol";
import "installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "installed_contracts/zeppelin/contracts/lifecycle/Destructible.sol";
import "installed_contracts/zeppelin/contracts/lifecycle/Pausable.sol";


/** @title RestrictFileStore.
  * @dev The RestrictFileStore Contract refer some IPFS hash to an wallet that is allowed to do it.
  * An IPFS hash should not be able to be inserted in the File struct when it already has an owner.
  * This contract has an owner that can add others wallets to become admins and be able to use it
  * too.
  */


contract RestrictFileStore is FileStore,Destructible,Pausable{
    // -------- Variables ----------- //
    mapping(address => bool) private admin;

    // ---------- Events --------------- //

    event AdminAdded(address addr);
    event AdminRemoved(address addr);

    // ----------- Functions ----------- //
    // Modifiers //

    /**
      * @dev Throws if wallet that calls functions is not an admin inside contract.
      */
 
    modifier isAdmin{
        require(admin[msg.sender] == true);
        _;
    }

    /** @dev The RestrictFileStore constructor set the owner as an admin
      */    

    constructor() public {
      admin[msg.sender] = true;
      emit AdminAdded(msg.sender);
    }

    /** @dev Allow an wallet to refer some IPFS hash to itself if it is an admin
      * inside contract, the contract is not paused and the file has no owner.
      * @param _ipfs is the ipfs hash generated when adding file in IPFS.
      * @param _name is a string that user has used to name the content in IPFS.
      * @return uint that is the fileId for the wallet that called the function
      */

    function addFile(string _ipfs,string _name)
             public
             hasNotOwner(FileStoreLib.getHash(_ipfs))
             whenNotPaused
             isAdmin
             returns(uint){
        uint idFile = super.addFile(_ipfs,_name);
        return(idFile);
    }

     /** @dev Add some wallet as admin.
      * @param _addr The wallet to be added as admin.
      * @return bool True if wallet has been added, false if not.
      */

    function addAdmin(address _addr)
              public
              onlyOwner
              whenNotPaused
              returns(bool) {
        require(admin[_addr] == false);
        admin[_addr] = true;
        emit AdminAdded(_addr);
        return(true);
    }

    /** @dev Remove some wallet as admin if it not the owner itself.
      * @param _addr The wallet to be removed as admin.
      * @return bool True if wallet has been removed, false if not.
      */

    function removeAdmin(address _addr)
              public
              onlyOwner
              returns(bool) {
      require(admin[_addr] == true && _addr != owner);
      admin[_addr] = false;
      emit AdminRemoved(_addr);
      return(true);
    }

    /** @dev Verify if some wallet is admin inside contract.
      * @param _addr The wallet to checked as admin or not.
      * @return bool True if wallet has is admin, false if not.
      */

    function checkIsAdmin(address _addr) public view returns(bool){
      return(admin[_addr]);
    }

}
