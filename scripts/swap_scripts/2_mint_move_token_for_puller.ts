import * as anchor from "@project-serum/anchor";
import {getKeypair, loadMoveToken, mintNewTokenForAccount} from "../../utils";
import dotenv from "dotenv";
import {getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount} from "@solana/spl-token";
dotenv.config();

(async function main () {
    const network = process.env.NETWORK;
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const minter = await getKeypair(0);
    const moveToken = loadMoveToken(network)
    const tokenAccount = await mintNewTokenForAccount(
        minter,
        moveToken,
        provider.wallet.publicKey,
        provider.connection,
        2000000000,
    );
    console.log(`Balance of user is ${tokenAccount.amount}`);
})()