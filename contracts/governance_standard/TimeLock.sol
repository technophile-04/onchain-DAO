// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    /**
     * @dev constructor to initalize TimeLockController
     * @param _minDelay How long one has to wait before executing
     * @param _proposers list of adddress that can propose
     * @param _executors list of adddress who can execute when a proposal passes
     */

    constructor(
        uint256 _minDelay,
        address[] memory _proposers,
        address[] memory _executors
    ) TimelockController(_minDelay, _proposers, _executors) {}
}
