import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import {confirmTransaction, loadDefaultUser, loadMoveToken, loadSwapProgram} from "../../utils";
import {Keypair, PublicKey} from "@solana/web3.js";
import {getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID} from "@solana/spl-token";
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
    const user = loadDefaultUser();

    const userStakeToken = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        moveToken,
        user.publicKey,
    )

    const tx = await program.methods.stake(new anchor.BN("4000000000"))
        .accounts({
            movePool: movePoolAccount,
            state: stateAccount,
            userStakeToken: userStakeToken.address,
            userStake: user.publicKey,
            moveToken: moveToken,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

    await confirmTransaction(provider.connection, tx);
    console.log(`Transaction ${tx} success`);
})()