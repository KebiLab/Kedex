use anyhow::{anyhow, Result};
use keyring::Entry;
use serde_json::Value;

const SERVICE: &str = "dev.kebilab.kedex";

fn entry_for(provider: &str) -> Result<Entry> {
    Entry::new(SERVICE, provider).map_err(|e| anyhow!("keyring: {}", e))
}

pub fn set(params: &Value) -> Result<()> {
    let provider = params
        .get("provider_id")
        .or_else(|| params.get("provider"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("missing provider_id"))?;
    let value = params
        .get("value")
        .or_else(|| params.get("api_key"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("missing value"))?;
    entry_for(provider)?
        .set_password(value)
        .map_err(|e| anyhow!("keyring set: {}", e))
}

pub fn get(params: &Value) -> Result<Option<String>> {
    let provider = params
        .get("provider_id")
        .or_else(|| params.get("provider"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("missing provider_id"))?;
    match entry_for(provider)?.get_password() {
        Ok(v) => Ok(Some(v)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(anyhow!("keyring get: {}", e)),
    }
}

pub fn has(params: &Value) -> Result<bool> {
    let provider = params
        .get("provider_id")
        .or_else(|| params.get("provider"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("missing provider_id"))?;
    match entry_for(provider)?.get_password() {
        Ok(_) => Ok(true),
        Err(keyring::Error::NoEntry) => Ok(false),
        Err(e) => Err(anyhow!("keyring has: {}", e)),
    }
}

pub fn delete(params: &Value) -> Result<()> {
    let provider = params
        .get("provider_id")
        .or_else(|| params.get("provider"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("missing provider_id"))?;
    match entry_for(provider)?.delete_credential() {
        Ok(_) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(anyhow!("keyring delete: {}", e)),
    }
}
