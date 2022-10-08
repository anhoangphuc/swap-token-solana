# scripts folder
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