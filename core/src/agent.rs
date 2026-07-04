use crate::models::{CoreError, CoreRequest, CoreResponse};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum AgentRunState {
    Idle,
    Planning { plan_id: String },
    Running { run_id: String, step: usize },
    AwaitingApproval { tool: String, args: serde_json::Value },
    Failed { error: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanStep {
    pub id: String,
    pub title: String,
    pub status: StepStatus,
    pub priority: u8,
    #[serde(default)]
    pub depends_on: Vec<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum StepStatus {
    Pending,
    Running,
    Success,
    Failed,
    Skipped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Plan {
    pub id: String,
    pub title: String,
    pub steps: Vec<PlanStep>,
    pub created_at: String,
}

/// Routes incoming JSON-RPC requests to the correct handler.
/// In this scaffold the handlers emit stubs that the Electron side
/// can already render against.
pub struct Agent {
    pub state: AgentRunState,
    pub plans: HashMap<String, Plan>,
}

impl Agent {
    pub fn new() -> Self {
        Self {
            state: AgentRunState::Idle,
            plans: HashMap::new(),
        }
    }

    pub fn handle(&mut self, req: CoreRequest) -> CoreResponse {
        match req.method.as_str() {
            "ping" => CoreResponse {
                id: req.id,
                result: Some(serde_json::json!({ "pong": true })),
                error: None,
            },
            "plan.create" => self.create_plan(req),
            "plan.list" => CoreResponse {
                id: req.id,
                result: Some(serde_json::to_value(&self.plans).unwrap_or_default()),
                error: None,
            },
            "agent.run" => self.start_run(req),
            "agent.approve" => CoreResponse {
                id: req.id,
                result: Some(serde_json::json!({ "approved": true })),
                error: None,
            },
            "agent.cancel" => {
                self.state = AgentRunState::Idle;
                CoreResponse {
                    id: req.id,
                    result: Some(serde_json::json!({ "cancelled": true })),
                    error: None,
                }
            }
            other => CoreResponse {
                id: req.id,
                error: Some(CoreError {
                    code: -32601,
                    message: format!("method not found: {other}"),
                    data: None,
                }),
                result: None,
            },
        }
    }

    fn create_plan(&mut self, req: CoreRequest) -> CoreResponse {
        let title = req
            .params
            .get("title")
            .and_then(|v| v.as_str())
            .unwrap_or("Untitled plan")
            .to_string();
        let plan = Plan {
            id: Uuid::new_v4().to_string(),
            title,
            steps: vec![PlanStep {
                id: Uuid::new_v4().to_string(),
                title: "Analyze the request".into(),
                status: StepStatus::Pending,
                priority: 0,
                depends_on: vec![],
            }],
            created_at: chrono::Utc::now().to_rfc3339(),
        };
        self.plans.insert(plan.id.clone(), plan.clone());
        self.state = AgentRunState::Planning { plan_id: plan.id.clone() };
        CoreResponse {
            id: req.id,
            result: Some(serde_json::to_value(&plan).unwrap()),
            error: None,
        }
    }

    fn start_run(&mut self, req: CoreRequest) -> CoreResponse {
        let run_id = Uuid::new_v4().to_string();
        self.state = AgentRunState::Running { run_id: run_id.clone(), step: 0 };
        CoreResponse {
            id: req.id,
            result: Some(serde_json::json!({ "run_id": run_id })),
            error: None,
        }
    }
}
