// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonatypeRewards is ERC721, Ownable {
    uint256 public nextTokenId;
    uint256 public constant DEPOSIT_AMOUNT = 0.2 ether;

    mapping(address => uint256) public deposits;

    constructor() ERC721("Monatype Loser NFT", "MTL") Ownable(msg.sender) {}

    function deposit() public payable {
        require(msg.value == DEPOSIT_AMOUNT, "Deposit must be exactly 0.2 MON");
        deposits[msg.sender] += msg.value;
    }

    function mintLoserNft(address to) public onlyOwner {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }

    function sendWinnerReward(address winner, address loser) public onlyOwner {
        uint256 loserDeposit = deposits[loser];
        require(loserDeposit >= DEPOSIT_AMOUNT, "Loser has not deposited enough.");
        
        deposits[loser] = 0; // Reset loser's deposit

        (bool success, ) = winner.call{value: loserDeposit}("");
        require(success, "Failed to send reward to winner.");
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed.");
    }
}
