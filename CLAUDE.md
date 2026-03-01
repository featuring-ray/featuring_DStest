# featuring-co-campaign

## 핵심 규칙

### 스타일링
- **CSS-in-JS, styled-components, Tailwind 절대 사용 금지**
- 스타일은 **일반 CSS** 만 사용
- 디자인 토큰(색상, 타이포, 스페이싱)은 `featuring.css`에서 CSS 변수로 이미 제공됨

### CSS 글로벌 import (이미 `src/index.css` 최상단에 적용됨)
```css
@import '@featuring-corp/design-tokens/style/reset.css';
@import '@featuring-corp/design-tokens/style/normalize.css';
@import '@featuring-corp/design-tokens/style/featuring.css';
```

---

## 레이아웃 컴포넌트 (반드시 이걸로 레이아웃 잡기)

```tsx
import { Box, Flex, VStack, HStack, Center } from '@featuring-corp/components'
```

| 컴포넌트 | 용도 |
|----------|------|
| `Box` | 기본 컨테이너 (div 래퍼) |
| `Flex` | flexbox 레이아웃 |
| `VStack` | 세로 방향 스택 (gap 포함) |
| `HStack` | 가로 방향 스택 (gap 포함) |
| `Center` | 가운데 정렬 |

---

## 타이포그래피

```tsx
import { Typo } from '@featuring-corp/components'
```

레이아웃 잡을 때 `<div>`, `<p>`, `<span>` 대신 `Typo` 컴포넌트 사용

---

## 아이콘

```tsx
import { 아이콘명 } from '@featuring-corp/icons'
```

---

## 패키지 버전
- 모든 `@featuring-corp/*` 패키지는 **canary** 버전 사용
