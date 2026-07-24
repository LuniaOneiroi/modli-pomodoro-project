# ModLi

ModLi is a local-first Pomodoro timer and lightweight project companion built
with Svelte 5, TypeScript, Vite, and Tauri 2.

## Development

Install dependencies:

```sh
pnpm install
```

Run the browser prototype:

```sh
pnpm dev
```

Run ModLi in its native desktop window:

```sh
pnpm desktop:dev
```

Build the production web bundle and macOS application:

```sh
pnpm build
pnpm desktop:build
```

The macOS `.app` and `.dmg` are written beneath
`src-tauri/target/release/bundle/`. Distribution to other Macs requires Apple
code signing and notarization; local development builds do not.
