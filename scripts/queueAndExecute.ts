import { ethers, network } from 'hardhat';
import { developmentChains, networkConfig } from '../helper-hardhat.config';
import { Box, GovernorContract } from '../typechain-types';
import { moveBlocks } from '../utils/moveBlock';
import fs from 'fs';
import { moveTime } from '../utils/moveTime';

const chainId = network.config.chainId;

const { storeValue, votingDelay, minDelay } = networkConfig[chainId!];

async function queueAndExecute(
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

	const decHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDec));

	console.log('Queueing');

	const queueTx = await governor.queue(
		[box.address],
		[0],
		[encodedFunctionCallStore],
		decHash
	);

	await queueTx.wait(1);

	if (developmentChains.includes(network.name)) {
		await moveTime(minDelay + 1);
		await moveBlocks(1, 1000);
	}

	console.log('Executing');
	const executingTx = await governor.execute(
		[box.address],
		[0],
		[encodedFunctionCallStore],
		proposalDec
	);

	await executingTx.wait(1);

	const boxNewValue = await box.retrive();
	console.log(boxNewValue.toString(), 'Box newValue');
}

queueAndExecute([storeValue], 'store', 'Store 10 in the box')
	.then((result) => {
		return process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		return process.exit(1);
	});
