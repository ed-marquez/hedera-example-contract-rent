console.clear();
import { Client, AccountId, PrivateKey, Hbar } from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();

import * as contracts from "./utils/contractOperations.js";
import * as queries from "./utils/queries.js";
import accountCreateFcn from "./utils/accountCreate.js";
import counterContract from "./contracts/Counter.json" assert { type: "json" };

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const network = process.env.HEDERA_NETWORK;
const client = Client.forNetwork(network).setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(1000));
client.setMaxQueryPayment(new Hbar(50));

async function main() {
	// STEP 1 ===================================
	console.log(`\nSTEP 1 ===================================\n`);
	console.log(`- Creating Alice's account...\n`);

	const initBal = new Hbar(50);
	const aliceKey = PrivateKey.generateECDSA();
	const [aliceSt, aliceId] = await accountCreateFcn(aliceKey, initBal, client);
	console.log(`- Alice's account: https://hashscan.io/${network}/account/${aliceId}`);

	// STEP 2 ===================================
	console.log(`\nSTEP 2 ===================================\n`);
	console.log(`- Deploying contract autorenewed by Alice...\n`);

	// Deploy the called contract (counter)
	const cAdminKey = PrivateKey.generateECDSA();
	let gasLim = 8000000;
	const bytecode = counterContract.object;
	const params = [];
	const [contractId, contractAddress] = await contracts.deployContractFcn(bytecode, params, gasLim, aliceId, aliceKey, cAdminKey, client);
	console.log(`- Contract ID: ${contractId}`);
	console.log(`- Contract ID in Solidity address format: ${contractAddress}`);

	// Get details from mirror node
	console.log(`\n- Get details from mirror node:`);
	console.log(`- REST API: https://${network}.mirrornode.hedera.com/api/v1/contracts/${contractId}`);
	console.log(`- Explorer: https://hashscan.io/${network}/contract/${contractId}`);

	// STEP 3 ===================================
	console.log(`\nSTEP 3 ===================================\n`);
	console.log(`- Updating contract's autorenew period to 92.5 days...\n`);

	const updateContractRec = await contracts.updateContractFcn(contractId, cAdminKey, client);
	console.log(`- Contract update status: ${updateContractRec.receipt.status}`);

	// Get details from mirror node
	const [ucMirrorQuery, ucHashscanUrl, ucMirrorRestApi] = await queries.mirrorTxQueryFcn(updateContractRec, network);
	console.log(`\n- Get details from mirror node:`);
	console.log(`- REST API: ${ucMirrorRestApi}`);
	console.log(`- Explorer: ${ucHashscanUrl}`);

	console.log(`
====================================================
🎉🎉 THE END - NOW JOIN: https://hedera.com/discord
====================================================\n`);
}
main();
