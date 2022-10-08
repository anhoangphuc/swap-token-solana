import * as anchor from "@project-serum/anchor";
import {loadMoveToken, loadSwapProgram} from "../../utils";
import dotenv from "dotenv";
import { PublicKey } from "@solana/web3.js";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
dotenv.config();

(async function main () {
    const network = process.env.NETWORK;
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = await loadSwapProgram(network);
    const moveToken = loadMoveToken(network);
    const user = provider.wallet;

    console.log(`Load program success`);
    const [stateAccount,] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("swap_rem"))],
        program.programId,
    );

    const [movePoolAccount,] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("move_pool"))],
        program.programId,
    );

    await program.methods.initialize()
        .accounts({
            userPuller: user.publicKey,
            moveToken: moveToken,
            state: stateAccount,
            movePool: movePoolAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
})()