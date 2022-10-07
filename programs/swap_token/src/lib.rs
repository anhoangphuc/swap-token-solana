use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

declare_id!("HyLqP2saUKjQkesmGau9zwRgexPRbWxVq4dDU2KDgabe");

#[program]
pub mod swap_token {
    use anchor_lang::system_program;
    use anchor_spl::token;
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.user_puller = ctx.accounts.user_puller.key();
        state.move_token = ctx.accounts.move_token.key();
        state.move_pool = ctx.accounts.move_pool.key();
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

    pub fn swap(ctx: Context<Swap>, amount: u64) -> Result<()> {
        let move_amount = amount * 10;
        //Transfer move from move_pool to swapper token account
        let (_pda, bump) = Pubkey::find_program_address(&["swap_rem".as_bytes()], ctx.program_id);
        let seeds = &[
            "swap_rem".as_bytes(),
            &[bump]
        ];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.move_pool.to_account_info(),
            to: ctx.accounts.swapper_token_account.to_account_info(),
            authority: ctx.accounts.state.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, move_amount)?;


        //Update balance of move token
        let state = &mut ctx.accounts.state;
        state.balance -= move_amount;

        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.swapper.to_account_info(),
            to: ctx.accounts.move_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        system_program::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds = ["swap_rem".as_bytes()],
        bump,
        payer = user_puller,
        space = 8 + State::LEN,
    )]
    pub state: Account<'info, State>,

    #[account(
        init,
        token::mint = move_token,
        token::authority = state,
        seeds = ["move_pool".as_bytes()],
        bump,
        payer = user_puller,
    )]
    pub move_pool: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_puller: Signer<'info>,
    #[account(mut)]
    pub move_token: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        mut,
        seeds = ["move_pool".as_bytes()],
        bump,
    )]
    pub move_pool: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = ["swap_rem".as_bytes()],
        bump,
    )]
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

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(
        mut,
        seeds = ["move_pool".as_bytes()],
        bump,
    )]
    pub move_pool: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = ["swap_rem".as_bytes()],
        bump,
    )]
    pub state: Account<'info, State>,

    #[account(mut)]
    swapper: Signer<'info>,

    #[account(mut)]
    swapper_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
    mut,
    seeds = ["move_pool".as_bytes()],
    bump,
    )]
    pub move_pool: Account<'info, TokenAccount>,

    #[account(
    mut,
    seeds = ["swap_rem".as_bytes()],
    bump,
    )]
    pub state: Account<'info, State>,

    #[account(mut)]
    puller: Signer<'info>,

    #[account(mut)]
    puller_token_account: Account<'info, TokenAccount>,

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

    //Move pool
    move_pool: Pubkey,
}

impl State {
    pub const LEN: usize = 32 + 32 + 32 + 8;
}
