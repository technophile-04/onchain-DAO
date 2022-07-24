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

	if (developmentChains.includes(network.name)) {
		await moveBlocks(votingDelay + 1, 1000);
	}

	const proposeReceipt = await proposeTx.wait(1);

	const proposeId = proposeReceipt.events![0].args?.proposalId;

	let proposals = JSON.parse(fs.readFileSync('./proposals.json', 'utf-8'));

	const proposalState = await governor.state(proposeId);
	const proposalSnapShot = await governor.proposalSnapshot(proposeId);
	const proposalDeadline = await governor.proposalDeadline(proposeId);

	proposals[chainId!.toString()].push(proposeId.toString());

	fs.writeFileSync('./proposals.json', JSON.stringify(proposals));

	console.log(`Current Proposal State: ${proposalState}`);
	console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
	console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}

proposer([storeValue], 'store', 'Store 10 in the box')
	.then((result) => {
		return process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		return process.exit(1);
	});
