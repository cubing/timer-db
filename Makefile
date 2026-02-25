.PHONY: build
build: build-js build-types

.PHONY: build-js
build-js:
	bun run -- script/build.ts build-types

.PHONY: build-types
build-types:
	bun x -- bun-dx --package @typescript/native-preview tsgo -- --project ./tsconfig.types.jsonc

.PHONY: check
check: lint test build check-package.json

.PHONY: test
test:
	bun test

.PHONY: setup
setup:
	bun install --frozen-lockfile	

.PHONY: dev
dev: setup
	bun run -- ./script/dev.ts

.PHONY: lint
lint: lint-biome lint-typescript

.PHONY: lint-biome
lint-biome:
	bun x -- bun-dx --package @biomejs/biome biome -- check

.PHONY: lint-typescript
lint-typescript:
	bun x -- bun-dx --package @typescript/native-preview tsgo -- --project ./tsconfig.json

.PHONY: format
format:
	bun x -- bun-dx --package @biomejs/biome biome -- check --write

.PHONY: check-package.json
check-package.json: build
	bun x -- bun-dx --package @cubing/dev-config package.json -- check

.PHONY: prepublishOnly
prepublishOnly: clean check build

RM_RF = bun -e 'process.argv.slice(1).map(p => process.getBuiltinModule("node:fs").rmSync(p, {recursive: true, force: true, maxRetries: 5}))' --

.PHONY: clean
clean:
	${RM_RF} ./dist/

.PHONY: reset
reset: clean
	${RM_RF} ./node_modules/
