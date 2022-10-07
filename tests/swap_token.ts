import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SwapToken } from "../target/types/swap_token";
import {createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {airdropSol, mintNewTokenForAccount} from "../utils";
import base58 from "bs58";
import * as assert from "assert";
import {PublicKey} from "@solana/web3.js";
import {expect} from "chai";

describe("swap_token", () => {
  const provider = anchor.AnchorProvider.local();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.SwapToken as Program<SwapToken>;
  const user = anchor.web3.Keypair.generate();
  let _mint: PublicKey;
  let _stateAccount: PublicKey, _movePoolAccount: PublicKey;


  it("Is initialized!", async () => {
    // Add your test here.
    await airdropSol(user, provider.connection);
    const [stateAccount,] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("swap_rem"))],
        program.programId,
    );
    _stateAccount = stateAccount;

      const [movePoolAccount,] = await PublicKey.findProgramAddress(
          [Buffer.from(anchor.utils.bytes.utf8.encode("move_pool"))],
          program.programId,
      );
    _movePoolAccount = movePoolAccount;

    const mint = await createMint(
        provider.connection,
        user,
        user.publicKey,
        user.publicKey,
        9,
    );
    _mint = mint;

    await program.methods.initialize()
        .accounts({
          userPuller: user.publicKey,
          moveToken: mint,
          systemProgram: anchor.web3.SystemProgram.programId,
          state: stateAccount,
          movePool: movePoolAccount,
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

  });

  it(`User stake success`, async () => {
      const staker = anchor.web3.Keypair.generate();
      const [mint, stateAccount, movePoolAccount] = [_mint, _stateAccount, _movePoolAccount];
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

      const stakeAmount = new anchor.BN(1000000000);

      await program.methods.stake(stakeAmount)
          .accounts({
              movePool: movePoolAccount,
              state: stateAccount,
              userStakeToken: userStakeToken.address,
              userStake: staker.publicKey,
              moveToken: mint,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([staker])
          .rpc();

      const state = await program.account.state.fetch(stateAccount);
      assert.ok(state.balance.eq(stakeAmount));
      const userStakeToken1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          user,
          mint,
          staker.publicKey,
      );
      assert.equal(userStakeToken1.amount, 1000000000);
  })

  it('User swap success', async () => {
      const [mint, stateAccount, movePoolAccount] = [_mint, _stateAccount, _movePoolAccount];

      const swapper = anchor.web3.Keypair.generate();
      await airdropSol(swapper, provider.connection);
      const swapperTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          user,
          mint,
          swapper.publicKey,
      );

      await program.methods.swap()
          .accounts({
              movePool: movePoolAccount,
              state: stateAccount,
              swapper: swapper.publicKey,
              swapperTokenAccount: swapperTokenAccount.address,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([swapper])
          .rpc();

      const swapperTokenAccount1 = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          user,
          mint,
          swapper.publicKey,
      );
    assert.equal(swapperTokenAccount1.amount, 10);

    const state = await program.account.state.fetch(stateAccount);
    assert.equal(state.balance, 1000000000 - 10);
  })
});
