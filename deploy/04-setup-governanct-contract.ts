import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat.config';
import { TimeLock } from '../typechain-types';
import { verify } from '../utils/verify';

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts, network } = hre;
	const { log, deploy } = deployments;
	const deployer = (await getNamedAccounts()).deployer;
	const { chainId } = network.config;

	const governanceToken = await ethers.getContract('GovernanceToken');
	const timeLock: TimeLock = await ethers.getContract('TimeLock');
	const governor = await ethers.getContract('GovernorContract');

	log('Setting up roles... ');

	const proposerRole = await timeLock.PROPOSER_ROLE();
	const executorRole = await timeLock.EXECUTOR_ROLE();
	const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

	const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
	await proposerTx.wait(1);
	const executorTx = await timeLock.grantRole(
		executorRole,
		ethers.constants.AddressZero
	);
	await executorTx.wait(1);

	const revokeTx = await timeLock.revokeRole(adminRole, deployer);
	await revokeTx.wait(1);
};

export default deployFunc;

deployFunc.tags = ['all'];
