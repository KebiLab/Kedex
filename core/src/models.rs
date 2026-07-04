use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum CoreMessage {
    Request(CoreRequest),
    Response(CoreResponse),
    Event(CoreEvent),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreRequest {
    pub id: String,
    pub method: String,
    #[serde(default)]
    pub params: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreResponse {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<CoreError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "event", rename_all = "snake_case")]
pub enum CoreEvent {
    StreamChunk { run_id: String, delta: String },
    PlanUpdated { plan: serde_json::Value },
    ToolStarted { tool: String, args: serde_json::Value },
    ToolFinished { tool: String, ok: bool, output: serde_json::Value },
    Log { level: String, message: String },
}

pub fn new_request_id() -> String {
    Uuid::new_v4().to_string()
}
