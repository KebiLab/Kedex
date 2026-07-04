mod agent;
mod models;
mod parser;

use anyhow::{Context, Result};
use models::{CoreMessage, CoreRequest, CoreResponse};
use std::io::{self, BufRead, Write};
use tracing::{error, info};

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .with_writer(io::stderr)
        .init();

    info!("kedex-core starting (JSON-RPC over stdio)");

    let stdin = io::stdin();
    let mut stdout = io::stdout();
    let mut agent = agent::Agent::new();

    for line in stdin.lock().lines() {
        let line = match line {
            Ok(l) => l,
            Err(e) => {
                error!("stdin read error: {e}");
                break;
            }
        };
        if line.trim().is_empty() {
            continue;
        }

        let msg: CoreMessage = match serde_json::from_str(&line) {
            Ok(m) => m,
            Err(e) => {
                let err = CoreResponse {
                    id: "0".into(),
                    result: None,
                    error: Some(models::CoreError {
                        code: -32700,
                        message: format!("parse error: {e}"),
                        data: None,
                    }),
                };
                write_message(&mut stdout, &CoreMessage::Response(err))?;
                continue;
            }
        };

        let response = match msg {
            CoreMessage::Request(req) => {
                let resp = agent.handle(req);
                CoreMessage::Response(resp)
            }
            other => {
                let resp = CoreResponse {
                    id: "0".into(),
                    result: None,
                    error: Some(models::CoreError {
                        code: -32600,
                        message: format!("expected request, got {other:?}"),
                        data: None,
                    }),
                };
                CoreMessage::Response(resp)
            }
        };

        write_message(&mut stdout, &response)?;
    }
    Ok(())
}

fn write_message<W: Write>(w: &mut W, msg: &CoreMessage) -> Result<()> {
    let s = serde_json::to_string(msg).context("serialize message")?;
    writeln!(w, "{s}")?;
    w.flush()?;
    Ok(())
}
