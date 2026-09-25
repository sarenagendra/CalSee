import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import walletRouter from './routes/wallet';
import callRouter from './routes/calls';
import usersRouter from './routes/users';
import complaintsRouter from './routes/complaints';
import earningsRouter from './routes/earnings';
import adminRouter from './routes/admin';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    name: 'CalSee Backend',
    message: 'Platform starter aligned to the provided architecture.'
  });
});

app.get('/', (_req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CalSee</title>
        <style>
          :root {
            --bg: #0b1020;
            --bg-soft: #121a2d;
            --panel: rgba(17, 24, 39, 0.82);
            --card: rgba(27, 35, 58, 0.9);
            --primary: #8b5cf6;
            --secondary: #ec4899;
            --accent: #34d399;
            --text: #e5eefb;
            --muted: #a8b4d1;
            --line: rgba(148, 163, 184, 0.22);
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            min-height: 100vh;
            font-family: Inter, Arial, sans-serif;
            background:
              radial-gradient(circle at top left, rgba(139, 92, 246, 0.45), transparent 30%),
              radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.3), transparent 30%),
              var(--bg);
            color: var(--text);
            display: grid;
            place-items: center;
          }

          .shell { width: min(1100px, 90vw); background: rgba(15, 23, 42, 0.75); border: 1px solid var(--line); border-radius: 28px; box-shadow: 0 30px 70px rgba(15, 23, 42, 0.7); overflow: hidden; backdrop-filter: blur(14px); }
          .nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 32px; border-bottom: 1px solid var(--line); background: rgba(15, 23, 42, 0.45); }
          .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
          .brand-mark { width: 16px; height: 16px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); box-shadow: 0 0 18px rgba(236, 72, 153, 0.8); }
          .nav-links { display: flex; gap: 18px; color: var(--muted); font-size: 0.95rem; }
          .nav-links a { color: var(--muted); opacity: 0.9; text-decoration: none; transition: color 0.2s ease, opacity 0.2s ease; }
          .nav-links a:hover { color: var(--text); opacity: 1; }
          .hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 30px; padding: 48px 32px 32px; }
          .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(52, 211, 153, 0.5); background: rgba(16, 185, 129, 0.08); color: #baf7d8; font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; }
          h1 { margin: 18px 0 16px; font-size: clamp(2.5rem, 5vw, 5rem); line-height: 0.96; letter-spacing: -0.06em; }
          .highlight { background: linear-gradient(90deg, #f9a8d4, #c4b5fd, #67e8f9); -webkit-background-clip: text; background-clip: text; color: transparent; }
          .subtitle { max-width: 620px; color: var(--muted); font-size: 1.08rem; line-height: 1.7; margin-bottom: 28px; }
          .cta-row { display: flex; gap: 14px; flex-wrap: wrap; }
          .button { display: inline-block; text-decoration: none; border-radius: 14px; padding: 14px 22px; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .button:hover { transform: translateY(-1px); }
          .primary { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; box-shadow: 0 18px 35px rgba(139, 92, 246, 0.35); }
          .secondary { background: rgba(15, 23, 42, 0.75); border: 1px solid var(--line); color: var(--text); }
          .stats { margin-top: 28px; display: flex; gap: 18px; flex-wrap: wrap; }
          .stat { min-width: 130px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 16px; background: rgba(15, 23, 42, 0.45); }
          .stat strong { display: block; font-size: 1.5rem; margin-bottom: 6px; }
          .stat span { color: var(--muted); font-size: 0.82rem; }
          .panel { background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); border: 1px solid var(--line); border-radius: 24px; padding: 22px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); }
          .mini-card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 18px; margin-bottom: 14px; }
          .mini-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: var(--muted); font-size: 0.9rem; }
          .pill { display: inline-block; padding: 7px 10px; border-radius: 999px; background: rgba(52, 211, 153, 0.12); color: #9ff1d2; border: 1px solid rgba(52, 211, 153, 0.25); font-size: 0.8rem; }
          .balance { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em; margin: 12px 0 8px; }
          .chart { height: 120px; border-radius: 18px; background: linear-gradient(180deg, rgba(139, 92, 246, 0.18), rgba(236, 72, 153, 0.06)); position: relative; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.25); }
          .chart::before { content: ""; position: absolute; inset: 18px 12px 12px 12px; border-radius: 16px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(52, 211, 153, 0.1)); clip-path: polygon(0% 100%, 15% 70%, 32% 78%, 48% 45%, 62% 58%, 78% 28%, 100% 8%, 100% 100%); }
          @media (max-width: 780px) { .hero { grid-template-columns: 1fr; } .nav { flex-direction: column; gap: 18px; } .nav-links { gap: 12px; flex-wrap: wrap; justify-content: center; } }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="nav">
            <div class="brand">
              <span class="brand-mark"></span>
              <span>CalSee</span>
            </div>
            <div class="nav-links">
              <a href="#home" class="nav-link">Home</a>
              <a href="#live" class="nav-link">Live</a>
              <a href="#chat" class="nav-link">Chat</a>
              <a href="#wallet" class="nav-link">Wallet</a>
            </div>
          </div>

          <div id="home" class="hero">
            <div>
              <div class="eyebrow">Verified conversations</div>
              <h1>Meet, chat, and <span class="highlight">call with confidence.</span></h1>
              <div class="subtitle">A modern calling and chat platform built for secure conversations, instant connection, and wallet-powered live experiences.</div>
              <div class="cta-row">
                <a class="button primary" href="/login">Join Now</a>
                <a class="button secondary" href="/api/health">Explore Features</a>
              </div>
              <div class="stats">
                <div class="stat"><strong>12k+</strong><span>Active calls</span></div>
                <div class="stat"><strong>4.9/5</strong><span>User trust</span></div>
                <div class="stat"><strong>24/7</strong><span>Support</span></div>
              </div>
            </div>

            <div id="wallet" class="panel">
              <div class="mini-card">
                <div class="mini-row"><span>Wallet balance</span><span class="pill">Live</span></div>
                <div class="balance">₹ 1,240</div>
                <div class="mini-row"><span>Recharge cycle</span><span>2 days</span></div>
              </div>
              <div id="live" class="mini-card">
                <div class="mini-row"><span>Call earnings</span><span style="color: #9ff1d2; font-weight: 700;">+₹ 420</span></div>
                <div class="chart"></div>
              </div>
              <div id="chat" class="mini-card">
                <div class="mini-row"><span>Chat queue</span><span style="color: #f9a8d4; font-weight: 700;">12 new</span></div>
                <div class="mini-row"><span>Priority replies</span><span>8 min</span></div>
              </div>
            </div>
          </div>
        </div>
        <script>
          document.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', (event) => {
              const targetId = link.getAttribute('href');
              if (!targetId || !targetId.startsWith('#')) return;
              const target = document.querySelector(targetId);
              if (!target) return;
              event.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          });
        </script>
      </body>
    </html>
  `);
});

app.get('/login', (_req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CalSee Live Call</title>
        <style>
          :root {
            --bg: #090d18;
            --bg-soft: #111827;
            --card: rgba(17,24,39,0.92);
            --card-soft: rgba(15,23,42,0.8);
            --panel: rgba(22,32,52,0.96);
            --primary: #8b5cf6;
            --secondary: #ec4899;
            --danger: #fb7185;
            --success: #34d399;
            --warning: #fbbf24;
            --text: #edf4ff;
            --muted: #a7b4d1;
            --line: rgba(148,163,184,0.18);
          }
          * { box-sizing: border-box; }
          html, body { margin: 0; min-height: 100%; }
          body {
            background:
              radial-gradient(circle at top left, rgba(139,92,246,0.3), transparent 20%),
              radial-gradient(circle at bottom right, rgba(236,72,153,0.22), transparent 22%),
              var(--bg);
            color: var(--text);
            font-family: Inter, Arial, sans-serif;
          }
          .call-wrap {
            width: min(1200px, 92vw);
            margin: 28px auto;
            background: rgba(15,23,42,0.8);
            border: 1px solid var(--line);
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 0 40px 80px rgba(2,6,23,0.8);
          }
          .topbar {
            display: flex; justify-content: space-between; align-items: center;
            padding: 18px 22px; background: rgba(15,23,42,0.65); border-bottom: 1px solid var(--line);
          }
          .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
          .brand-mark { width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); }
          .topbar-actions { display: flex; align-items: center; gap: 12px; }
          .logout-btn {
            border: 1px solid rgba(251,113,133,0.35); background: rgba(251,113,133,0.08); color: #ffd5de; padding: 8px 14px; border-radius: 999px; font-weight: 700; cursor: pointer;
          }
          .dot-pill { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 999px; background: rgba(52,211,153,0.1); color: #d7fce9; border: 1px solid rgba(52,211,153,0.2); font-size: 0.76rem; }
          .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); }
          .screen {
            display: grid; grid-template-columns: 1fr 350px; min-height: 760px;
          }
          .video-side {
            position: relative;
            background:
              radial-gradient(circle at center, rgba(236,72,153,0.18), transparent 30%),
              linear-gradient(180deg, rgba(17,24,39,0.9), rgba(9,13,24,0.96));
            border-right: 1px solid var(--line);
            overflow: hidden;
          }
          .video-bg {
            position: absolute; inset: 0;
            background: linear-gradient(130deg, rgba(139,92,246,0.24), rgba(236,72,153,0.14), rgba(15,23,42,0.8));
          }
          .video-content {
            position: relative; z-index: 1; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;
          }
          .avatar-large {
            width: 180px; height: 180px; border-radius: 36px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: grid; place-items: center; font-weight: 900; font-size: 4rem; box-shadow: 0 20px 40px rgba(139,92,246,0.25);
          }
          .caller-name { font-size: clamp(2.3rem, 5vw, 4rem); letter-spacing: -0.06em; margin-top: 22px; }
          .status-line { color: var(--muted); font-size: 1rem; }
          .timer { font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 800; letter-spacing: -0.06em; margin-top: 18px; }
          .mode-switch {
            display: inline-flex; align-items: center; gap: 10px; background: rgba(15,23,42,0.5); border: 1px solid var(--line); border-radius: 999px; padding: 6px; margin-top: 16px;
          }
          .mode-btn {
            border: none; background: transparent; color: var(--muted); padding: 8px 16px; border-radius: 999px; cursor: pointer; font-weight: 700;
          }
          .mode-btn.active {
            background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; box-shadow: 0 12px 25px rgba(139,92,246,0.22);
          }
          .chat-panel {
            width: min(420px, 84%); background: rgba(15,23,42,0.82); border: 1px solid var(--line); border-radius: 18px; padding: 14px; margin: 18px auto 0; display: none;
          }
          .chat-panel.visible { display: block; }
          .chat-messages {
            max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;
          }
          .bubble {
            max-width: 80%; padding: 10px 12px; border-radius: 12px; font-size: 0.9rem; line-height: 1.4;
          }
          .bubble.incoming { background: rgba(148,163,184,0.12); color: var(--text); align-self: flex-start; }
          .bubble.outgoing { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; align-self: flex-end; }
          .chat-input-row {
            display: flex; gap: 8px;
          }
          .chat-input {
            flex: 1; border: 1px solid var(--line); border-radius: 10px; background: rgba(15,23,42,0.9); color: var(--text); padding: 10px 12px; font: inherit;
          }
          .send-btn {
            border: none; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; font-weight: 700; padding: 10px 14px; cursor: pointer;
          }
          .connect-row {
            display: flex; justify-content: center; margin-top: 18px;
          }
          .connect-btn {
            border: none; border-radius: 14px; padding: 12px 20px; font-size: 0.96rem; font-weight: 700; color: white; background: linear-gradient(135deg, var(--primary), var(--secondary)); cursor: pointer; box-shadow: 0 18px 35px rgba(139, 92, 246, 0.28);
          }
          .connect-btn:disabled { opacity: 0.7; cursor: not-allowed; }
          .controls {
            position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 14px; align-items: center;
          }
          .control-btn {
            width: 64px; height: 64px; border-radius: 50%; border: 1px solid var(--line); background: rgba(15,23,42,0.7); color: var(--text); font-size: 1.3rem; cursor: pointer;
          }
          .control-btn.primary { background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; }
          .control-btn.danger { background: linear-gradient(135deg, var(--danger), #f43f5e); border: none; }
          .side-panel {
            padding: 22px 18px; background: rgba(15,23,42,0.65);
          }
          .meter {
            background: rgba(17,24,39,0.9); border: 1px solid var(--line); border-radius: 18px; padding: 18px;
          }
          .meter-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .balance { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.05em; }
          .mini { color: var(--muted); font-size: 0.8rem; }
          .progress { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
          .progress-bar { height: 100%; width: 58%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: inherit; }
          .panel-box { margin-top: 18px; background: rgba(17,24,39,0.9); border: 1px solid var(--line); border-radius: 18px; padding: 16px; }
          .list { display: grid; gap: 10px; margin-top: 12px; }
          .list-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.12); }
          .list-item:last-child { border-bottom: none; }
          .muted { color: var(--muted); }
          .live-indicator {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 10px; border-radius: 999px; background: rgba(236,72,153,0.14); color: #fbcfe8; border: 1px solid rgba(236,72,153,0.2);
            font-size: 0.76rem;
          }
          @media (max-width: 980px) {
            .screen { grid-template-columns: 1fr; }
            .side-panel { border-top: 1px solid var(--line); }
          }
        </style>
      </head>
      <body>
        <div class="call-wrap">
          <div class="topbar">
            <div class="brand"><span class="brand-mark"></span> CalSee</div>
            <div class="topbar-actions">
              <button id="logoutBtn" class="logout-btn" type="button">Logout</button>
              <div class="dot-pill"><span class="dot"></span> Live call</div>
            </div>
          </div>

          <div class="screen">
            <div class="video-side">
              <div class="video-bg"></div>
              <div class="video-content">
                <div class="avatar-large">N</div>
                <div class="caller-name">Neha</div>
                <div class="status-line">Video call · India</div>
                <div class="timer">03:18</div>
                <div class="mode-switch" aria-label="Choose action">
                  <button class="mode-btn active" data-mode="call" type="button">Call</button>
                  <button class="mode-btn" data-mode="chat" type="button">Chat</button>
                </div>
                <div id="chatPanel" class="chat-panel">
                  <div class="chat-messages" id="chatMessages">
                    <div class="bubble incoming">Hi! I’m available to chat.</div>
                    <div class="bubble outgoing">Hello Neha, I’d like to know more about your profile.</div>
                  </div>
                  <div class="chat-input-row">
                    <input id="chatInput" class="chat-input" type="text" placeholder="Type a message..." />
                    <button id="sendMessageBtn" class="send-btn" type="button">Send</button>
                  </div>
                </div>
                <div class="connect-row">
                  <button id="connectCallBtn" class="connect-btn" type="button">Allow microphone to join</button>
                </div>
                <div id="micStatus" class="status-line" style="margin-top: 12px;">Choose Call to speak with Neha, or Chat to message her.</div>
                <div class="controls">
                  <button id="muteToggle" class="control-btn" aria-label="Mute" aria-pressed="false" title="Mute microphone">🔇</button>
                  <button class="control-btn primary" aria-label="Camera">📹</button>
                  <button id="endCallBtn" class="control-btn danger" aria-label="End call">📞</button>
                </div>
              </div>
            </div>

            <aside class="side-panel">
              <div class="meter">
                <div class="meter-row">
                  <span class="muted">Balance</span>
                  <span class="live-indicator"><span class="dot"></span> Live</span>
                </div>
                <div class="balance">₹ 243</div>
                <div class="mini">Remaining wallet</div>
                <div class="progress" style="margin-top: 14px;"><div class="progress-bar"></div></div>
              </div>

              <div class="panel-box">
                <div class="meter-row"><strong>Call details</strong><span class="muted">2.4x</span></div>
                <div class="list">
                  <div class="list-item"><span class="muted">Rate</span><strong>₹4.26/min</strong></div>
                  <div class="list-item"><span class="muted">Billed</span><strong>₹18.40</strong></div>
                  <div class="list-item"><span class="muted">Earnings</span><strong>₹10.00</strong></div>
                </div>
              </div>

              <div class="panel-box">
                <div class="meter-row"><strong>People</strong><span class="muted">3 online</span></div>
                <div class="list">
                  <div class="list-item"><span>Neha</span><span class="muted">On call</span></div>
                  <div class="list-item"><span>Priya</span><span class="muted">Available</span></div>
                  <div class="list-item"><span>Sonia</span><span class="muted">Typing</span></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <script>
          const muteToggle = document.getElementById('muteToggle');
          const endCallBtn = document.getElementById('endCallBtn');
          const connectCallBtn = document.getElementById('connectCallBtn');
          const micStatus = document.getElementById('micStatus');
          const modeButtons = document.querySelectorAll('.mode-btn');
          const logoutBtn = document.getElementById('logoutBtn');
          const chatPanel = document.getElementById('chatPanel');
          const chatInput = document.getElementById('chatInput');
          const sendMessageBtn = document.getElementById('sendMessageBtn');
          const chatMessages = document.getElementById('chatMessages');

          let activeMode = 'call';
          let micAllowed = false;

          function addChatMessage(text, type) {
            if (!chatMessages) return;
            const bubble = document.createElement('div');
            bubble.className = 'bubble ' + type;
            bubble.textContent = text;
            chatMessages.appendChild(bubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }

          if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
              if (window.callAudioStream) {
                window.callAudioStream.getTracks().forEach((track) => track.stop());
                delete window.callAudioStream;
              }
              localStorage.removeItem('calsee_session');
              sessionStorage.clear();
              window.location.href = '/login';
            });
          }

          function updateModeButtons() {
            modeButtons.forEach((button) => {
              const isActive = button.dataset.mode === activeMode;
              button.classList.toggle('active', isActive);
            });

            if (chatPanel) {
              chatPanel.classList.toggle('visible', activeMode === 'chat');
            }

            if (activeMode === 'chat') {
              connectCallBtn.textContent = 'Start chat with user';
              micStatus.textContent = 'Chat selected. You are now messaging Neha.';
            } else {
              connectCallBtn.textContent = micAllowed ? 'Microphone enabled' : 'Allow microphone to join';
              micStatus.textContent = micAllowed
                ? 'Microphone access granted. You can now speak with Neha.'
                : 'Choose Call to speak with Neha, or Chat to message her.';
            }
          }

          modeButtons.forEach((button) => {
            button.addEventListener('click', () => {
              activeMode = button.dataset.mode;
              updateModeButtons();
            });
          });

          if (muteToggle) {
            let muted = false;
            muteToggle.addEventListener('click', () => {
              muted = !muted;
              muteToggle.setAttribute('aria-pressed', String(muted));
              muteToggle.textContent = muted ? '🔊' : '🔇';
              muteToggle.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
              muteToggle.title = muted ? 'Unmute microphone' : 'Mute microphone';
            });
          }

          if (connectCallBtn && micStatus) {
            connectCallBtn.addEventListener('click', async () => {
              if (activeMode === 'chat') {
                micStatus.textContent = 'Chat started with Neha. You can send messages to her now.';
                connectCallBtn.textContent = 'Chat connected';
                connectCallBtn.disabled = true;
                return;
              }

              if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                micStatus.textContent = 'This browser does not support microphone access.';
                return;
              }

              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                window.callAudioStream = stream;
                micAllowed = true;
                connectCallBtn.textContent = 'Microphone enabled';
                connectCallBtn.disabled = true;
                micStatus.textContent = 'Microphone access granted. You can now speak with Neha.';
              } catch (error) {
                micStatus.textContent = 'Microphone access was denied. Please allow microphone permission to join the call.';
              }
            });
          }

          if (sendMessageBtn && chatInput) {
            const numberWords = [
              'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
              'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
              'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
              'hundred', 'thousand', 'million'
            ];

            function isNumberLikeMessage(value) {
              const normalized = value.trim().toLowerCase();
              if (!normalized) return true;
              const digitsOnly = normalized.replace(/[^0-9]/g, '');
              if (digitsOnly.length > 0 && normalized.replace(/\s+/g, '') === digitsOnly) {
                return true;
              }

              const words = normalized.split(/[^a-z]+/).filter(Boolean);
              if (words.length === 0) return true;

              return words.every((word) => numberWords.includes(word));
            }

            sendMessageBtn.addEventListener('click', () => {
              const value = chatInput.value.trim();
              if (!value) return;

              if (isNumberLikeMessage(value)) {
                if (micStatus) {
                  micStatus.textContent = 'Please type a real message using words, not only numbers.';
                }
                return;
              }

              addChatMessage(value, 'outgoing');
              chatInput.value = '';
              setTimeout(() => {
                addChatMessage('Thanks! I received your message.', 'incoming');
              }, 400);
            });

            chatInput.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') {
                sendMessageBtn.click();
              }
            });
          }

          if (endCallBtn) {
            endCallBtn.addEventListener('click', () => {
              if (window.callAudioStream) {
                window.callAudioStream.getTracks().forEach((track) => track.stop());
                delete window.callAudioStream;
              }

              micAllowed = false;
              if (connectCallBtn) {
                connectCallBtn.disabled = false;
                connectCallBtn.textContent = 'Allow microphone to join';
              }

              if (micStatus) {
                micStatus.textContent = 'Call ended. You can start a new call or switch to chat.';
              }
            });
          }

          updateModeButtons();
        </script>
      </body>
    </html>
  `);
});

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/wallet', walletRouter);
app.use('/calls', callRouter);
app.use('/users', usersRouter);
app.use('/complaints', complaintsRouter);
app.use('/earnings', earningsRouter);
app.use('/admin', adminRouter);

export default app;
