# SonarQube Report — qubase-spring-api

Generated 2026-09-02 from `https://sonarqube.qubase.site` (project: `qubase-spring-api`).
New Code period: **since August 5, 2026** (started 27 days ago).

## Quality Gate: FAILED — 2 conditions failing

| Condition | Value | Required | Status |
|---|---:|---:|---|
| **Coverage on New Code** | 51.7% | ≥ 80.0% | ❌ Failed |
| **New Issues** | 20 | 0 | ❌ Failed |
| Accepted Issues | 4 | — | doesn't block the gate |
| Duplications on New Code | 0.33% | ≤ 3.0% | ✅ Passed |
| Security Hotspots | 0 | — | Deprecated metric — SonarQube Community Edition doesn't scan for SQL injection/XSS at all, so this number is not meaningful either way |

For context, **overall (all-time) project coverage is 52.7%** across all 307 measured files — barely different from the 51.7% "new code" number. That means almost the entire codebase falls inside this "new code" window; there's no large, well-tested legacy baseline to lean on here. This is a coverage debt spread across nearly the whole project, not a narrow gap in a few recently-touched files.

---

## Part 1 — Coverage: 51.7% → need ≥ 80%

### The numbers
- New lines to cover: **8,026**
- New lines currently uncovered: **3,570** (→ ≈4,456 covered, ≈55.5% *pure line* coverage)
- The 51.7% figure SonarQube shows is a blended metric (line coverage + branch/condition coverage), and condition coverage is worse than line coverage on many files here (see the "Uncov. Cond." column in the table below) — branch coverage is likely dragging the blended number down more than raw uncovered lines alone.
- Rough target: getting the blended metric to ~80% likely means driving uncovered lines from 3,570 down to roughly ~1,600 or fewer, i.e. **covering roughly 2,000 more lines** — understood as an approximation, since closing branch/condition gaps on already-decently-covered files (e.g. `TemplateServiceImpl` at 80.6% lines but 93 uncovered *conditions*) moves the blended number faster per-hour than chasing raw line count on 0%-covered files alone.

### Why it's this bad: 80 of 163 files have literally 0% coverage
Of the 163 files below 100% coverage, **80 have zero tests at all — 830 uncovered lines, ~23% of the entire deficit** — and they're the cheapest fix available: any test at all on a 0% file is a jump from nothing to something. Two categories dominate:

- **20 REST controllers, 0% covered, 462 lines total.** None of them have a `@WebMvcTest`/`MockMvc` slice test. Worst offenders: `DatabaseManagementController` (107 lines), `AgentController` (67), `AuthController` (44), `CollaborationController` / `UserController` (38 each), `SqlScriptController` / `TemplateController` (26 each).
- **9 services, 0% covered:** `InvitePreviewServiceImpl` (69 lines), `AgentPresenceService` / `FileUploadServiceImpl` (31 each), `IndexServiceImpl` (22), `PresenceService` (16), `FileMetadataServiceImpl` (10), `MinioStorageServiceImpl` / `ObjectLockService` (8 each), `FileValidatorServiceImpl` (1).
- **35 trivial files** (mostly request/response records and enums) sit at exactly 1 uncovered line, 0 conditions — e.g. `AddColumnRequest`, `AgentDeviceApproveRequest`, `AiChatRequest`, `BanUserRequest`. These need almost no real testing: a single `new Foo(...)` construction (or referencing one enum constant) anywhere satisfies the line. Batch all 35 into one `RecordConstructionSmokeTest`-style class rather than 35 separate test files.

### Recommended order of attack (highest impact first)

1. **The 5 biggest partially-tested files** — `DatabaseManagementService` (283 lines / 113 cond.), `PostgresDdlGenerator` (210 / 128), `DatabaseObjectManagementService` (205 / 100), `UserServiceImpl` (133 / 33), `UserDatabaseConnectionService` (132 / 82). Together these 5 account for **963 of the 3,570 uncovered lines — ~27% of the entire deficit**. Fixing these five moves the number more than the other ~158 files combined.
   - Note on `UserDatabaseConnectionService`: a large chunk of this file's multi-dialect logic (added 2026-09-02, see AGENTS.md) already has unit-test coverage via the expanded `UserDatabaseConnectionServiceTest`, plus new `IdentifierQuoterTest`/`DbmsTypesTest`. The 132 uncovered lines shown here means plenty of the file's *older*, pre-existing methods (JDBC pooling internals, `executeSql`/`importSql` edge cases, etc.) are still untested — the new dialect work didn't regress this number, but it didn't fully close it either.
