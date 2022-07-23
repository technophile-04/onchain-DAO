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

	log('Deploying Governance... ');
	const governanceToken = await deploy('GovernanceToken', {
		from: deployer,
		args: [],
		log: true,
		waitConfirmations: networkConfig[chainId!].blockConfirmations || 1,
	});

	await delegate(governanceToken.address, deployer);
	log('Delegated...');

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log('Verifying...');
		await verify(governanceToken.address, []);
	}
};

const delegate = async (
	governanceTokenAddress: string,
	delegatedAccount: string
) => {
	const governanceToken: GovernanceToken = await ethers.getContractAt(
		'GovernanceToken',
		governanceTokenAddress
	);

	const txnRes = await governanceToken.delegate(delegatedAccount);
	await txnRes.wait(1);

	console.log(
		`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`
	);
};

export default deployFunc;

deployFunc.tags = ['all'];
