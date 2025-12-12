---
name: writing-rust
description: Provides Rust code patterns including ownership, borrowing, error handling, traits, async, and idiomatic patterns. Use PROACTIVELY when editing .rs files, writing Rust modules, or implementing Rust code.
---

# Rust Code Style

## Contents

- [Ownership & Borrowing](#ownership--borrowing)
- [Lifetimes](#lifetimes)
- [Error Handling](#error-handling)
- [Pattern Matching](#pattern-matching)
- [Types & Traits](#types--traits)
- [Iterators](#iterators)
- [Async/Await](#asyncawait)
- [Idiomatic Patterns](#idiomatic-patterns)
- [Module Organization](#module-organization)
- [Anti-patterns](#anti-patterns)
- [Lints](#lints)

## Ownership & Borrowing

### Prefer borrowing over cloning
```rust
// ❌ Bad - unnecessary clone
fn process(data: Vec<String>) {
    let copy = data.clone();
    analyze(&copy);
}

// ✅ Good - borrow instead
fn process(data: &[String]) {
    analyze(data);
}
```

### Use references for read-only access
```rust
// ✅ Good - immutable borrow
fn print_info(user: &User) {
    println!("{}", user.name);
}

// ✅ Good - mutable borrow when needed
fn update_name(user: &mut User, name: String) {
    user.name = name;
}
```

### Clone only when necessary
Valid reasons to clone:
- Data needs independent lifetime
- Crossing thread boundaries (with `Arc<T>`)
- Small, cheap-to-copy types

## Lifetimes

### Elision rules cover most cases
```rust
// ✅ Lifetimes elided - compiler infers
fn first_word(s: &str) -> &str { ... }

// ✅ Explicit when multiple references
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { ... }
```

### Common lifetime patterns
```rust
// Struct holding references
struct Parser<'a> {
    input: &'a str,
}

// Static lifetime for constants
const CONFIG: &'static str = "config";
// or simply (inferred):
const CONFIG: &str = "config";
```

## Error Handling

### Use `Result` and `?` operator
```rust
// ❌ Bad - panics on error
fn read_config() -> Config {
    let content = fs::read_to_string("config.toml").unwrap();
    toml::from_str(&content).unwrap()
}

// ✅ Good - propagate errors
fn read_config() -> Result<Config, ConfigError> {
    let content = fs::read_to_string("config.toml")?;
    let config = toml::from_str(&content)?;
    Ok(config)
}
```

### Custom errors with thiserror
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Parse error: {0}")]
    Parse(#[from] serde_json::Error),
    #[error("Invalid input: {msg}")]
    InvalidInput { msg: String },
}
```

### Avoid `unwrap()` in library code
```rust
// ❌ Bad - panics in library
pub fn parse(input: &str) -> Value {
    serde_json::from_str(input).unwrap()
}

// ✅ Good - return Result
pub fn parse(input: &str) -> Result<Value, serde_json::Error> {
    serde_json::from_str(input)
}
```

### Use `expect()` only with clear context
```rust
// ✅ Acceptable in main/tests with context
let config = Config::load().expect("Failed to load config.toml");
```

## Pattern Matching

### Exhaustive matching
```rust
// ✅ Good - all variants handled
match result {
    Ok(value) => process(value),
    Err(e) => log_error(e),
}
```

### Use `if let` for single-variant checks
```rust
// ❌ Bad - verbose for single case
match maybe_user {
    Some(user) => greet(&user),
    None => {},
}

// ✅ Good - concise
if let Some(user) = maybe_user {
    greet(&user);
}
```

### `let else` for early returns
```rust
// ✅ Good - clean early return
let Some(user) = get_user(id) else {
    return Err(NotFound);
};
```

## Types & Traits

### Use trait bounds with `where` clauses
```rust
// ❌ Bad - hard to read
fn process<T: Clone + Debug + Send + Sync>(item: T) { ... }

// ✅ Good - clear bounds
fn process<T>(item: T)
where
    T: Clone + Debug + Send + Sync,
{ ... }
```

### Implement standard traits
```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(u64);
```

### Newtype pattern for type safety
```rust
// ✅ Good - distinct types
struct Meters(f64);
struct Kilometers(f64);

impl From<Kilometers> for Meters {
    fn from(km: Kilometers) -> Self {
        Meters(km.0 * 1000.0)
    }
}
```

## Iterators

### Prefer iterators over manual loops
```rust
// ❌ Bad - manual loop
let mut sum = 0;
for i in 0..items.len() {
    sum += items[i].value;
}

// ✅ Good - iterator chain
let sum: i32 = items.iter().map(|i| i.value).sum();
```

### Use iterator adapters
```rust
// ✅ Good - filter, map, collect
let active_names: Vec<_> = users
    .iter()
    .filter(|u| u.active)
    .map(|u| &u.name)
    .collect();
```

## Async/Await

### Prefer async-native APIs
```rust
// ❌ Bad - blocking in async context
async fn read_file() -> String {
    std::fs::read_to_string("file.txt").unwrap() // blocks!
}

// ✅ Good - async I/O
async fn read_file() -> Result<String, io::Error> {
    tokio::fs::read_to_string("file.txt").await
}
```

### Use `tokio::spawn` for concurrent tasks
```rust
// ✅ Good - concurrent execution
let (a, b) = tokio::join!(
    fetch_user(id),
    fetch_orders(id),
);
```

### Avoid holding locks across `.await`
```rust
// ❌ Bad - lock held across await
let guard = mutex.lock().await;
do_something_async().await; // deadlock risk!

// ✅ Good - release lock before await
let data = {
    let guard = mutex.lock().await;
    guard.clone()
};
do_something_async().await;
```

## Idiomatic Patterns

### Builder pattern
```rust
#[derive(Default)]
pub struct RequestBuilder {
    url: String,
    method: Method,
    headers: HashMap<String, String>,
}

impl RequestBuilder {
    pub fn url(mut self, url: impl Into<String>) -> Self {
        self.url = url.into();
        self
    }

    pub fn build(self) -> Request { ... }
}
```

### From/Into conversions
```rust
impl From<&str> for MyString {
    fn from(s: &str) -> Self {
        MyString(s.to_string())
    }
}

// Usage: let s: MyString = "hello".into();
```

### Default trait
```rust
impl Default for Config {
    fn default() -> Self {
        Self {
            timeout: Duration::from_secs(30),
            retries: 3,
        }
    }
}
```

## Module Organization

### Public API at crate root
```rust
// lib.rs
pub mod models;
pub mod services;

pub use models::User;
pub use services::UserService;
```

### Use `pub(crate)` for internal visibility
```rust
pub(crate) fn internal_helper() { ... }
```

## Anti-patterns

### Don't use `Deref` for inheritance
```rust
// ❌ Bad - fake inheritance via Deref
impl Deref for Child {
    type Target = Parent;
    fn deref(&self) -> &Parent { &self.parent }
}

// ✅ Good - explicit delegation
impl Child {
    pub fn parent_method(&self) -> &str {
        self.parent.method()
    }
}
```

### Don't clone to satisfy borrow checker
```rust
// ❌ Bad - clone just to compile
let cloned = data.clone();
process(&cloned);
modify(&mut data);

// ✅ Good - restructure code
process(&data);
modify(&mut data);
```

### Don't use `unsafe` without necessity
Reserve `unsafe` for FFI, performance-critical paths with proven safety, and low-level memory operations. Always document safety invariants.

### Don't leave `todo!()` in production
```rust
// ❌ Bad - panics at runtime
fn handle_error(e: Error) {
    todo!("implement error handling")
}

// ✅ Good - proper implementation
fn handle_error(e: Error) {
    log::error!("Error: {e}");
}
```

## Lints

### Recommended clippy lints
```rust
#![deny(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::panic,
)]

#![warn(
    clippy::pedantic,
    missing_docs,
    rust_2018_idioms,
)]
```

### Run checks
```bash
cargo fmt --check      # formatting
cargo clippy -- -D warnings  # lints
cargo test             # tests
```
