// server.js
import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// __dirname 대체 (ES 모듈 환경에서 필요)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// ✅ .obj 파일 Content-Type 지정 (Three.js에서 필요)
app.use((req, res, next) => {
  if (req.url.endsWith('.obj')) {
    res.setHeader('Content-Type', 'model/obj');
  }
  next();
});

// ✅ 정적 파일 서빙 (index.html, style.css, js, models 등)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 기본 라우팅 — http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Express 서버 실행 중: http://localhost:${PORT}`);
});
