## 2025-05-22 - Performance Boost: Code Splitting & Memoization
**Learning:** Large monolithic React applications benefit significantly from code splitting (lazy loading) and strategic memoization (React.memo, useMemo). Adding database indexes is a crucial but often overlooked backend performance win.
**Action:** Always check App.tsx for bulk imports that can be lazy loaded and identify expensive render paths for memoization.
