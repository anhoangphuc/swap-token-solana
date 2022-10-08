import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import fs from "fs";
import path from "path";
import bs58 from "bs58";
import {createThawAccountInstruction, getAccount, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
import {Program, Wallet} from "@project-serum/anchor";

export async function getConnection(network: string): Promise<Connection> {
    const commitment = 'confirmed';
    let connection: Connection;
    if (['devnet', 'testnet', 'mainnet-beta'].indexOf(network) >= 0) {
        connection = new Connection(clusterApiUrl(network as any), commitment)
    } else if (network === 'local') {
        connection = new Connection('http://127.0.0.1:8899', commitment);
    } else {
        throw Error(`Network config errored ${network}`);
    }
    return connection;
}

export async function airdropSol(payer: Keypair, connection: Connection) {
    const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL,
    );

    const latestBLockhash = await  connection.getLatestBlockhash();

    await  connection.confirmTransaction({
        blockhash: latestBLockhash.blockhash,
        lastValidBlockHeight: latestBLockhash.lastValidBlockHeight,
        signature: airdropSignature,
    });
    const balanceAccount = await connection.getBalance(payer.publicKey);
}

export async function mintNewTokenForAccount(
    payer: Keypair,
    mint: PublicKey,
    receiverPubkey: PublicKey,
    connection: Connection,
    amount?: number,
) {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        receiverPubkey,
    );
    await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer,  //payer is mint authority too for our cases
        amount ? amount: 1000000000,
    );
    return tokenAccount;
}

export function getContracts() {
    let json;
    try {
        json = fs.readFileSync(path.join(__dirname, 'data/contract_addresses.json'), 'utf-8') || '{}';
    } catch {
        json = '{}';
    }
    return JSON.parse(json);
}

export async function saveContract(network: string, contract: string, address: string) {
    const addresses = getContracts();
    addresses[network] = addresses[network] || {};
    addresses[network][contract] = address;
    fs.writeFileSync(path.join(__dirname, 'data/contract_addresses.json'),
        JSON.stringify(addresses, null, "    "));
}

export function getAccounts(index?: number) {
    let json;
    try {
        json = fs.readFileSync(path.join(__dirname, 'data/accounts.json'), 'utf-8') || '{}';
    } catch {
        json = '{}';
    }
    const accounts = JSON.parse(json) ;
    if (index === undefined || index === null) {
        return accounts;
    } else {
        return accounts[`account${index}`];
    }
}

export async function getKeypair(index: number): Promise<Keypair> {
    const account = await getAccounts(index);
    const keypair = Keypair.fromSecretKey(bs58.decode(account['secretKey']));
    return keypair;
}

export async function saveAccount(keypair: Keypair, index: number) {
    const accounts = getAccounts();
    const accountIndex = `account${index}`;
    accounts[accountIndex] = {};
    accounts[accountIndex]['secretKey'] = bs58.encode(keypair.secretKey);
    accounts[accountIndex]['pubKey'] = keypair.publicKey.toBase58();
    fs.writeFileSync(path.join(__dirname, 'data/accounts.json'),
        JSON.stringify(accounts, null, "    "));
}

export function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function loadSwapProgram(network: string) {
    const idl = JSON.parse(
        fs.readFileSync(path.join(__dirname, "./target/idl/swap_token.json"), "utf-8")
    )
    const programId = getContracts()[network]["SWAP"];
    const program = new anchor.Program(idl, programId);
    return program;
}

export function loadMoveToken(network: string) {
    return new PublicKey(getContracts()[network]["MOVE"]);
}

export function loadDefaultUser() {
    const id = JSON.parse(fs.readFileSync(path.join(process.env.ANCHOR_WALLET), "utf-8")) as number[];
    const seed = id.slice(0, 32);
    const keypair = Keypair.fromSeed(Uint8Array.from(seed));
    console.log(keypair.publicKey.toBase58());
}