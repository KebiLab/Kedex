use anyhow::Result;
use std::path::Path;

/// Lightweight file walker + symbol stub.
/// Real implementation will plug in tree-sitter grammars per language
/// and write results to SQLite via sqlx.
pub struct CodeIndex {
    pub files: Vec<IndexedFile>,
}

#[derive(Debug, Clone)]
pub struct IndexedFile {
    pub path: String,
    pub language: String,
    pub symbols: Vec<String>,
}

impl CodeIndex {
    pub fn new() -> Self {
        Self { files: Vec::new() }
    }

    pub fn index_directory(&mut self, root: &Path) -> Result<()> {
        for entry in walk_files(root)? {
            if let Some(file) = classify(&entry) {
                self.files.push(file);
            }
        }
        Ok(())
    }
}

fn walk_files(root: &Path) -> Result<Vec<std::path::PathBuf>> {
    let mut out = Vec::new();
    fn visit(p: &Path, out: &mut Vec<std::path::PathBuf>) -> Result<()> {
        if p.is_dir() {
            for e in std::fs::read_dir(p)? {
                let e = e?;
                let path = e.path();
                if path.is_dir() {
                    visit(&path, out)?;
                } else if path.is_file() {
                    out.push(path);
                }
            }
        }
        Ok(())
    }
    visit(root, &mut out)?;
    Ok(out)
}

fn classify(path: &Path) -> Option<IndexedFile> {
    let ext = path.extension()?.to_string_lossy().to_lowercase();
    let language = match ext.as_str() {
        "ts" | "tsx" => "typescript",
        "js" | "jsx" => "javascript",
        "rs" => "rust",
        "py" => "python",
        "go" => "go",
        "json" => "json",
        "md" => "markdown",
        _ => return None,
    };
    Some(IndexedFile {
        path: path.to_string_lossy().to_string(),
        language: language.into(),
        symbols: Vec::new(),
    })
}
