import { createMint } from "@solana/spl-token";
import { Connection, Keypair} from "@solana/web3.js";
import dotenv from "dotenv";
import {airdropSol, getConnection, saveContract} from "./utils";

dotenv.config();

async function generateToken(
    payer: Keypair,
    mintAuthority: Keypair,
    freezeAuthority: Keypair,
    connection: Connection,
    network: string,
) {
    const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        9,
    );
    console.log(`Create MOVE token success at address ${mint.toBase58()}`);
    await saveContract(network, 'MOVE', mint.toBase58());
}

(async function main() {
    const network = process.env.NETWORK;
    const connection = await getConnection(network);
    const payer = Keypair.generate();
    await airdropSol(payer, connection);
    await  generateToken(payer, payer, payer, connection, network);
})()