import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat.config';
import { verify } from '../utils/verify';

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, network } = hre;
	const { log, deploy } = deployments;
	const deployer = (await getNamedAccounts()).deployer;
	const { chainId } = network.config;

	const governanceToken = await ethers.getContract('GovernanceToken');
	const timeLock = await ethers.getContract('TimeLock');

	const { votingDelay, votingPeriod, quorumPercentage } =
		networkConfig[chainId!];
	log(`Quorum percentage is ${quorumPercentage}`);
	const args = [
		governanceToken.address,
		timeLock.address,
		votingDelay,
		votingPeriod,
		quorumPercentage,
	];

	log('Deploying  governor... ');
	const governorContract = await deploy('GovernorContract', {
		from: deployer,
		args,
		log: true,
		waitConfirmations: networkConfig[chainId!].blockConfirmations || 1,
	});
	log('Deployed...');

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log('Verifying...');
		await verify(governorContract.address, []);
	}
};

export default deployFunc;

deployFunc.tags = ['all'];
