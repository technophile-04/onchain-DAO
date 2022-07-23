import { ethers, network } from 'hardhat';
import { developmentChains, networkConfig } from '../helper-hardhat.config';
import { Box, GovernorContract } from '../typechain-types';
import { moveBlocks } from '../utils/moveBlock';
import fs from 'fs';

const chainId = network.config.chainId;

const { storeValue, votingDelay } = networkConfig[chainId!];

async function proposer(
	args: any[],
	functionToCall: string,
	proposalDec: string
) {
	const governor: GovernorContract = await ethers.getContract(
		'GovernorContract'
	);
	const box = await ethers.getContract('Box');
	const encodedFunctionCallStore = box.interface.encodeFunctionData(
		functionToCall,
		args
	);
	console.log(
		`Proposing ${functionToCall} on ${box.address} with args ${args}`
	);

	const proposeTx = await governor.propose(
		[box.address],
		[0],
		[encodedFunctionCallStore],
		proposalDec
	);

	const proposeReceipt = await proposeTx.wait(1);

	const proposeId = proposeReceipt.events![0].args?.proposalId;

	let proposals = JSON.parse(fs.readFileSync('./proposals.json', 'utf-8'));

	proposals[chainId!.toString()].push(proposeId.toString());

	fs.writeFileSync('./proposals.json', JSON.stringify(proposals));

	if (developmentChains.includes(network.name)) {
		moveBlocks(votingDelay, 1000);
	}
}

proposer([storeValue], 'store', 'Store 10 in the box')
	.then((result) => {
		return process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		return process.exit(1);
	});
