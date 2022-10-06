import {getConnection, getContracts, getKeypair, mintNewTokenForAccount, sleep} from "../utils";
import dotenv from "dotenv";
import {Connection, PublicKey} from "@solana/web3.js";

dotenv.config();

async function mintMoveForFiveAccounts(network: string, connection: Connection) {
    const payer = await getKeypair(0);
    const moveTokenAddress = getContracts()[network]['MOVE'];
    const movePubkey = new PublicKey(moveTokenAddress);

    for (let i = 0; i < 5; i++) {
        const receiver = await getKeypair(i);
        await mintNewTokenForAccount(
            payer,
            movePubkey,
            receiver.publicKey,
            connection,
        )
        await  sleep(10000);
    }
    console.log(`Mint MOVE token for five account success`);
}

(async function main() {
    const network = process.env.NETWORK;
    const connection = await getConnection(network);
    await mintMoveForFiveAccounts(network, connection);
})()
