import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChronosVibeOptions,
  PERSONA_MATRIX,
  PersonaId,
  TastingNote,
  TerroirGeologicalProfile,
  WineBottle,
} from '../data/pfalzDomain';

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'spirit' | 'system';
  text: string;
  timestamp: string;
  personaId?: PersonaId;
  toolUsed?: string;
}

export interface GroundedArtifact {
  id: string;
  toolName: string;
  timestamp: string;
  terroirs?: TerroirGeologicalProfile[];
  wines?: WineBottle[];
  recordedNote?: {
    wineName: string;
    rating: number;
    sensorySummary: string;
  };
}

interface UseGeminiLiveSommelierProps {
  personaId: PersonaId;
  cellarBottles: WineBottle[];
  activeBottle: WineBottle | null;
  promptOptions: ChronosVibeOptions;
  onAutoRecordNote?: (note: Omit<TastingNote, 'id'>) => void;
}

function float32ToPcm16Base64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

export function useGeminiLiveSommelier({
  personaId,
  cellarBottles,
  activeBottle,
  promptOptions,
  onAutoRecordNote,
}: UseGeminiLiveSommelierProps) {
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    {
      id: 'welcome-1',
      speaker: 'spirit',
      text: PERSONA_MATRIX[personaId].greetingDe,
      timestamp: new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      personaId,
    },
  ]);
  const [groundedArtifacts, setGroundedArtifacts] = useState<GroundedArtifact[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const isMicMutedRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  const stopAllPlayback = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // ignore already stopped source
      }
    }
    activeSourcesRef.current.clear();
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setOutputLevel(0);
  }, []);

  const ensureOutputAudioContext = useCallback(() => {
    if (!outputAudioCtxRef.current || outputAudioCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (outputAudioCtxRef.current.state === 'suspended') {
      outputAudioCtxRef.current.resume();
    }
    return outputAudioCtxRef.current;
  }, []);

  const playPcm24kChunk = useCallback(
    (base64Audio: string) => {
      try {
        const ctx = ensureOutputAudioContext();
        const float32Data = base64Pcm16ToFloat32(base64Audio);
        if (float32Data.length === 0) return;

        // Compute RMS amplitude for the AudioSpiritOrb visualizer
        let sumSq = 0;
        for (let i = 0; i < float32Data.length; i += 8) {
          sumSq += float32Data[i] * float32Data[i];
        }
        const rms = Math.sqrt(sumSq / (float32Data.length / 8));
        setOutputLevel(Math.min(1, rms * 4.2));

        const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
        audioBuffer.copyToChannel(float32Data, 0);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;
        const startAt = Math.max(now + 0.01, nextStartTimeRef.current);
        nextStartTimeRef.current = startAt + audioBuffer.duration;

        activeSourcesRef.current.add(source);
        isSpeakingRef.current = true;
        setIsSpeaking(true);

        source.onended = () => {
          activeSourcesRef.current.delete(source);
          if (activeSourcesRef.current.size === 0) {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            setOutputLevel(0);
          }
        };

        source.start(startAt);
      } catch (err) {
        console.error('Error playing 24kHz PCM chunk:', err);
      }
    },
    [ensureOutputAudioContext]
  );

  const appendOrUpdateTranscript = useCallback(
    (speaker: 'user' | 'spirit', textChunk: string, pId: PersonaId) => {
      const cleaned = textChunk;
      if (!cleaned) return;
      const nowStr = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setTranscripts((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === speaker && last.id.startsWith('live-stream-')) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            text: `${last.text}${cleaned}`,
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: `live-stream-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            speaker,
            text: cleaned,
            timestamp: nowStr,
            personaId: pId,
          },
        ];
      });
    },
    []
  );

  const finalizeStreamingTranscripts = useCallback(() => {
    setTranscripts((prev) =>
      prev.map((item) =>
        item.id.startsWith('live-stream-')
          ? { ...item, id: `final-${item.id}` }
          : item
      )
    );
  }, []);

  const handleToolGrounding = useCallback(
    (toolName: string, result: any) => {
      const nowStr = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const artifact: GroundedArtifact = {
        id: `ground-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        toolName,
        timestamp: nowStr,
        terroirs: result?.matchedTerroirs,
        wines: result?.matchedWines || result?.recommendedBottles,
        recordedNote:
          result?.status === 'recorded'
            ? {
                wineName: result.wineName,
                rating: result.rating,
                sensorySummary: result.sensorySummary,
              }
            : undefined,
      };

      setGroundedArtifacts((prev) => [artifact, ...prev.slice(0, 5)]);

      if (result?.status === 'recorded' && onAutoRecordNote) {
        onAutoRecordNote({
          bottleId: activeBottle?.id || cellarBottles[0]?.id || 'custom',
          bottleName: result.wineName || activeBottle?.name || 'Pfälzer Lagenwein',
          vintage: activeBottle?.vintage || 2021,
          date: new Date().toISOString().split('T')[0],
          rating: Number(result.rating) || 94,
          noseNotes: result.sensorySummary || 'Vom Weingeist im Live-Dialog erfasst.',
          palateNotes: 'Mineralischer Zug und feine Säurestruktur.',
          finishNotes: 'Langer, salziger Nachhall.',
          occasion: 'Live-Sprachverkostung',
          personaId,
          spiritReflection: `Automatisch protokolliert durch ${PERSONA_MATRIX[personaId].name}.`,
        });
      }
    },
    [activeBottle, cellarBottles, onAutoRecordNote, personaId]
  );

  const stopLiveSession = useCallback(() => {
    stopAllPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // ignore
      }
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsLiveConnected(false);
    setIsConnecting(false);
    setIsThinking(false);
    setInputLevel(0);
    setOutputLevel(0);
  }, [stopAllPlayback]);

  const startLiveSession = useCallback(
    async (initialRitualPrompt?: string) => {
      setError(null);
      setIsConnecting(true);

      try {
        ensureOutputAudioContext();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: 'setup',
              personaId,
              cellarBottles,
              activeBottleId: activeBottle?.id || null,
              promptOptions,
              initialPrompt: initialRitualPrompt,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'session_ready') {
              setIsConnecting(false);
              setIsLiveConnected(true);

              // Start 16kHz microphone capture pipeline
              const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                  .webkitAudioContext;
              const inputCtx = new AudioCtx({ sampleRate: 16000 });
              inputAudioCtxRef.current = inputCtx;

              const source = inputCtx.createMediaStreamSource(stream);
              const processor = inputCtx.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;

              processor.onaudioprocess = (e) => {
                if (isMicMutedRef.current || ws.readyState !== WebSocket.OPEN) {
                  setInputLevel(0);
                  return;
                }
                const channelData = e.inputBuffer.getChannelData(0);

                let sumSq = 0;
                for (let i = 0; i < channelData.length; i += 8) {
                  sumSq += channelData[i] * channelData[i];
                }
                const rms = Math.sqrt(sumSq / (channelData.length / 8));
                setInputLevel(Math.min(1, rms * 5.0));

                const base64Audio = float32ToPcm16Base64(channelData);
                ws.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
              };

              source.connect(processor);
              processor.connect(inputCtx.destination);
              return;
            }

            if (msg.type === 'audio' && msg.audio) {
              setIsThinking(false);
              playPcm24kChunk(msg.audio);
              return;
            }

            if (msg.type === 'input_transcript' && msg.text) {
              appendOrUpdateTranscript('user', msg.text, personaId);
              return;
            }

            if (msg.type === 'output_transcript' && msg.text) {
              appendOrUpdateTranscript('spirit', msg.text, personaId);
              return;
            }

            if (msg.type === 'interrupted') {
              stopAllPlayback();
              finalizeStreamingTranscripts();
              return;
            }

            if (msg.type === 'turn_complete') {
              setIsThinking(false);
              finalizeStreamingTranscripts();
              return;
            }

            if (msg.type === 'tool_grounding') {
              handleToolGrounding(msg.toolName, msg.result);
              return;
            }

            if (msg.type === 'error') {
              setError(msg.message || 'Fehler in der Live-Verbindung.');
              setIsConnecting(false);
              setIsThinking(false);
              return;
            }

            if (msg.type === 'session_closed') {
              stopLiveSession();
            }
          } catch (parseErr) {
            console.error('Error parsing WS message:', parseErr);
          }
        };

        ws.onerror = () => {
          setError(
            'WebSocket-Verbindung zum Weingeist fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung.'
          );
          setIsConnecting(false);
        };

        ws.onclose = () => {
          setIsLiveConnected(false);
          setIsConnecting(false);
        };
      } catch (err: unknown) {
        setIsConnecting(false);
        const msg =
          err instanceof Error
            ? err.message
            : 'Mikrofonzugriff wurde verweigert oder ist nicht verfügbar.';
        setError(
          `Mikrofon-Hinweis: ${msg} — Sie können den Weingeist jederzeit über das Text- & Schnellfragen-Feld unten direkt ansprechen.`
        );
      }
    },
    [
      activeBottle,
      appendOrUpdateTranscript,
      cellarBottles,
      ensureOutputAudioContext,
      finalizeStreamingTranscripts,
      handleToolGrounding,
      personaId,
      playPcm24kChunk,
      promptOptions,
      stopAllPlayback,
      stopLiveSession,
    ]
  );

  // Sync cellar updates to active WebSocket session
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'sync_cellar',
          cellarBottles,
        })
      );
    }
  }, [cellarBottles]);

  // Send a text/ritual prompt either through the open Live session or the REST + TTS endpoint
  const sendSommelierPrompt = useCallback(
    async (promptText: string, speakResponse = true) => {
      const trimmed = promptText.trim();
      if (!trimmed) return;

      setError(null);
      const nowStr = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setTranscripts((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          speaker: 'user',
          text: trimmed,
          timestamp: nowStr,
          personaId,
        },
      ]);

      // If Live WebSocket is connected, send directly into the live stream
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isLiveConnected) {
        stopAllPlayback();
        setIsThinking(true);
        wsRef.current.send(
          JSON.stringify({
            type: 'text',
            text: trimmed,
          })
        );
        return;
      }

      // Otherwise use the REST consultation + RAG + 24kHz TTS endpoint
      setIsThinking(true);
      try {
        if (speakResponse) {
          ensureOutputAudioContext();
        }
        const response = await fetch('/api/sommelier/consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmed,
            personaId,
            cellarBottles,
            activeBottleId: activeBottle?.id || null,
            promptOptions,
            synthesizeAudio: speakResponse,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Fehler bei der Sommelier-Anfrage.');
        }

        if (Array.isArray(data.toolEvents)) {
          for (const ev of data.toolEvents) {
            handleToolGrounding(ev.toolName, ev.result);
          }
        }

        setTranscripts((prev) => [
          ...prev,
          {
            id: `spirit-${Date.now()}`,
            speaker: 'spirit',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            personaId,
            toolUsed: data.toolEvents?.[0]?.toolName,
          },
        ]);

        if (data.audioBase64 && speakResponse) {
          stopAllPlayback();
          playPcm24kChunk(data.audioBase64);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Fehler bei der Verbindung zum Pfälzer Weingeist.'
        );
      } finally {
        setIsThinking(false);
      }
    },
    [
      activeBottle,
      cellarBottles,
      ensureOutputAudioContext,
      handleToolGrounding,
      isLiveConnected,
      personaId,
      playPcm24kChunk,
      promptOptions,
      stopAllPlayback,
    ]
  );

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, [stopLiveSession]);

  return {
    isLiveConnected,
    isConnecting,
    isMicMuted,
    setIsMicMuted,
    isSpeaking,
    isThinking,
    inputLevel,
    outputLevel,
    error,
    setError,
    transcripts,
    groundedArtifacts,
    startLiveSession,
    stopLiveSession,
    stopAllPlayback,
    sendSommelierPrompt,
  };
}
