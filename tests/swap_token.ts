import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SwapToken } from "../target/types/swap_token";
import {createMint} from "@solana/spl-token";
import {airdropSol} from "../utils";

describe("swap_token", () => {
  const provider = anchor.AnchorProvider.local();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.SwapToken as Program<SwapToken>;


  it("Is initialized!", async () => {
    // Add your test here.
    const user = anchor.web3.Keypair.generate();
    await airdropSol(user, provider.connection);

    const mint = await createMint(
        provider.connection,
        user,
        user.publicKey,
        user.publicKey,
        9,
    );

    console.log(`Deploy new token at ${mint.toBase58()}`)

    await program.methods.initialize()
        .accounts({
          userPuller: user.publicKey,
          moveToken: mint,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
  });
});
