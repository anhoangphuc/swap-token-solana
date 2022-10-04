import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import fs from "fs";
import path from "path";
import bs58 from "bs58";

export async function getConnection(network: string): Promise<Connection> {
    const commitment = 'confirmed';
    let connection: Connection;
    if (['devnet', 'testnet', 'mainnet-beta'].indexOf(network) >= 0) {
        connection = new Connection(clusterApiUrl(network as any), commitment)
    } else if (network === 'local') {
        connection = new Connection('http://127.0.0.1:8899', commitment);
    } else {
        throw Error(`Network config errored ${network}`);
    }
    return connection;
}

export async function airdropSol(payer: Keypair, connection: Connection) {
    const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL,
    );

    const latestBLockhash = await  connection.getLatestBlockhash();

    await  connection.confirmTransaction({
        blockhash: latestBLockhash.blockhash,
        lastValidBlockHeight: latestBLockhash.lastValidBlockHeight,
        signature: airdropSignature,
    });
    console.log(`Airdrop success to account ${payer.publicKey}`);
    const balanceAccount = await connection.getBalance(payer.publicKey);
    console.log(`Balance of account ${payer.publicKey} is ${balanceAccount}`);
}

export function getContracts() {
    let json;
    try {
        json = fs.readFileSync(path.join(__dirname, '../data/contract_addresses.json'), 'utf-8') || '{}';
    } catch {
        json = '{}';
    }
    return JSON.parse(json);
}

export async function saveContract(network: string, contract: string, address: string) {
    const addresses = getContracts();
    addresses[network] = addresses[network] || {};
    addresses[network][contract] = address;
    fs.writeFileSync(path.join(__dirname, '../data/contract_addresses.json'),
        JSON.stringify(addresses, null, "    "));
}

export function getAccounts(index?: number) {
    let json;
    try {
        json = fs.readFileSync(path.join(__dirname, '../data/accounts.json'), 'utf-8') || '{}';
    } catch {
        json = '{}';
    }
    const accounts = JSON.parse(json) ;
    if (index === undefined || index === null) {
        return accounts;
    } else {
        return accounts[`account${index}`];
    }
}

export async function getKeypair(index: number): Promise<Keypair> {
    const secretKey = await getAccounts(index);
    const keypair = Keypair.fromSecretKey(bs58.decode(secretKey));
    return keypair;
}

export async function saveAccount(keypair: Keypair, index: number) {
    const accounts = getAccounts();
    const accountIndex = `account${index}`;
    accounts[accountIndex] = bs58.encode(keypair.secretKey);
    fs.writeFileSync(path.join(__dirname, '../data/accounts.json'),
        JSON.stringify(accounts, null, "    "));
}