# Failed listMigrations at 2019-09-24T13:42:13.505Z
## RPC One-Liner
```json
{"id":1,"jsonrpc":"2.0","method":"listMigrations","params":{"projectInfo":"","sourceConfig":"generator photon {\n  provider = \"photonjs\"\n}\n\ngenerator nexus_prisma {\n  provider = \"nexus-prisma\"\n}\n\ndatasource db {\n  provider = \"sqlite\"\n  url      = \"file:dev.db\"\n}\n\nmodel UserDetails {\n  id        String  @default(cuid()) @id @unique\n  user      User\n  firstName String?\n  lastName  String?\n}\n\nmodel User {\n  id        String      @default(cuid()) @id @unique\n  username  String      @unique\n  details   UserDetails\n  inventory Item[]\n  money     Int\n}\n\nmodel Item {\n  id              String     @default(cuid()) @id @unique\n  saberPart       SaberParts\n  partName        String\n  partDescription String?\n  price           Float?\n}\n\nenum SaberParts {\n  CRYSTAL\n  POWER_CORE\n  CRYSTAL_VIBRATOR\n  HILT\n}"}}
```

## RPC Input Readable
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "listMigrations",
  "params": {
    "projectInfo": "",
    "sourceConfig": "generator photon {\n  provider = \"photonjs\"\n}\n\ngenerator nexus_prisma {\n  provider = \"nexus-prisma\"\n}\n\ndatasource db {\n  provider = \"sqlite\"\n  url      = \"file:dev.db\"\n}\n\nmodel UserDetails {\n  id        String  @default(cuid()) @id @unique\n  user      User\n  firstName String?\n  lastName  String?\n}\n\nmodel User {\n  id        String      @default(cuid()) @id @unique\n  username  String      @unique\n  details   UserDetails\n  inventory Item[]\n  money     Int\n}\n\nmodel Item {\n  id              String     @default(cuid()) @id @unique\n  saberPart       SaberParts\n  partName        String\n  partDescription String?\n  price           Float?\n}\n\nenum SaberParts {\n  CRYSTAL\n  POWER_CORE\n  CRYSTAL_VIBRATOR\n  HILT\n}"
  }
}
```

## Stack Trace
```bash
[31m[1mError in migration engine: [22m[39mthread 'tokio-runtime-worker-0' panicked at 'Deserializing the database migration failed.: Error("missing field `table`", line: 0, column: 0)', src/libcore/result.rs:999:5
stack backtrace:
   0: backtrace::backtrace::libunwind::trace
             at /cargo/registry/src/github.com-1ecc6299db9ec823/backtrace-0.3.29/src/backtrace/libunwind.rs:88
   1: backtrace::backtrace::trace_unsynchronized
             at /cargo/registry/src/github.com-1ecc6299db9ec823/backtrace-0.3.29/src/backtrace/mod.rs:66
   2: std::sys_common::backtrace::_print
             at src/libstd/sys_common/backtrace.rs:47
   3: std::sys_common::backtrace::print
             at src/libstd/sys_common/backtrace.rs:36
   4: std::panicking::default_hook::{{closure}}
             at src/libstd/panicking.rs:200
   5: std::panicking::default_hook
             at src/libstd/panicking.rs:214
   6: migration_engine::main::{{closure}}
   7: std::panicking::rust_panic_with_hook
             at src/libstd/panicking.rs:481
   8: std::panicking::continue_panic_fmt
             at src/libstd/panicking.rs:384
   9: rust_begin_unwind
             at src/libstd/panicking.rs:311
  10: core::panicking::panic_fmt
             at src/libcore/panicking.rs:85
  11: core::result::unwrap_failed
  12: <sql_migration_connector::SqlMigrationConnector as migration_connector::MigrationConnector>::deserialize_database_migration
  13: <migration_engine::commands::list_migrations::ListMigrationStepsCommand as migration_engine::commands::command::MigrationCommand>::execute
  14: <migration_engine::api::MigrationApi<C,D> as migration_engine::api::GenericApi>::list_migrations
  15: migration_engine::api::rpc::RpcApi::create_sync_handler
  16: tokio_executor::enter::exit
  17: tokio_threadpool::blocking::blocking
  18: <futures::future::lazy::Lazy<F,R> as futures::future::Future>::poll
  19: futures::future::chain::Chain<A,B,C>::poll
  20: <futures::future::then::Then<A,B,F> as futures::future::Future>::poll
  21: <futures::future::lazy::Lazy<F,R> as futures::future::Future>::poll
  22: futures::future::chain::Chain<A,B,C>::poll
  23: <futures::future::then::Then<A,B,F> as futures::future::Future>::poll
  24: <futures::future::map::Map<A,F> as futures::future::Future>::poll
  25: <futures::future::either::Either<A,B> as futures::future::Future>::poll
  26: <futures::future::map::Map<A,F> as futures::future::Future>::poll
  27: <futures::future::map_err::MapErr<A,F> as futures::future::Future>::poll
  28: <futures::stream::and_then::AndThen<S,F,U> as futures::stream::Stream>::poll
  29: <futures::stream::forward::Forward<T,U> as futures::future::Future>::poll
  30: <futures::future::map::Map<A,F> as futures::future::Future>::poll
  31: <futures::future::map_err::MapErr<A,F> as futures::future::Future>::poll
  32: futures::task_impl::std::set
  33: std::panicking::try::do_call
  34: __rust_maybe_catch_panic
             at src/libpanic_unwind/lib.rs:82
  35: tokio_threadpool::task::Task::run
  36: tokio_threadpool::worker::Worker::run_task
  37: tokio_threadpool::worker::Worker::run
  38: std::thread::local::LocalKey<T>::with
  39: std::thread::local::LocalKey<T>::with
  40: tokio_reactor::with_default
  41: tokio::runtime::threadpool::builder::Builder::build::{{closure}}
  42: std::thread::local::LocalKey<T>::with
  43: std::thread::local::LocalKey<T>::with
note: Some details are omitted, run with `RUST_BACKTRACE=full` for a verbose backtrace.
```
