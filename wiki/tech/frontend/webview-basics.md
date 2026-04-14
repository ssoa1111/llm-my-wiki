# 웹뷰 기본 지식

> 모바일 앱 내에서 웹 콘텐츠를 표시하는 WebView의 개념, 특성, 그리고 웹 개발자가 알아야 할 핵심 사항.

## 핵심 내용

### WebView란
WebView는 네이티브 모바일 앱 내에서 웹 페이지를 렌더링하는 컴포넌트다. 앱 내 브라우저처럼 동작하며, 네이티브 코드와 웹 코드 간 브릿지(bridge) 통신이 가능하다.

- **iOS**: `WKWebView` (WebKit 기반)
- **Android**: `WebView` (Chromium 기반)
- **React Native**: `react-native-webview`

### 일반 브라우저 vs WebView 차이

| 항목 | 일반 브라우저 | WebView |
|------|------------|---------|
| 주소창 | 있음 | 없음 (앱이 제어) |
| 뒤로가기 | 브라우저 버튼 | 네이티브 앱이 제어 |
| 쿠키/스토리지 | 브라우저 공유 | 앱별 격리 |
| 파일 업로드 | 기본 지원 | 앱 권한 필요 |
| 카메라/마이크 | 브라우저 권한 | 앱 레벨 권한 |
| User-Agent | 브라우저 UA | 커스텀 UA 포함 |

### 웹 → 네이티브 통신 (JavaScript Bridge)

**iOS (WKWebView)**
```js
// 웹 → 네이티브 메시지 전송
window.webkit.messageHandlers.myHandler.postMessage({ action: 'openCamera' })
```

**Android**
```js
// 웹 → 네이티브 (Android 측에서 JavascriptInterface 등록 후)
window.AndroidBridge.callNativeMethod('openCamera')
```

**React Native WebView**
```js
// 웹에서
window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CAMERA_REQUEST' }))

// React Native에서
<WebView
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data)
    handleBridgeMessage(data)
  }}
/>
```

### 네이티브 → 웹 통신

```js
// React Native에서 웹으로
webviewRef.current.injectJavaScript(`
  window.dispatchEvent(new CustomEvent('nativeMessage', {
    detail: { type: 'USER_LOCATION', lat: 37.5, lng: 127.0 }
  }))
`)

// 웹에서 수신
window.addEventListener('nativeMessage', (e) => {
  const { type, ...data } = e.detail
  handleNativeMessage(type, data)
})
```

### WebView 환경 감지

```js
// WebView 환경인지 감지
function isWebView(): boolean {
  const ua = navigator.userAgent
  // React Native WebView
  if (ua.includes('wv') || window.ReactNativeWebView) return true
  // iOS WebView (no Safari 표시)
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua)) return true
  // Android WebView
  if (/Android/.test(ua) && /wv/.test(ua)) return true
  return false
}
```

### 주의사항 및 이슈

#### Viewport 및 레이아웃
- iOS Safe Area 고려 (`env(safe-area-inset-top)`)
- 소프트 키보드 등장 시 viewport 리사이징 이슈
- `100vh` 문제: iOS에서 주소창 포함/미포함 불일치 → `100dvh` 사용 권장

```css
.full-height {
  height: 100dvh; /* dynamic viewport height */
}
```

#### 스크롤 이슈
- iOS WebView의 바운스 스크롤 (`overscroll-behavior: none`)
- `-webkit-overflow-scrolling: touch` (레거시)

#### 쿠키 및 인증
- iOS의 ITP(Intelligent Tracking Prevention)로 서드파티 쿠키 차단
- localStorage는 웹뷰 재설치 시 초기화될 수 있음
- 토큰은 네이티브 레이어에서 관리하고 웹으로 전달하는 방식 권장

#### 성능
- WebView는 네이티브 앱보다 렌더링 성능 낮음
- Heavy 애니메이션, 3D 변환 자제
- `will-change`, `transform: translateZ(0)` GPU 레이어 촉진

### Next.js와 WebView
- Next.js SSR/SSG 페이지는 WebView에서도 정상 동작
- `window`, `document` 접근 시 `typeof window !== 'undefined'` 가드 필요
- WebView Bridge 코드는 `useEffect` 내에서 초기화 (SSR에서 실행 안 되도록)

```tsx
useEffect(() => {
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    // WebView 전용 초기화
  }
}, [])
```

## 관련 페이지

- [이벤트 루프와 비동기](../../concepts/event-loop.md) — JavaScript 비동기 처리
- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — WebView에서의 렌더링 전략

## 출처

- 웹뷰 기본지식 — 2026-04-10
