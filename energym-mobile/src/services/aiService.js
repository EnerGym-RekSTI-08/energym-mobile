
const AI_EDGE_URL = 'http://192.168.1.68:8000';  // HTTP
const AI_WS_URL   = 'ws://192.168.1.68:8000';    // WebSocket

const TIMEOUT_MS = 5000;

/**
 * Mulai sesi AI di edge PC.
 * @param {Object} params
 * @param {string} params.userId       - Supabase auth user ID
 * @param {string} params.stationId    - ID alat gym (dari QR scan)
 * @param {string} params.exerciseId   - UUID exercise dari Supabase
 * @param {string} params.exerciseName - Nama latihan
 * @param {string} [params.workoutId]  - UUID workout (opsional)
 * @returns {Promise<string>}          - session_id
 */
export async function startAISession({ userId, stationId, exerciseId, exerciseName, workoutId }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${AI_EDGE_URL}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        station_id: stationId,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        workout_id: workoutId,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI server error: ${response.status}`);
    }

    const data = await response.json();
    return data.session_id;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI edge PC tidak merespons. Pastikan laptop gym menyala dan di WiFi yang sama.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Stop sesi AI.
 * @param {string} sessionId
 */
export async function stopAISession(sessionId) {
  try {
    await fetch(`${AI_EDGE_URL}/session/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch (err) {
    console.warn('[aiService] Stop session gagal (mungkin sudah selesai):', err.message);
  }
}

/**
 * Connect WebSocket ke sesi AI.
 * @param {string} sessionId
 * @param {Object} callbacks
 * @param {Function} callbacks.onFrameUpdate  - dipanggil tiap frame AI (rep count, form)
 * @param {Function} callbacks.onSessionEnded - dipanggil saat sesi selesai (summary)
 * @param {Function} callbacks.onError        - dipanggil saat koneksi error
 * @returns {WebSocket} instance untuk bisa ditutup manual
 */
export function connectAIWebSocket(sessionId, { onFrameUpdate, onSessionEnded, onError }) {
  const ws = new WebSocket(`${AI_WS_URL}/ws/${sessionId}`);

  ws.onopen = () => {
    console.log('[aiService] WebSocket connected:', sessionId);
    // Keep-alive ping setiap 5 detik
    ws._pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 5000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'frame_update') {
        onFrameUpdate?.({
          repCount:   data.rep_count,
          state:      data.state,
          elbowAngle: data.elbow_angle,
          isBadForm:  data.is_bad_form,
          formIssues: data.form_issues,
        });
      } else if (data.type === 'session_ended') {
        onSessionEnded?.({
          validReps:  data.valid_reps,
          badReps:    data.bad_reps,
          accuracy:   data.accuracy,
          duration:   data.duration_seconds,
        });
      }
    } catch (e) {
      // Abaikan pesan non-JSON (misal pong)
    }
  };

  ws.onerror = (err) => {
    console.error('[aiService] WebSocket error:', err);
    onError?.(err);
  };

  ws.onclose = () => {
    clearInterval(ws._pingInterval);
    console.log('[aiService] WebSocket closed:', sessionId);
  };

  return ws;
}

/**
 * Cek apakah edge PC menyala dan bisa dihubungi.
 * @returns {Promise<boolean>}
 */
export async function checkAIHealth(ip, port = DEFAULT_PORT) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`http://${ip}:${port}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
