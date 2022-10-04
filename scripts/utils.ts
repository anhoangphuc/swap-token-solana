import { clusterApiUrl, Connection } from "@solana/web3.js";
import fs from "fs";
import * as path from "path";

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

export function getContracts() {
    let json;
    try {
        json = fs.readFileSync(path.join(__dirname, '../contract_addresses.json'), 'utf-8') || '{}';
    } catch {
        json = '{}';
    }
    return JSON.parse(json);
}

export async function saveContract(network: string, contract: string, address: string) {
    const addresses = getContracts();
    addresses[network] = addresses[network] || {};
    addresses[network][contract] = address;
    fs.writeFileSync(path.join(__dirname, '../contract_addresses.json'),
        JSON.stringify(addresses, null, "    "));
}
