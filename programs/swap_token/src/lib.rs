use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

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
        state.balance = 0;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_stake_token.to_account_info(),
            to: ctx.accounts.move_pool.to_account_info(),
            authority: ctx.accounts.user_stake.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        let state = &mut ctx.accounts.state;
        state.balance += amount;
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

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub move_pool: Account<'info, TokenAccount>,

    #[account(mut)]
    pub state: Account<'info, State>,

    #[account(mut)]
    pub user_stake_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_stake: Signer<'info>,

    #[account(mut)]
    pub move_token: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct State {
    //User who can pull sol
    user_puller: Pubkey,

    //The token address user will trade sol for
    move_token: Pubkey,

    //Balance of move_token;
    balance: u64,
}

impl State {
    pub const LEN: usize = 32 + 32 + 8;
}

#[account]
#[derive(Default)]
pub struct MovePool {
}

impl MovePool {
    pub const LEN: usize = 0;
}
