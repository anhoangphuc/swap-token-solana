import { Keypair, Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import dotenv from "dotenv";
import * as Cluster from "cluster";

dotenv.config();

async function getConnection(): Promise<Connection> {
    const network = process.env.NETWORK;
    const commitment = 'confirmed';
    let connection: Connection;
    if (['devnet','testnet','mainnet-beta'].indexOf(network) >= 0) {
        connection = new Connection(clusterApiUrl(network as any), commitment)
    } else if (network === 'local') {
        connection = new Connection('http://127.0.0.1:8899', commitment);
    } else {
        throw Error(`Network config errored ${network}`);
    }
    return connection;
}

async function airdropSol(payer: Keypair, connection: Connection) {
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


(async function main() {
    const payer = Keypair.generate();
    const connection =  await getConnection();
    console.log(`payer address is ${payer.publicKey}`);
    await airdropSol(payer, connection);
})()


