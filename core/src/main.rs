mod agent;
mod commands;
mod llm;
mod models;
mod parser;
mod secrets;

use anyhow::{Context, Result};
use models::{CoreEvent, CoreMessage, CoreRequest, CoreResponse};
use serde_json::json;
use std::io::{self, BufRead, Write};
use tracing::error;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .with_writer(io::stderr)
        .init();

    let stdin = io::stdin();
    let stdout = io::stdout();
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
                write_message(&mut stdout.lock(), &CoreMessage::Response(err))?;
                continue;
            }
        };

        let CoreMessage::Request(req) = msg else {
            continue;
        };

        let response = handle(req, &mut agent, &stdout);
        write_message(&mut stdout.lock(), &response)?;
    }
    Ok(())
}

fn handle(req: CoreRequest, agent: &mut agent::Agent, stdout: &io::Stdout) -> CoreMessage {
    let id = req.id.clone();
    let method = req.method.clone();
    match method.as_str() {
        "ping" => CoreMessage::Response(CoreResponse {
            id,
            result: Some(json!({ "pong": true })),
            error: None,
        }),
        "secrets.set" => match secrets::set(&req.params) {
            Ok(()) => CoreMessage::Response(CoreResponse {
                id,
                result: Some(json!({ "ok": true })),
                error: None,
            }),
            Err(e) => err_resp(&id, e),
        },
        "secrets.get" => match secrets::get(&req.params) {
            Ok(v) => CoreMessage::Response(CoreResponse {
                id,
                result: Some(json!({ "value": v })),
                error: None,
            }),
            Err(e) => err_resp(&id, e),
        },
        "secrets.has" => match secrets::has(&req.params) {
            Ok(v) => CoreMessage::Response(CoreResponse {
                id,
                result: Some(json!({ "has": v })),
                error: None,
            }),
            Err(e) => err_resp(&id, e),
        },
        "secrets.delete" => match secrets::delete(&req.params) {
            Ok(()) => CoreMessage::Response(CoreResponse {
                id,
                result: Some(json!({ "ok": true })),
                error: None,
            }),
            Err(e) => err_resp(&id, e),
        },
        "agent.run" => {
            let run_id = req
                .params
                .get("run_id")
                .and_then(|v| v.as_str())
                .unwrap_or(&id)
                .to_string();
            let prompt = req
                .params
                .get("prompt")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let provider = req
                .params
                .get("provider")
                .and_then(|v| v.as_str())
                .unwrap_or("openai")
                .to_string();
            let model = req
                .params
                .get("model")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let api_key = req
                .params
                .get("api_key")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let base_url = req
                .params
                .get("base_url")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let temperature = req
                .params
                .get("temperature")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.7) as f32;
            let mode = req
                .params
                .get("mode")
                .and_then(|v| v.as_str())
                .unwrap_or("plan")
                .to_string();

            let run_id_clone = run_id.clone();
            let prompt_clone = prompt.clone();
            let stdout_handle = stdout.try_clone().expect("stdout clone");
            tokio::spawn(async move {
                let on_delta = |delta: String| {
                    let event = CoreMessage::Event(CoreEvent::StreamChunk {
                        run_id: run_id_clone.clone(),
                        delta,
                    });
                    let _ = write_message(&mut stdout_handle.lock(), &event);
                };
                let result = llm::stream_completion(
                    llm::CompletionRequest {
                        run_id: run_id_clone.clone(),
                        provider,
                        model,
                        api_key,
                        base_url,
                        prompt: prompt_clone,
                        temperature,
                        mode,
                    },
                    on_delta,
                )
                .await;
                let final_event = match result {
                    Ok(()) => CoreEvent::Log {
                        level: "info".to_string(),
                        message: format!("run {run_id_clone} done"),
                    },
                    Err(e) => CoreEvent::Log {
                        level: "error".to_string(),
                        message: format!("run {run_id_clone} failed: {e}"),
                    },
                };
                let _ = write_message(
                    &mut stdout_handle.lock(),
                    &CoreMessage::Event(final_event),
                );
            });

            CoreMessage::Response(CoreResponse {
                id,
                result: Some(json!({ "run_id": run_id, "started": true })),
                error: None,
            })
        }
        "commands.run" => {
            let command = req
                .params
                .get("command")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let cwd = req
                .params
                .get("cwd")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            tokio::task::block_in_place(|| {
                let rt = tokio::runtime::Handle::current();
                rt.block_on(async {
                    match commands::run(&command, cwd.as_deref()).await {
                        Ok(r) => CoreMessage::Response(CoreResponse {
                            id,
                            result: Some(serde_json::to_value(&r).unwrap_or(json!({}))),
                            error: None,
                        }),
                        Err(e) => err_resp(&id, e),
                    }
                })
            })
        }
        "commands.whisper" => {
            let audio_b64 = req
                .params
                .get("audio_base64")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let mime = req
                .params
                .get("mime")
                .and_then(|v| v.as_str())
                .unwrap_or("audio/webm")
                .to_string();
            let provider = req
                .params
                .get("provider")
                .and_then(|v| v.as_str())
                .unwrap_or("openai")
                .to_string();
            let api_key = req
                .params
                .get("api_key")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let base_url = req
                .params
                .get("base_url")
                .and_then(|v| v.as_str())
                .unwrap_or("https://api.openai.com/v1")
                .to_string();
            tokio::task::block_in_place(|| {
                let rt = tokio::runtime::Handle::current();
                rt.block_on(async {
                    match commands::whisper(
                        &audio_b64,
                        &mime,
                        &provider,
                        api_key.as_deref(),
                        &base_url,
                    )
                    .await
                    {
                        Ok(text) => CoreMessage::Response(CoreResponse {
                            id,
                            result: Some(json!({ "text": text })),
                            error: None,
                        }),
                        Err(e) => err_resp(&id, e),
                    }
                })
            })
        }
        _ => {
            let resp = agent.handle(req);
            CoreMessage::Response(resp)
        }
    }
}

fn err_resp(id: &str, e: anyhow::Error) -> CoreMessage {
    CoreMessage::Response(CoreResponse {
        id: id.to_string(),
        result: None,
        error: Some(models::CoreError {
            code: -500,
            message: e.to_string(),
            data: None,
        }),
    })
}

fn write_message<W: Write>(w: &mut W, msg: &CoreMessage) -> Result<()> {
    let s = serde_json::to_string(msg).context("serialize message")?;
    writeln!(w, "{s}")?;
    w.flush()?;
    Ok(())
}
