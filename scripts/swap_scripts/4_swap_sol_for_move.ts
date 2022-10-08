import * as anchor from "@project-serum/anchor";

import dotenv from "dotenv";
import {
    confirmTransaction,
    getAccounts,
    getKeypair,
    loadDefaultUser,
    loadMoveToken,
    loadSwapProgram
} from "../../utils";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {getAccount, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID} from "@solana/spl-token";
dotenv.config();
(async function main() {
    const network = process.env.NETWORK;
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const moveToken = await loadMoveToken(network);
    const program = await loadSwapProgram(network);

    const [stateAccount,] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("swap_rem"))],
        program.programId,
    );

    const [movePoolAccount,] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("move_pool"))],
        program.programId,
    );
    const state = await program.account.state.fetch(stateAccount);
    const puller = state.userPuller;

    const swapper = await getKeypair(1)
    const swapperTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        swapper,
        moveToken,
        swapper.publicKey,
    );

    await provider.connection.requestAirdrop(swapper.publicKey, LAMPORTS_PER_SOL);
    console.log(`balance of swapper is ${await provider.connection.getBalance(swapper.publicKey)}`);

    const tx = await program.methods.swap(new anchor.BN(1000))
        .accounts({
            movePool: movePoolAccount,
            state: stateAccount,
            swapper: swapper.publicKey,
            swapperTokenAccount: swapperTokenAccount.address,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            puller: puller,
        })
        .signers([swapper])
        .rpc();

    await confirmTransaction(provider.connection, tx);
    console.log(`balance of swapper is ${await provider.connection.getBalance(swapper.publicKey)}`);
})()