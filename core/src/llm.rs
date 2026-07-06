use anyhow::{anyhow, Result};
use base64::Engine;
use futures::StreamExt;
use reqwest::Client;
use serde_json::{json, Value};
use std::time::Duration;

pub struct CompletionRequest {
    pub run_id: String,
    pub provider: String,
    pub model: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub prompt: String,
    pub temperature: f32,
    pub mode: String,
}

fn system_prompt(mode: &str) -> &'static str {
    match mode {
        "plan" => "You are a senior software engineer. Before making any changes, produce a step-by-step plan. Do not write code yet — only the plan.",
        "goal" => "You are a senior software engineer. Execute the user's request end-to-end, explaining decisions briefly as you go.",
        "ask" => "You are a senior software engineer. Answer the question concisely. Do not edit any files.",
        "build" => "You are a senior software engineer. Make focused, well-tested code changes. Explain key trade-offs.",
        _ => "You are a senior software engineer.",
    }
}

pub async fn stream_completion<F>(req: CompletionRequest, mut on_delta: F) -> Result<()>
where
    F: FnMut(String) + Send + 'static,
{
    let api_key = req
        .api_key
        .clone()
        .ok_or_else(|| anyhow!("Missing API key for provider {}", req.provider))?;
    let model = if req.model.is_empty() {
        default_model(&req.provider)
    } else {
        req.model.clone()
    };
    let base_url = req
        .base_url
        .clone()
        .unwrap_or_else(|| default_base_url(&req.provider));

    let client = Client::builder()
        .timeout(Duration::from_secs(120))
        .build()?;

    match req.provider.as_str() {
        "anthropic" => stream_anthropic(&client, &api_key, &base_url, &model, &req, &mut on_delta).await,
        "ollama" => stream_ollama(&client, &base_url, &model, &req, &mut on_delta).await,
        _ => stream_openai_compat(&client, &api_key, &base_url, &model, &req, &mut on_delta).await,
    }
}

fn default_model(provider: &str) -> String {
    match provider {
        "openai" => "gpt-4o-mini".to_string(),
        "anthropic" => "claude-3-5-sonnet-latest".to_string(),
        "gemini" => "gemini-1.5-pro".to_string(),
        "deepseek" => "deepseek-chat".to_string(),
        "mistral" => "mistral-large-latest".to_string(),
        "ollama" => "llama3.1".to_string(),
        _ => "gpt-4o-mini".to_string(),
    }
}

fn default_base_url(provider: &str) -> String {
    match provider {
        "openai" => "https://api.openai.com/v1".to_string(),
        "anthropic" => "https://api.anthropic.com".to_string(),
        "gemini" => "https://generativelanguage.googleapis.com/v1beta".to_string(),
        "deepseek" => "https://api.deepseek.com/v1".to_string(),
        "mistral" => "https://api.mistral.ai/v1".to_string(),
        "ollama" => "http://localhost:11434/v1".to_string(),
        _ => "https://api.openai.com/v1".to_string(),
    }
}

async fn stream_openai_compat<F>(
    client: &Client,
    api_key: &str,
    base_url: &str,
    model: &str,
    req: &CompletionRequest,
    on_delta: &mut F,
) -> Result<()>
where
    F: FnMut(String) + Send,
{
    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    let body = json!({
        "model": model,
        "stream": true,
        "temperature": req.temperature,
        "messages": [
            { "role": "system", "content": system_prompt(&req.mode) },
            { "role": "user", "content": req.prompt }
        ]
    });

    let resp = client
        .post(&url)
        .bearer_auth(api_key)
        .json(&body)
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(anyhow!("Provider error {}: {}", status, text));
    }

    let mut stream = resp.bytes_stream();
    let mut buffer = String::new();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        buffer.push_str(std::str::from_utf8(&chunk).unwrap_or(""));
        while let Some(idx) = buffer.find('\n') {
            let line: String = buffer.drain(..=idx).collect();
            let line = line.trim();
            if line.is_empty() || !line.starts_with("data:") {
                continue;
            }
            let payload = line[5..].trim();
            if payload == "[DONE]" {
                return Ok(());
            }
            if let Ok(v) = serde_json::from_str::<Value>(payload) {
                if let Some(delta) = v
                    .get("choices")
                    .and_then(|c| c.get(0))
                    .and_then(|c| c.get("delta"))
                    .and_then(|d| d.get("content"))
                    .and_then(|c| c.as_str())
                {
                    on_delta(delta.to_string());
                }
            }
        }
    }
    Ok(())
}

