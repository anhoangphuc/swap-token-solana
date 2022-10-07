import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SwapToken } from "../target/types/swap_token";
import {createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {airdropSol, mintNewTokenForAccount} from "../utils";
import base58 from "bs58";
import * as assert from "assert";
import {Keypair, PublicKey} from "@solana/web3.js";
import {use} from "chai";
import {min} from "bn.js";

describe("swap_token", () => {
  const provider = anchor.AnchorProvider.local();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.SwapToken as Program<SwapToken>;


  it("Is initialized!", async () => {
    // Add your test here.
    const user = anchor.web3.Keypair.generate();
    const staker = anchor.web3.Keypair.generate();
    const [stateAccount,] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("swap_rem"))],
        program.programId,
    )
      const [movePool,] = await PublicKey.findProgramAddress(
          [Buffer.from(anchor.utils.bytes.utf8.encode("move_pool"))],
          program.programId,
      )
    await airdropSol(user, provider.connection);

    const mint = await createMint(
        provider.connection,
        user,
        user.publicKey,
        user.publicKey,
        9,
    );

    await program.methods.initialize()
        .accounts({
          userPuller: user.publicKey,
          moveToken: mint,
          systemProgram: anchor.web3.SystemProgram.programId,
          state: stateAccount,
          movePool: movePool,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

    const state = await program.account.state.fetch(stateAccount);
    const moveToken = state.moveToken;
    const balance = state.balance;
    assert.equal(mint.toBase58(), base58.encode(moveToken.toBytes()));
    assert.equal(balance, 0);

    await mintNewTokenForAccount(
        user,
        mint,
        staker.publicKey,
        provider.connection,
        2000000000,
    );

    const userStakeToken = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        mint,
        staker.publicKey,
    );
    console.log(`user balance is ${userStakeToken.amount}`);


    await program.methods.stake(new anchor.BN(1000000000))
        .accounts({
            movePool: movePool,
            state: stateAccount,
            userStakeToken: userStakeToken.address,
            userStake: staker.publicKey,
            moveToken: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([staker])
        .rpc();

    const movePoolAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        mint,
        movePool,
        true,
    )
      const userStakeToken1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          user,
          mint,
          staker.publicKey,
      );
      console.log(`user balance is ${userStakeToken1.amount}`);
      console.log(`Move pool balance is ${movePoolAccount.amount}`);
  });
});
