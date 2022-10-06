import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SwapToken } from "../target/types/swap_token";
import {createMint} from "@solana/spl-token";
import {airdropSol} from "../utils";
import base58 from "bs58";
import base = Mocha.reporters.base;
import * as assert from "assert";

describe("swap_token", () => {
  const provider = anchor.AnchorProvider.local();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.SwapToken as Program<SwapToken>;


  it("Is initialized!", async () => {
    // Add your test here.
    const user = anchor.web3.Keypair.generate();
    const stateAccount = anchor.web3.Keypair.generate();
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
          state: stateAccount.publicKey,
        })
        .signers([user, stateAccount])
        .rpc();

    const state = await program.account.state.fetch(stateAccount.publicKey);
    const moveToken = state.moveToken;
    assert.equal(mint.toBase58(), base58.encode(moveToken.toBytes()));
  });
});
