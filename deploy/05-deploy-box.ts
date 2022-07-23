import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat.config';
import { Box, GovernanceToken, TimeLock } from '../typechain-types';
import { verify } from '../utils/verify';

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, network } = hre;
	const { log, deploy } = deployments;
	const deployer = (await getNamedAccounts()).deployer;
	const { chainId } = network.config;

	log('Deploying Box... ');
	const box = await deploy('Box', {
		from: deployer,
		args: [],
		log: true,
		waitConfirmations: networkConfig[chainId!].blockConfirmations || 1,
	});
	log('Deployed...');

	const timeLock: TimeLock = await ethers.getContract('TimeLock');
	const boxContract: Box = await ethers.getContract('Box');

	const transferOwnerTx = await boxContract.transferOwnership(timeLock.address);
	await transferOwnerTx.wait(1);

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log('Verifying...');
		await verify(box.address, []);
	}
};

export default deployFunc;

deployFunc.tags = ['all'];
