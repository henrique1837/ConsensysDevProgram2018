## Avoiding commom attacks

 To avoid Integer Overflow and Underflow the SafeMath library was used to avoid overflow when adding the variable "totalFiles" of the contract whenever an user call "addIPFSHash" function. The SafeMath library will require that the sum 'c' of two integers 'a' and 'b' is greater or equal than 'a' before returning the sum.

 To avoid DoS With Block Gas Limit there is no method that require looping across any array


 To avoid Incorrect Constructor Name all constructors of contracts are declared as "constructor()" or ommited when the deploying of the contract does not change any variable.

 To avoid Use of Deprecated Solidity Functions keccak256 , revert and view functions where used instead of sha3 , throw and constant.




