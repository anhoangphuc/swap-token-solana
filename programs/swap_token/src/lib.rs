use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("HyLqP2saUKjQkesmGau9zwRgexPRbWxVq4dDU2KDgabe");

#[program]
pub mod swap_token {
    use anchor_spl::token;
    use super::*;

    const SWAP_PDA_SEED: &[u8] = b"swap_rem";

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.user_puller = ctx.accounts.user_puller.key().clone();
        state.move_token = ctx.accounts.move_token.key().clone();

        let move_pool = &mut ctx.accounts.move_pool;
        move_pool.balance = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init,
        seeds = ["swap_rem".as_bytes()],
        bump,
        payer = user_puller,
        space = 8 + State::LEN
    )]
    pub state: Account<'info, State>,

    #[account(
        init,
        seeds = ["move_pool".as_bytes()],
        bump,
        payer = user_puller,
        space = 8 + MovePool::LEN
    )]
    pub move_pool: Account<'info, MovePool>,

    #[account(mut)]
    pub user_puller: Signer<'info>,
    #[account(mut)]
    pub move_token: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct State {
    //User who can pull sol
    user_puller: Pubkey,

    //The token address user will trade sol for
    move_token: Pubkey,
}

impl State {
    pub const LEN: usize = 32 + 32;
}

#[account]
#[derive(Default)]
pub struct MovePool {
    //Balance of move user staked
    balance: u64,
}

impl MovePool {
    pub const LEN: usize = 8;
}
