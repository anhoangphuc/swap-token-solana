import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SwapToken } from "../target/types/swap_token";
import { createMint } from "@solana/spl-token";
import {airdropSol} from "../utils";
import base58 from "bs58";
import * as assert from "assert";
import {Keypair, PublicKey} from "@solana/web3.js";

describe("swap_token", () => {
  const provider = anchor.AnchorProvider.local();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.SwapToken as Program<SwapToken>;


  it("Is initialized!", async () => {
    // Add your test here.
    const user = anchor.web3.Keypair.generate();
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
        })
        .signers([user])
        .rpc();

    const state = await program.account.state.fetch(stateAccount);
    const moveToken = state.moveToken;
    assert.equal(mint.toBase58(), base58.encode(moveToken.toBytes()));

    const movePoolAccount = await program.account.movePool.fetch(movePool);
    assert.equal(movePoolAccount.balance, 0);
  });
});
