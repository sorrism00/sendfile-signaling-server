const WebSocket = require('ws');
const express = require('express');

// Railway 환경에서는 PORT 환경 변수를 자동으로 주입합니다.
// 로컬 개발 시에는 8080 포트를 사용하도록 기본값을 설정합니다.
const PORT = process.env.PORT || 8080;

const app = express();

// 루트 경로에 접속했을 때 간단한 메시지를 보여줍니다 (선택 사항).
app.get('/', (req, res) => {
    res.send('Welcome to sendfile signaling server!');
});

// HTTP 서버 시작 (WebSocket 서버가 이 위에서 동작합니다)
const server = app.listen(PORT, () => {
    console.log(`시그널링 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

// WebSocket 서버를 생성하고 위에서 만든 HTTP 서버에 연결합니다.
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('새로운 클라이언트 연결됨!');

    ws.on('message', message => {
        // 메시지를 JSON 문자열로 파싱합니다.
        const parsedMessage = JSON.parse(message.toString());
        console.log('시그널링 메시지 수신:', parsedMessage.type);

        // 받은 메시지를 자기 자신을 제외한 다른 모든 연결된 클라이언트에게 다시 보냅니다.
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString()); // 원래 메시지 (JSON 문자열) 그대로 전송
            }
        });
    });

    ws.on('close', () => {
        console.log('클라이언트 연결 끊김!');
    });

    ws.on('error', error => {
        console.error('WebSocket 오류 발생:', error);
    });
});

console.log('Node.js 시그널링 서버 준비 완료.');