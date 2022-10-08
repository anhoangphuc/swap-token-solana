# src/lib.rs
Swap program, for users swap 1 SOL for 10 MOVE token, includes all features listed below:
1. Initialize: A user initialize contract, provide necessary information
- puller_address: Address of puller (can also be called owner)
- move_pool: PDA token account for owning MOVE for contract
2. Stake: Anyone can stake MOVE token, MOVE will be manage by program
3. Swap: Anyone can swap 1 SOL for 10 MOVE if contract has enough MOVE:
- MOVE from contract will be transferred to token account provided by user
- SOL from user will be transferred to owner of contract
4. Withdraw: Puller of contract, withdraw unused MOVE

# Build and deploy
Build:
```anchor build```
Deploy:
```anchor deploy```

# scripts/swap_scripts
Contain scripts to interact with swap program

To run a script:

```ts-node scripts/swap_scripts/{X}```, with X is the name of script, example:
```ts-node scripts/swap-scripts/1_initialize_swap.ts```

We have 5 scripts to interact with swap program:

`1_initialize_swap`: Initialize program

`2_mint_move_token_for_puller`: Mint MOVE token for user

`3_stake_move_token`: Stake move token to contract

`4_swap_sol_for_move`: Swap SOL for MOVE

`5_withdraw_move_to_owner`: Owner withdraw unused MOVE, or when owner don't want to trade anymore
# scripts/move_scripts
Contain scripts to generate accounts and generate new MOVE token.

To run a script:

``ts-node scripts/move_scripts/{X}``, with X is the name of script, example:
``ts-node scripts/move_scripts/0_generate_5_accounts``

We set network in file .env

We have 4 scrips to run:

`0_generate_5_accounts.ts`: Create new 5 accounts, save account info (pubkey and privatekey) to data/accounts.json, these 5 accounts will be used in later scripts

`1_airdrop_5_accounts.ts`: Airdrop 1 SOl for each account

`2_generate_move_token`: Create new token, with admin is account0, token address will be saved in data/contract_addreses.json

`3_mint_MOVE_token_for_accounts`: Mint 1 MOVE token for each account