export interface networkConfigItem {
	blockConfirmations?: number;
	minDelay: number;
	votingDelay: number;
	votingPeriod: number;
	quorumPercentage: number;
	storeValue: number;
}

export interface networkConfigInfo {
	[key: number]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
	4: {
		minDelay: 3600,
		blockConfirmations: 6,
		votingDelay: 1,
		votingPeriod: 5,
		quorumPercentage: 4,
		storeValue: 10,
	},
	31337: {
		minDelay: 3600,
		blockConfirmations: 1,
		votingDelay: 1,
		votingPeriod: 5,
		quorumPercentage: 4,
		storeValue: 10,
	},
};

const developmentChains = ['hardhat', 'localhost'];

export { networkConfig, developmentChains };