async fn stream_anthropic<F>(
    client: &Client,
    api_key: &str,
    base_url: &str,
    model: &str,
    req: &CompletionRequest,
    on_delta: &mut F,
) -> Result<()>
where
    F: FnMut(String) + Send,
{
    let url = format!("{}/v1/messages", base_url.trim_end_matches('/'));
    let body = json!({
        "model": model,
        "max_tokens": 4096,
        "temperature": req.temperature,
        "stream": true,
        "system": system_prompt(&req.mode),
        "messages": [
            { "role": "user", "content": req.prompt }
        ]
    });
    let resp = client
        .post(&url)
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .json(&body)
        .send()
        .await?;
    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(anyhow!("Anthropic error {}: {}", status, text));
    }
    let mut stream = resp.bytes_stream();
    let mut buffer = String::new();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        buffer.push_str(std::str::from_utf8(&chunk).unwrap_or(""));
        while let Some(idx) = buffer.find('\n') {
            let line: String = buffer.drain(..=idx).collect();
            let line = line.trim();
            if line.is_empty() || !line.starts_with("data:") {
                continue;
            }
            let payload = line[5..].trim();
            if payload == "[DONE]" {
                return Ok(());
            }
            if let Ok(v) = serde_json::from_str::<Value>(payload) {
                let event_type = v.get("type").and_then(|t| t.as_str()).unwrap_or("");
                if event_type == "content_block_delta" {
                    if let Some(delta) = v
                        .get("delta")
                        .and_then(|d| d.get("text"))
                        .and_then(|t| t.as_str())
                    {
                        on_delta(delta.to_string());
                    }
                }
            }
        }
    }
    Ok(())
}

async fn stream_ollama<F>(
    client: &Client,
    base_url: &str,
    model: &str,
    req: &CompletionRequest,
    on_delta: &mut F,
) -> Result<()>
where
    F: FnMut(String) + Send,
{
    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    let body = json!({
        "model": model,
        "stream": true,
        "messages": [
            { "role": "system", "content": system_prompt(&req.mode) },
            { "role": "user", "content": req.prompt }
        ]
    });
    let resp = client.post(&url).json(&body).send().await?;
    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(anyhow!("Ollama error {}: {}", status, text));
    }
    let mut stream = resp.bytes_stream();
    let mut buffer = String::new();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        buffer.push_str(std::str::from_utf8(&chunk).unwrap_or(""));
        while let Some(idx) = buffer.find('\n') {
            let line: String = buffer.drain(..=idx).collect();
            let line = line.trim();
            if line.is_empty() {
                continue;
            }
            if let Ok(v) = serde_json::from_str::<Value>(line) {
                if let Some(delta) = v
                    .get("message")
                    .and_then(|m| m.get("content"))
                    .and_then(|c| c.as_str())
                {
                    on_delta(delta.to_string());
                }
                if v.get("done").and_then(|d| d.as_bool()).unwrap_or(false) {
                    return Ok(());
                }
            }
        }
    }
    Ok(())
}

pub async fn whisper(
    audio_base64: &str,
    mime: &str,
    api_key: Option<&str>,
    base_url: &str,
) -> Result<String> {
    let api_key = api_key.ok_or_else(|| anyhow!("Missing API key for Whisper"))?;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(audio_base64)
        .map_err(|e| anyhow!("base64 decode: {}", e))?;
    let url = format!("{}/audio/transcriptions", base_url.trim_end_matches('/'));
    let part = reqwest::multipart::Part::bytes(bytes)
        .file_name(format!("audio.{}", mime.split('/').nth(1).unwrap_or("webm")))
        .mime_str(mime)
        .map_err(|e| anyhow!("mime: {}", e))?;
    let form = reqwest::multipart::Form::new()
        .text("model", "whisper-1")
        .part("file", part);
    let client = Client::new();
    let resp = client
        .post(&url)
        .bearer_auth(api_key)
        .multipart(form)
        .send()
        .await?;
    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(anyhow!("Whisper error {}: {}", status, text));
    }
    let v: Value = resp.json().await?;
    Ok(v.get("text").and_then(|t| t.as_str()).unwrap_or("").to_string())
}
