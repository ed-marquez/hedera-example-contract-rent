import { ContractCreateFlow, ContractUpdateTransaction, ContractExecuteTransaction, ContractCallQuery, Timestamp } from "@hashgraph/sdk";

export async function deployContractFcn(bytecode, params, gasLim, autorenewAcc, autorenewAccKey, cAdminKey, client) {
	const contractCreateTx = new ContractCreateFlow()
		.setBytecode(bytecode)
		.setConstructorParameters(params)
		.setGas(gasLim)
		// .setAutoRenewPeriod(7776000) //  Default: 7776000sec = 90days. [2592000 (30 days) to 8000001 (92.5 days)]
		.setAutoRenewAccountId(autorenewAcc)
		.setAdminKey(cAdminKey);
	const contractCreateSign1 = await contractCreateTx.sign(autorenewAccKey);
	const contractCreateSign2 = await contractCreateSign1.sign(cAdminKey);
	const contractCreateSubmit = await contractCreateSign2.execute(client);
	const contractCreateRx = await contractCreateSubmit.getReceipt(client);
	const contractId = contractCreateRx.contractId;
	const contractAddress = contractId.toSolidityAddress();
	return [contractId, contractAddress];
}

export async function updateContractFcn(cId, cAdminKey, client) {
	// const newExpirationTime = new Timestamp(1682098273);

	const contractUpdateTx = new ContractUpdateTransaction()
		.setContractId(cId)
		.setAutoRenewPeriod(8000001) //  Default: 7776000sec = 90days. [2592000 (30 days) to 8000001 (92.5 days)]
		// .setAutoRenewAccountId(autorenewAcc);
		// .setExpirationTime(newExpirationTime)
		.freezeWith(client);
	const contractUpdateSign = await contractUpdateTx.sign(cAdminKey);
	const contractUpdateSubmit = await contractUpdateSign.execute(client);
	const contractUpdateRec = await contractUpdateSubmit.getRecord(client);
	return contractUpdateRec;
}

export async function executeContractFcn(cId, fcnName, gasLim, client) {
	const contractExecuteTx = new ContractExecuteTransaction().setContractId(cId).setGas(gasLim).setFunction(fcnName);
	const contractExecuteSubmit = await contractExecuteTx.execute(client);
	const contractExecuteRec = await contractExecuteSubmit.getRecord(client);
	return contractExecuteRec;
}

export async function callContractFcn(cId, fcnName, gasLim, client) {
	const contractCallTx = new ContractCallQuery().setContractId(cId).setGas(gasLim).setFunction(fcnName);
	const contractCallSubmit = await contractCallTx.execute(client);
	return contractCallSubmit;
}
