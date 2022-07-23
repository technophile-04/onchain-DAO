// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable {
    /* Storage variables */
    uint256 internal s_vlaue;

    /* Events */
    event valueChanged(uint256 newValue);

    /* Public functions */
    function store(uint256 newValue) public onlyOwner {
        s_vlaue = newValue;
        emit valueChanged(newValue);
    }

    function retrive() public view returns (uint256) {
        return s_vlaue;
    }
}
