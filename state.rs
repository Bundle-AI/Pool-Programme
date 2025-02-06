use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct FundPool {
    pub admin: Pubkey,           // Admin wallet address
    pub total_funds: u64,        // Total funds in the pool
    pub user_shares: Vec<(Pubkey, u64)>, // User addresses and their shares
}
