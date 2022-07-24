import { ethers, network } from 'hardhat';
import { developmentChains, networkConfig } from '../helper-hardhat.config';
import { Box, GovernorContract } from '../typechain-types';
import { moveBlocks } from '../utils/moveBlock';
import fs from 'fs';
const index = 0;
const chainId = network.config.chainId;

const { storeValue, votingDelay, votingPeriod } = networkConfig[chainId!];

async function main(proposalIndex: number) {
	const governor: GovernorContract = await ethers.getContract(
		'GovernorContract'
	);

	const secPlayer = (await ethers.getSigners())[1];

	const proposals = JSON.parse(fs.readFileSync('./proposals.json', 'utf-8'));

	const proposalId = proposals[chainId!][proposalIndex];

	const voteAway = 1;

	const reason = 'I like Messi';

	const voterTxRes = await governor.castVoteWithReason(
		proposalId,
		voteAway,
		reason
	);

	const voteTxReceipt = await voterTxRes.wait(1);

	console.log(voteTxReceipt.events![0].args);
	const proposalState = await governor.state(proposalId);
	console.log(`Current Proposal State: ${proposalState}`);

	if (developmentChains.includes(network.name)) {
		await moveBlocks(votingPeriod + 1, 1000);
	}

	console.log('voted ready to go !');
}

main(index)
	.then((result) => {
		return process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		return process.exit(1);
	});
