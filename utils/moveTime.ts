import { network } from 'hardhat';
import { deflate } from 'zlib';

export async function moveTime(timeInMiliSec: number) {
	console.log('Moving Time...');

	await network.provider.send('evm_increaseTime', [timeInMiliSec]);

	console.log(`Move foward ${timeInMiliSec}`);
}
