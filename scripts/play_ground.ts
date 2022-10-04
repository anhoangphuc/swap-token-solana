import {Connection, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import dotenv from "dotenv";
import { getConnection } from "./utils";

dotenv.config();

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
    const network = process.env.NETWORK;
    const connection =  await getConnection(network);
    console.log(`payer address is ${payer.publicKey}`);
    await airdropSol(payer, connection);
})()


