# ADR 001: System Architecture - JSON-First, Dashboard-Second

## Status
Accepted

## Context

Building a ModelOps control tower requires balancing several competing concerns:

1. **Speed of development**: Need to ship a functional system quickly
2. **Data persistence**: Must store experiment, eval, and infra data reliably
3. **Query flexibility**: Need to support dashboards, agents, and scripts
4. **Operational simplicity**: Minimize moving parts and dependencies
5. **Future scalability**: Design shouldn't preclude scaling to production use

### Options Considered

#### Option A: Full-Stack with Database
- **Tech**: PostgreSQL + REST API + Next.js frontend
- **Pros**: Production-grade, SQL queries, ACID guarantees, familiar patterns
- **Cons**: High complexity, slow initial dev, overkill for demo/prototype

#### Option B: JSON Files + Next.js
- **Tech**: JSON files as data store, Next.js for dashboards, Python scripts for agents
- **Pros**: Zero infrastructure, fast development, git-friendly, easy inspection
- **Cons**: No query engine, manual data management, doesn't scale to large datasets

#### Option C: Serverless (Supabase/Firebase)
- **Tech**: Managed backend + Next.js frontend
- **Pros**: Low ops overhead, real-time updates, authentication built-in
- **Cons**: Vendor lock-in, network dependency, harder to inspect data

## Decision

**Choose Option B: JSON Files + Next.js**

Rationale:

### 1. Optimize for Demonstrability

This is a **portfolio project** first, production system second. Key audiences:
- **Recruiters**: Want to see thinking, not just technology
- **TPMs**: Want to understand operational patterns
- **Engineers**: Want to read the code, not configure cloud accounts

JSON files maximize transparency:
```bash
$ cat experiments/run_registry.json
# Immediately see all experiments
$ cat evals/benchmarks.json
# Immediately see all eval results
```

### 2. Git as the Database

JSON files are:
- **Version-controlled**: Every data change is auditable
- **Diff-friendly**: See exactly what changed between commits
- **Branchable**: Experiment with data changes in feature branches
- **Mergeable**: Collaborate on data schemas

This mirrors how frontier AI teams actually work:
> "We keep experiment configs in git, why not experiment results?"

### 3. Reduce Cognitive Load

Developers debugging this codebase shouldn't need:
- Database migrations
- Connection string management
- ORM query syntax
- Schema evolution strategies

They should `cat` a JSON file and understand the data model instantly.

### 4. Enable Multi-Tool Access

With JSON files, agents and scripts access data identically:
```python
# agents/stall-detector.py
with open('experiments/run_registry.json') as f:
    experiments = json.load(f)

# scripts/promote-model.py
with open('evals/regression_tracker.json') as f:
    tracker = json.load(f)
```

No shared database connection pool. No transaction management. Just read files.

### 5. Future-Proof

When scale demands a real database:
1. JSON files become the **seed data**
2. Migration scripts parse JSON → INSERT INTO database
3. API layer added between data and dashboards/agents
4. JSON schemas inform database schema design

The investment isn't wasted — it's the prototype.

## Consequences

### Positive

- ✅ **Fast development**: Shipped MVP in < 2 days
- ✅ **Zero ops**: No database to host, backup, or monitor
- ✅ **Inspectable**: Recruiters can read raw data in GitHub
- ✅ **Portable**: Clone repo, npm install, it runs
- ✅ **Pedagogical**: Clear data models teach operational patterns

### Negative

- ❌ **No concurrent writes**: Multiple agents can't safely update same file
- ❌ **No query engine**: Can't do SQL-style joins or aggregations
- ❌ **Manual consistency**: No foreign key constraints or validation
- ❌ **Scale ceiling**: Won't handle 10,000 experiments
- ❌ **No real-time updates**: Dashboard doesn't auto-refresh when data changes

### Mitigations

**Concurrent writes**:
- Current scope (demo) doesn't need them
- Future: Add file locking or migrate to database

**Query engine**:
- Agents do simple filtering in Python
- Future: Add SQLite as query layer over JSON (JSON → import → query)

**Manual consistency**:
- Use TypeScript interfaces to enforce types in frontend
- Document data contracts in schema files
- Future: JSON Schema validation

**Scale ceiling**:
- Acceptable for demo with < 100 experiments
- Pagination if needed for larger datasets
- Future: Database migration when scale demands

**Real-time updates**:
- Dashboard shows point-in-time snapshot (acceptable for ops console)
- Future: Add polling or WebSocket updates

## Alternatives Rejected

### PostgreSQL + Prisma ORM

**Why not?**
- Requires running Postgres locally or in cloud
- Adds migration management complexity
- Obscures data from casual inspection
- Overhead not justified for demo scale

**When to reconsider?**
- If building production-grade system
- If need for concurrent writes emerges
- If scale > 1000 experiments

### Cloud NoSQL (DynamoDB, Firestore)

**Why not?**
- Vendor lock-in
- Network dependency (can't run offline)
- Cost (even on free tier, requires cloud account)
- Black box (can't easily inspect data)

**When to reconsider?**
- If building multi-user system
- If need global distribution
- If serverless deployment required

## References

- [Git as Database](https://kenneth.io/post/git-as-a-database)
- [JSON as Database for Prototyping](https://www.datascienceportfol.io/json-database)
- [Boring Technology](https://mcfunley.com/choose-boring-technology)

## Revision History

- **2026-01-20**: Initial decision (ADR-001)
