use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tokio::io::AsyncWriteExt;
use tokio::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandResult {
    pub code: i32,
    pub stdout: String,
    pub stderr: String,
    pub command: String,
    pub cwd: String,
}

pub async fn run(command: &str, cwd: Option<&str>) -> Result<CommandResult> {
    let cwd = cwd.unwrap_or(".");
    let mut cmd = build_command(command);
    cmd.current_dir(cwd);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());
    let output = cmd.output().await?;
    Ok(CommandResult {
        code: output.status.code().unwrap_or(-1),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        command: command.to_string(),
        cwd: cwd.to_string(),
    })
}

#[cfg(target_os = "windows")]
fn build_command(command: &str) -> Command {
    let mut c = Command::new("cmd");
    c.args(["/C", command]);
    c
}

#[cfg(not(target_os = "windows"))]
fn build_command(command: &str) -> Command {
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string());
    let mut c = Command::new(shell);
    c.arg("-c").arg(command);
    c
}

pub async fn whisper(
    audio_base64: &str,
    mime: &str,
    provider: &str,
    api_key: Option<&str>,
    base_url: &str,
) -> Result<String> {
    if provider != "openai" {
        return Err(anyhow::anyhow!("Only openai whisper is supported in core for now"));
    }
    crate::llm::whisper(audio_base64, mime, api_key, base_url).await
}
