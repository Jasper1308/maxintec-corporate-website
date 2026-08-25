# RLS integration suite status

Status: **prepared but not executable in this repository yet**.

The repository currently has no versioned Supabase migrations, seed, `supabase/config.toml`, Supabase CLI, or local Docker runtime. Creating executable database assertions without those sources would risk testing a schema different from production.

The deterministic actor matrix, expected assertions, RPC cases, Storage cases, prerequisites, and implementation sequence are documented in [`docs/security-testing.md`](../../docs/security-testing.md).

Do not point future RLS tests at production. They must run against a disposable local database or a dedicated test project reset from versioned migrations.