2. **The 20 zero-coverage REST controllers** (462 lines) — mechanical, repetitive: a `@WebMvcTest` per controller, service layer mocked, one happy-path + one error-path test per endpoint clears most of the number in one pass.
3. **The other 9 zero-coverage services** (261 lines).
4. **Files already close to 80%** — cheapest possible wins, a handful of edge-case tests each: `AgentManagementService` (79.0%, 41 lines / 9 cond. short), `SchemaRestoreService` (79.4%), `DbColumnServiceImpl` (80.2% lines but 14 uncovered *conditions* — needs branch coverage, not more lines).
5. **The 35 trivial 1-line DTOs/enums** — one batch smoke-test file.

### Full file list (all 163 files below 100%, sorted by uncovered lines — highest impact first)

| Uncov. Lines | Uncov. Cond. | Coverage | File |
|---:|---:|---:|---|
| 283 | 113 | 56.7% | `feature/databasemanagement/service/DatabaseManagementService.java` |
| 210 | 128 | 16.1% | `feature/databasemanagement/service/PostgresDdlGenerator.java` |
| 205 | 100 | 47.3% | `feature/databasemanagement/service/DatabaseObjectManagementService.java` |
| 133 | 33 | 14.0% | `feature/user/service/impl/UserServiceImpl.java` |
| 132 | 82 | 51.5% | `feature/databasemanagement/service/UserDatabaseConnectionService.java` |
| 110 | 66 | 38.0% | `feature/entity/service/impl/DbEntityServiceImpl.java` |
| 107 | 0 | 0.0% | `restcontroller/DatabaseManagementController.java` |
| 101 | 73 | 43.1% | `feature/entitygroup/service/impl/EntityGroupServiceImpl.java` |
| 95 | 27 | 29.1% | `feature/collaborator/service/impl/RoleRequestServiceImpl.java` |
| 91 | 48 | 6.7% | `feature/ai/service/impl/AiAssistantServiceImpl.java` |
| 88 | 42 | 36.6% | `feature/auth/service/impl/AuthServiceImpl.java` |
| 70 | 42 | 3.4% | `feature/ai/tool/ErdGenerationTool.java` |
| 69 | 26 | 0.0% | `feature/invitelink/service/impl/InvitePreviewServiceImpl.java` |
| 67 | 0 | 0.0% | `restcontroller/AgentController.java` |
| 62 | 27 | 21.9% | `feature/notification/service/impl/NotificationServiceImpl.java` |
| 62 | 28 | 42.7% | `feature/invitelink/service/impl/InviteServiceImpl.java` |
| 59 | 93 | 80.6% | `feature/template/service/impl/TemplateServiceImpl.java` |
| 54 | 17 | 20.2% | `feature/mail_service/impl/MailServiceImpl.java` |
| 54 | 3 | 20.8% | `feature/comment/service/impl/CommentServiceImpl.java` |
| 53 | 14 | 1.5% | `feature/agent/service/AgentPairingCodeService.java` |
| 49 | 8 | 9.5% | `common/cache/ReadModelCache.java` |
| 47 | 85 | 61.1% | `feature/relationship/service/RelationshipAutoConnectService.java` |
| 44 | 24 | 0.0% | `restcontroller/AuthController.java` |
| 41 | 9 | 79.0% | `feature/agent/service/AgentManagementService.java` |
| 38 | 16 | 0.0% | `restcontroller/CollaborationController.java` |
| 38 | 2 | 0.0% | `restcontroller/UserController.java` |
| 38 | 17 | 35.3% | `feature/agent/service/AgentWebSocketHandler.java` |
| 34 | 65 | 77.3% | `feature/schema/service/SchemaDiffService.java` |
| 33 | 12 | 2.2% | `common/scheduler/AutoDeleteScheduler.java` |
| 33 | 5 | 11.6% | `feature/databasemanagement/service/PasswordCipher.java` |
| 33 | 46 | 51.8% | `config/WebSocketAuthInterceptor.java` |
| 31 | 2 | 0.0% | `feature/agent/service/AgentPresenceService.java` |
| 31 | 12 | 0.0% | `feature/file/service/impl/FileUploadServiceImpl.java` |
| 29 | 10 | 2.5% | `feature/agent/service/AgentLinkTokenService.java` |
| 28 | 8 | 2.7% | `feature/schema/scheduler/SchemaRetentionScheduler.java` |
| 26 | 12 | 0.0% | `restcontroller/SqlScriptController.java` |
| 26 | 4 | 0.0% | `restcontroller/TemplateController.java` |
| 24 | 13 | 28.8% | `feature/agent/service/AgentSessionRegistry.java` |
| 24 | 9 | 70.0% | `feature/workspace/service/impl/WorkspaceServiceImpl.java` |
| 22 | 0 | 0.0% | `feature/index/service/impl/IndexServiceImpl.java` |
| 22 | 6 | 3.4% | `common/service/CurrentUserService.java` |
| 20 | 8 | 0.0% | `feature/comment/mapper/CommentMapper.java` |
| 20 | 0 | 0.0% | `restcontroller/InviteController.java` |
| 19 | 10 | 3.3% | `feature/collaboration/listener/WebSocketEventListener.java` |
| 19 | 4 | 4.2% | `feature/agent/service/AgentCommandService.java` |
| 19 | 4 | 4.2% | `feature/introspection/service/DynamicConnectionService.java` |
| 18 | 6 | 0.0% | `restcontroller/FileController.java` |
| 18 | 14 | 0.0% | `common/security/SecurityAlertListener.java` |
| 18 | 4 | 0.0% | `restcontroller/TemplateAdminController.java` |
| 18 | 4 | 4.3% | `common/scheduler/SystemMonitoringScheduler.java` |
| 18 | 0 | 5.3% | `restcontroller/ProjectController.java` |
| 16 | 4 | 0.0% | `feature/collaboration/service/PresenceService.java` |
| 16 | 8 | 4.0% | `feature/auth/service/CurrentUserProvider.java` |
| 16 | 18 | 82.1% | `feature/collaborator/service/impl/CollaboratorServiceImpl.java` |
| 15 | 2 | 0.0% | `feature/databasemanagement/repository/SchemaSnapshotStore.java` |
| 15 | 12 | 3.6% | `feature/template/repository/TemplateRepository.java` |
| 15 | 0 | 6.3% | `common/cache/PresignedUrlCache.java` |
| 15 | 1 | 33.3% | `restcontroller/FileUploadController.java` |
| 15 | 8 | 58.2% | `feature/schema/service/impl/ProjectSchemaServiceImpl.java` |
| 15 | 35 | 67.3% | `feature/notification/mapper/NotificationMapper.java` |
| 14 | 4 | 5.3% | `feature/file/scheduler/FilePurgeScheduler.java` |
| 14 | 3 | 41.4% | `feature/schema/service/SchemaVersionMaterializationService.java` |
| 13 | 8 | 0.0% | `domain/entity/Agent.java` |
| 13 | 0 | 7.1% | `feature/databasemanagement/mapper/DatabaseConnectionMapper.java` |
| 13 | 0 | 31.6% | `restcontroller/WorkspaceController.java` |
| 13 | 39 | 75.1% | `feature/script/service/impl/SqlValidationServiceImpl.java` |
| 12 | 2 | 6.7% | `feature/script/service/impl/SqlExportServiceImpl.java` |
| 11 | 6 | 0.0% | `domain/entity/DatabaseConnection.java` |
| 11 | 10 | 0.0% | `feature/script/dto/response/SqlExportFile.java` |
| 11 | 3 | 6.7% | `feature/collaboration/service/RedisSubscriber.java` |
| 11 | 15 | 79.4% | `feature/schema/service/SchemaRestoreService.java` |
| 11 | 30 | 80.9% | `feature/relationship/service/impl/RelationshipServiceImpl.java` |
| 10 | 0 | 0.0% | `restcontroller/EntityGroupController.java` |
| 10 | 0 | 0.0% | `feature/file/service/impl/FileMetadataServiceImpl.java` |
| 10 | 0 | 0.0% | `restcontroller/RoleRequestController.java` |
| 10 | 0 | 9.1% | `feature/databasemanagement/mapper/QueryConsoleTabMapper.java` |
| 10 | 2 | 14.3% | `feature/agent/service/AgentPendingRequestRegistry.java` |
| 10 | 4 | 51.7% | `feature/schema/service/SchemaSnapshotService.java` |
| 10 | 7 | 55.3% | `restcontroller/SchemaVersionController.java` |
| 10 | 2 | 55.6% | `feature/schema/service/metrics/SchemaMetricsService.java` |
| 9 | 0 | 0.0% | `restcontroller/ContactController.java` |
| 9 | 0 | 10.0% | `config/GlobalExceptionHandler.java` |
| 8 | 2 | 0.0% | `feature/file/service/impl/MinioStorageServiceImpl.java` |
| 8 | 2 | 0.0% | `feature/collaboration/service/ObjectLockService.java` |
| 8 | 0 | 0.0% | `restcontroller/SchemaTransformationController.java` |
| 7 | 0 | 0.0% | `domain/enums/AiStreamEventType.java` |
| 7 | 0 | 0.0% | `restcontroller/IndexController.java` |
| 7 | 6 | 0.0% | `domain/entity/QueryExecution.java` |
| 7 | 9 | 75.4% | `feature/schema/service/SchemaDebounceQueueService.java` |
| 6 | 0 | 25.0% | `restcontroller/CollaboratorController.java` |
| 5 | 4 | 0.0% | `domain/entity/AgentAuthorizedUser.java` |
| 5 | 0 | 0.0% | `domain/enums/AiChatMode.java` |
| 5 | 0 | 0.0% | `domain/enums/AiResponseType.java` |
| 5 | 0 | 0.0% | `restcontroller/CommentController.java` |
| 5 | 4 | 0.0% | `domain/entity/DatabaseAuditLog.java` |
| 5 | 0 | 0.0% | `restcontroller/DbEntityController.java` |
| 5 | 2 | 12.5% | `feature/agent/mapper/AgentMapper.java` |
| 5 | 0 | 37.5% | `restcontroller/NotificationController.java` |
| 5 | 2 | 89.7% | `config/SecurityConfig.java` |
| 4 | 0 | 0.0% | `feature/invitelink/dto/response/ProjectPreviewResponse.java` |
| 4 | 4 | 0.0% | `common/cache/ReadModelCacheInvalidationListener.java` |
| 4 | 13 | 85.7% | `feature/schema/service/SchemaBulkMutationService.java` |
| 4 | 5 | 94.4% | `feature/agent/service/AgentDevicePairingService.java` |
| 3 | 0 | 0.0% | `feature/entitygroup/dto/request/EntityGroupUpdateRequest.java` |
| 3 | 0 | 0.0% | `domain/entity/User.java` |
| 3 | 2 | 16.7% | `config/CollaboratorBackfillInitializer.java` |
| 3 | 0 | 40.0% | `feature/file/mapper/FileUploadMapper.java` |
| 3 | 0 | 76.9% | `feature/schema/service/SchemaVersionService.java` |
| 3 | 14 | 80.2% | `feature/column/service/impl/DbColumnServiceImpl.java` |
| 3 | 2 | 82.8% | `feature/agent/service/AgentTokenService.java` |
| 3 | 5 | 85.2% | `feature/databasemanagement/service/PostgresIdentifiers.java` |
| 3 | 6 | 86.6% | `feature/databasemanagement/service/QueryConsoleTabService.java` |
| 3 | 9 | 90.1% | `feature/databasemanagement/service/DatabaseViewManagementService.java` |
| 3 | 11 | 91.1% | `feature/databasemanagement/service/DatabaseRoutineManagementService.java` |
| 3 | 2 | 91.5% | `feature/migration/service/MigrationService.java` |
| 2 | 0 | 0.0% | `restcontroller/AiController.java` |
| 2 | 0 | 0.0% | `restcontroller/PresenceController.java` |
| 2 | 0 | 0.0% | `restcontroller/ProjectSchemaController.java` |
| 2 | 0 | 0.0% | `feature/collaboration/service/RedisPublisher.java` |
| 2 | 0 | 33.3% | `feature/template/dto/request/TemplateSnapshotDto.java` |
| 2 | 13 | 85.0% | `feature/script/service/DialectDataTypes.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/request/AddColumnRequest.java` |
| 1 | 0 | 0.0% | `feature/agent/dto/request/AgentDeviceApproveRequest.java` |
| 1 | 0 | 0.0% | `feature/agent/dto/request/AgentDeviceExchangeRequest.java` |
| 1 | 0 | 0.0% | `feature/agent/dto/request/AgentDeviceStatusRequest.java` |
| 1 | 0 | 0.0% | `feature/agent/dto/response/AgentLinkTokenResponse.java` |
| 1 | 0 | 0.0% | `feature/agent/dto/response/AgentPairingCodeResponse.java` |
| 1 | 0 | 0.0% | `feature/agent/dto/request/AgentPairRequest.java` |
| 1 | 0 | 0.0% | `feature/agent/dto/request/AgentRegisterRequest.java` |
| 1 | 0 | 0.0% | `feature/ai/dto/request/AiChatRequest.java` |
| 1 | 0 | 0.0% | `feature/ai/dto/response/AiChatResponse.java` |
| 1 | 0 | 0.0% | `feature/ai/dto/response/AiStreamEvent.java` |
| 1 | 0 | 0.0% | `feature/user/dto/request/BanUserRequest.java` |
| 1 | 0 | 0.0% | `feature/column/dto/response/ColumnWithRelationResponse.java` |
| 1 | 0 | 0.0% | `domain/entity/Comment.java` |
| 1 | 0 | 0.0% | `feature/comment/dto/request/CommentReplyCreateRequest.java` |
| 1 | 0 | 0.0% | `feature/comment/dto/response/CommentReplyResponse.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/request/CreateIndexRequest.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/request/CreateSchemaRequest.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/response/DatabaseConnectionResponse.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/request/DuplicateTableRequest.java` |
| 1 | 0 | 0.0% | `feature/entity/dto/request/EntityImportRequest.java` |
| 1 | 0 | 0.0% | `feature/ai/dto/response/ErdGenerationData.java` |
| 1 | 0 | 0.0% | `feature/file/service/impl/FileValidatorServiceImpl.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/request/GenerateDdlBatchRequest.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/response/GenerateDdlBatchResponse.java` |
| 1 | 0 | 0.0% | `feature/index/dto/request/IndexCreateRequest.java` |
| 1 | 0 | 0.0% | `feature/index/dto/response/IndexResponse.java` |
| 1 | 0 | 0.0% | `feature/notification/scheduler/NotificationCleanupScheduler.java` |
| 1 | 0 | 0.0% | `feature/collaborator/dto/request/RoleChangeRequestDto.java` |
| 1 | 0 | 0.0% | `feature/collaborator/dto/response/RoleChangeResponse.java` |
| 1 | 0 | 0.0% | `feature/project/dto/response/SharedProjectResponse.java` |
| 1 | 0 | 0.0% | `feature/workspace/dto/response/SharedWorkspaceResponse.java` |
| 1 | 0 | 0.0% | `feature/script/dto/request/SqlExportRequest.java` |
| 1 | 0 | 0.0% | `feature/databasemanagement/dto/request/SwitchDatabaseRequest.java` |
| 1 | 0 | 0.0% | `domain/enums/TargetType.java` |
| 1 | 2 | 85.0% | `config/WebSocketConfig.java` |
| 1 | 14 | 85.7% | `feature/project/service/impl/ProjectServiceImpl.java` |
| 0 | 1 | 75.0% | `feature/schema/service/SchemaBaselineBackfillService.java` |
| 0 | 1 | 92.9% | `common/auditing/AuthUtils.java` |
| 0 | 6 | 94.6% | `feature/script/service/impl/SqlGeneratorServiceImpl.java` |
| 0 | 9 | 96.0% | `feature/schema/service/impl/ModelTransformationServiceImpl.java` |
| 0 | 1 | 97.9% | `feature/schema/service/compaction/SchemaCompactionService.java` |

