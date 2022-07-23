import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat.config';
import { GovernanceToken } from '../typechain-types';
import { verify } from '../utils/verify';

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, network } = hre;
	const { log, deploy } = deployments;
	const deployer = (await getNamedAccounts()).deployer;
	const { chainId } = network.config;

	const MIN_DELAY = networkConfig[chainId!].minDelay;

	log('Deploying TimeLock... ');
	const timeLock = await deploy('TimeLock', {
		from: deployer,
		args: [MIN_DELAY, [], []],
		log: true,
		waitConfirmations: networkConfig[chainId!].blockConfirmations || 1,
	});
	log('Deployed...');

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log('Verifying...');
		await verify(timeLock.address, [MIN_DELAY, [], []]);
	}
};

export default deployFunc;

deployFunc.tags = ['all'];
