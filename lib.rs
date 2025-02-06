use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

// Define the program's entry point
entrypoint!(process_instruction);

// Main program logic
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize the instruction data
    let instruction = FundPoolInstruction::try_from_slice(instruction_data)?;

    // Match the instruction type
    match instruction {
        FundPoolInstruction::Deposit { amount } => deposit_funds(program_id, accounts, amount),
        FundPoolInstruction::Withdraw => withdraw_profits(program_id, accounts),
    }
}

// Define the program's instructions
#[derive(BorshSerialize, BorshDeserialize)]
pub enum FundPoolInstruction {
    Deposit { amount: u64 },
    Withdraw,
}

// Define the pool state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct FundPool {
    pub admin: Pubkey,           // Admin wallet address
    pub total_funds: u64,        // Total funds in the pool
    pub user_shares: Vec<(Pubkey, u64)>, // User addresses and their shares
}

// Deposit funds into the pool
pub fn deposit_funds(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let fund_pool_account = next_account_info(account_info_iter)?;
    let user_account = next_account_info(account_info_iter)?;

    // Ensure the program owns the fund pool account
    if fund_pool_account.owner != program_id {
        msg!("Invalid fund pool account");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize the fund pool state
    let mut fund_pool = FundPool::try_from_slice(&fund_pool_account.data.borrow())?;

    // Update the pool state
    fund_pool.total_funds += amount;
    fund_pool.user_shares.push((*user_account.key, amount));

    // Serialize and save the updated state
    fund_pool.serialize(&mut &mut fund_pool_account.data.borrow_mut()[..])?;

    msg!("Deposited {} lamports into the pool", amount);
    Ok(())
}

// Withdraw profits from the pool
pub fn withdraw_profits(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let fund_pool_account = next_account_info(account_info_iter)?;
    let admin_account = next_account_info(account_info_iter)?;

    // Ensure the program owns the fund pool account
    if fund_pool_account.owner != program_id {
        msg!("Invalid fund pool account");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize the fund pool state
    let fund_pool = FundPool::try_from_slice(&fund_pool_account.data.borrow())?;

    // Ensure the caller is the admin
    if *admin_account.key != fund_pool.admin {
        msg!("Invalid admin account");
        return Err(ProgramError::InvalidAccountData);
    }

    // Transfer funds to the admin
    **admin_account.try_borrow_mut_lamports()? += fund_pool.total_funds;
    **fund_pool_account.try_borrow_mut_lamports()? -= fund_pool.total_funds;

    msg!("Withdrawn {} lamports from the pool", fund_pool.total_funds);
    Ok(())
}