*(76 additional files already sit at 100% coverage and are omitted — nothing to do there.)*

---

## Part 2 — Open Issues (20 issues, ~3h estimated effort)

Source: `Open`/`Confirmed` issues in the new-code period. Grouped below by how they should actually be handled — mechanical rename, quick extraction, real simplification, a structural fix, or "accept as-is" (matches an already-documented deliberate tradeoff in this project).

### A. Mechanical, ~2 min each

| File | Line | Issue |
|---|---:|---|
| `DatabaseManagementService.java` | 1809 | `catch (IllegalArgumentException e)` — `e` never read |
| `DbmsTypes.java` | 23 | `catch (IllegalArgumentException e)` — `e` never read |

**Fix:** rename `e` → `_` (Java 22+ unnamed-variable syntax). This project already does this everywhere else per its own conventions (see AGENTS.md's SonarQube notes) — just apply the same pattern here.

### B. Quick constant extraction, ~5–10 min each

| File | Line | Issue |
|---|---:|---|
| `DatabaseObjectManagementService.java` | 313 | Hardcodes `"ALTER DATABASE "` instead of reusing the already-defined `SQL_ALTER_DATABASE` constant, in the SQL Server rename branch |
| `DatabaseViewManagementService.java` | 72 | Literal `"schema"` duplicated 6 times in this file |
| `UserDatabaseConnectionService.java` | 769, 772, 775 | Three message literals — `"Authentication failed — check the username and password."`, `"Database does not exist on this server."`, `"Could not connect to the server — check the host and port, and that it accepts connections."` — each duplicated 3× (once per dialect branch: MySQL/MariaDB, SQL Server, Postgres/Oracle/SQLite) inside `describeSqlException` |

**Fix:** extract each into a `private static final String` at class level, reuse across all occurrences. For `DatabaseViewManagementService`, note `DatabaseObjectManagementService` already has a `FIELD_SCHEMA` constant with the same value — consider whether a small shared constants holder for this package is worth it, though that's optional polish beyond just clearing the finding.

### C. Real logic simplification, ~10–15 min each

| File | Line | Issue |
|---|---:|---|
| `UserDatabaseConnectionService.java` | 771, 774 | "Remove this expression which always evaluates to true" |
| `UserDatabaseConnectionService.java` | 791 | "Replace this `if` statement with a pattern match guard" |

**Fix for 771/774:** `message` is assigned at line 759 via `e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()` — both branches of that ternary always produce a non-null `String`, so `message` can never be null afterward. The `message != null &&` guards on lines 771 and 774 are dead code — Sonar's symbolic execution caught this correctly. Delete both guards, keep just the `.toLowerCase().contains(...)` calls.

**Fix for 791:** `if (sqlState != null) { switch (sqlState) { ... } }` can drop its wrapping `if` by adding a `case null -> { }` arm directly inside the switch (Java 21+ pattern-matching switch — this project already targets Java 25).

### D. Structural fixes — same session's own new code, needs a bit more care

| File | Line | Issue |
|---|---:|---|
| `DatabaseObjectManagementService.java` | 378 | `compensateDeployDatabaseRename` has 9 parameters (limit 7) |
| `DatabaseObjectManagementService.java` | 528 | Nested ternary in `dropSchema`'s SQL-building |
| `DatabaseObjectManagementService.java` | 538 | `createTable`: Cognitive Complexity 19 (limit 15) |
| `UserDatabaseConnectionService.java` | 757 | `describeSqlException`: Cognitive Complexity 30 (limit 15) — the single largest offender in this list |

**Fix for the 9-param method:** two of the nine (`dbms`, `quoter`) are 100% derivable from the `connection` parameter that's already being passed in (`resolveDbms(connection)` / `quoterFor(connection)`, both already exist as helpers in this class) — drop both parameters and recompute them inside the method body. Brings it to 7 with zero behavior change.

**Fix for the nested ternary:** extract `cascade ? " CASCADE" : ""` into its own local variable (`cascadeClause`) declared before the outer MySQL/other-dialect ternary, instead of nesting it inline.

**Fix for `createTable`'s complexity:** extract the per-column line-building logic (the loop body that turns one `ColumnDefinition` into its SQL fragment: type, `NOT NULL`, `DEFAULT`, `UNIQUE`) into a small private helper, e.g. `buildColumnDefinitionLine(ColumnDefinition column, IdentifierQuoter quoter)`. Pulls a full level of nesting/branching out of the main method.

**Fix for `describeSqlException`'s complexity (the big one):** split the per-dialect classification into 3 small private helpers — `describeMySqlException`, `describeSqlServerException`, `describePostgresException` — each returning the specific message or `null` if unmatched, called from the existing `switch (dbms)`, falling through to the shared generic message-substring checks at the bottom when none of them match. This preserves every current message/behavior while dropping the outer method's complexity down to roughly "dispatch + fallback" — the actual per-code-branch logic no longer counts against this one method's score.

### E. Recommend "Won't Fix" (accept) — matches an already-documented, deliberate project tradeoff

| File | Line | Issue |
|---|---:|---|
| `DatabaseObjectManagementService.java` | 866 | `ConnectionOperation.run(...) throws Exception` — "generic exceptions should not be thrown" (S112) |

AGENTS.md already documents this exact tradeoff as deliberate for this class: every structural DDL operation shares one `withConnectionOperationLock(UUID, Callable<T>)` chokepoint that needs a single uniform checked-exception contract across ~15 unrelated operations (`runDdl`, `createDatabase`, etc. all already declare `throws Exception` for the same reason, and were previously reviewed/accepted). Narrowing just this one new functional interface would be inconsistent with everything it's called from, and wouldn't compile without a much larger refactor of the whole class. **Recommend marking Won't Fix in the SonarQube UI**, with a comment pointing at this file's existing `throws Exception` pattern and this report, same as the other already-accepted findings of this shape in this project.

### F. Pre-existing (not from today's session) — same fix patterns already established here

| File | Line | Issue |
|---|---:|---|
| `DatabaseViewManagementServiceTest.java` | 261, 267, 281, 294 | "Refactor the lambda to have only one invocation possibly throwing a runtime exception" |
| `WebSocketAuthInterceptor.java` | 43 | `@Nullable` incompatible with `@NullMarked` at package level, on the overridden method |

**Fix for the test lambdas:** an `assertThrows`/`assertThatThrownBy` lambda should contain exactly one call that can throw, so a failure points unambiguously at the line actually under test. AGENTS.md documents this exact fix pattern already applied ~20 times elsewhere in this project's SonarQube cleanup: hoist the second throwing call inside the lambda (often a constructor, getter, or `UUID.randomUUID()` evaluated inline) into a local variable declared just above the lambda, so the lambda's only remaining call is the one being tested.

**Fix for `WebSocketAuthInterceptor`:** needs one careful look before editing, flagged rather than prescribed outright — AGENTS.md records that `@Nullable` was *deliberately removed* from `preSend`'s return type in a previous pass (the method never actually returns null). Spring's `ChannelInterceptor.preSend` interface itself returns `@Nullable Message<?>` under Spring's own `@NullMarked` package annotation (JSpecify), so an override that *doesn't* also declare `@Nullable` is now flagging as inconsistent with the interface's contract — even though the implementation body genuinely never returns null. The likely correct fix is to add `@Nullable` back onto just the override's return type (using whichever `@Nullable` JSpecify/Spring itself uses, not `org.springframework.lang.Nullable`) purely to satisfy the interface's declared contract shape — this is an annotation-only change, not a behavior change, and doesn't undo the earlier fix's actual effect (the method still never returns null). Verify against the exact `ChannelInterceptor` signature on the classpath before applying.

---

## Suggested execution order

1. **Issues A + B** (mechanical + constant extraction, ~30 min total) — knock out 6 of the 20 issues immediately, zero risk.
2. **Issues C** (dead-code removal, ~20 min) — 3 more issues, low risk, improves correctness clarity.
3. **Issue E** — mark Won't Fix in the SonarQube UI (5 min, no code change).
4. **Issues D** (structural, ~45–60 min) — the 4 remaining "today's session" issues, including the one real complexity hotspot (`describeSqlException`, complexity 30).
5. **Issues F** (pre-existing, ~30 min) — 5 issues, using patterns this project has already applied dozens of times.
6. **Coverage** — start with the 5 highest-impact files (step 1 of the coverage plan above), then the 20 zero-coverage controllers as a repeatable `@WebMvcTest` pass, then work down the table.

Steps 1–5 clear all 20 open issues (~3h, matching SonarQube's own effort estimate) and immediately fix the "New Issues: 20/required 0" gate condition. Coverage is the larger, multi-session effort — the file list above is sorted so the highest-value work is always at the top.
