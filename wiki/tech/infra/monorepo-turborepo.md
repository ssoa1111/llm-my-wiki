# 모노레포 — Turborepo 기초

> 여러 앱/패키지를 하나의 저장소에서 관리하는 모노레포 구조. pnpm workspace + tsconfig 경로 별칭으로 패키지 간 참조를 설정한다.

## 핵심 내용

### 모노레포 구조

```
루트/
├── apps/
│   ├── web/          ← Next.js 앱
│   └── admin/        ← 어드민 앱
├── packages/
│   ├── ui/           ← 공유 컴포넌트
│   └── utils/        ← 공유 유틸리티
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

### 핵심 설정 파일

**`pnpm-workspace.yaml`** — pnpm이 모노레포를 관리할 때 사용하는 설정

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**`packages/ui/package.json`** — 다른 프로젝트에서 이 패키지를 참조할 수 있게 이름을 지정

```json
{
  "name": "@my-monorepo/ui",
  "version": "0.0.1",
  "main": "src/index.ts"
}
```

---

### TypeScript 경로 별칭 설정

**방법 1: 루트 tsconfig에서 모든 경로 정의 (권장)**

```json
// 루트 tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@my-monorepo/*": ["packages/*/src/index.ts"]
    }
  },
  "include": ["apps/**/*", "packages/**/*"]
}
```

```json
// apps/web/tsconfig.json — 루트 상속
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {}
}
```

**방법 2: 각 앱에서 경로 지정**

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "../..",
    "paths": {
      "@my-monorepo/ui":    ["packages/ui/src/index.ts"],
      "@my-monorepo/utils": ["packages/utils/index.ts"]
    }
  }
}
```

**일반 앱 (모노레포 아닌 경우)** `@`를 src로 매핑:

```json
{ "compilerOptions": { "baseUrl": "src", "paths": { "@/*": ["*"] } } }
```

---

### 사용 방법

패키지 설정 후 앱에서 바로 import:

```typescript
// apps/web/src/page.tsx
import { Button } from '@my-monorepo/ui'
import { formatDate } from '@my-monorepo/utils'
```

---

### 주요 이점

- **코드 공유**: UI 컴포넌트, 유틸리티 함수를 여러 앱에서 재사용
- **단일 의존성 관리**: 루트에서 모든 패키지의 의존성 동기화 (Syncpack 사용)
- **원자적 변경**: 여러 앱에 걸친 변경사항을 한 번의 커밋으로 처리
- **Turborepo 캐싱**: 변경되지 않은 패키지는 빌드 캐시 재사용

---

### 의존성 버전 관리 — workspace vs catalog

모노레포에서 의존성 버전 불일치 문제가 발생할 수 있다.

**`workspace:*`** — 모노레포 내부 패키지 참조 (호이스팅)

```json
// apps/web/package.json
{
  "dependencies": {
    "@my-monorepo/ui": "workspace:*"   // packages/ui 를 직접 참조
  }
}
```

**`catalog:` (pnpm 8+)** — 외부 패키지 버전 중앙 관리

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

catalog:
  react: "18.3.1"
  lodash: "4.17.21"
  typescript: "5.7.3"
```

```json
// 각 package.json
{
  "dependencies": {
    "react": "catalog:",    // pnpm-workspace.yaml에서 버전 참조
    "lodash": "catalog:"
  }
}
```

| 방식 | 용도 | 특징 |
|------|------|------|
| `workspace:*` | 모노레포 내부 패키지 | 소스코드 직접 참조, 빌드 없이 사용 |
| `catalog:` | 외부 npm 패키지 | 중앙 버전 관리, 모든 앱이 동일 버전 사용 |

> 독립 배포하는 앱이 여러 개면 `catalog:` 권장. Syncpack이나 `pnpm dedupe`도 대안.

---

### Tailwind CSS — content 경로 설정

공유 UI 패키지 스타일이 앱에서 적용되지 않는 경우:

```typescript
// packages/ui/tailwind.config.ts
// ❌ src/ 없을 때
content: ['../../packages/ui/**/*.{js,ts,jsx,tsx}']

// ✅ src/ 폴더 사용 시 (src/ 추가 필수!)
content: ['../../packages/ui/src/**/*.{js,ts,jsx,tsx}']
```

## 관련 페이지

- [TypeScript](../typescript.md) — tsconfig 경로 별칭, 제네릭, 유틸리티 타입
- [Docker](./docker.md) — 모노레포 빌드 및 컨테이너화
- [프론트엔드 실전 에러 패턴](../frontend/frontend-error-patterns.md) — TurboRepo 관련 에러 상세

## 출처

- MonoRepo 기초 준비 — 2026-04-14
- tuborepo 사용 시 app간의 모듈 버전 불일치 — 2026-04-14
- TurboRepo에서 package에서 가져온 컴포넌트 스타일이 적용되지 않음 — 2026-04-14
