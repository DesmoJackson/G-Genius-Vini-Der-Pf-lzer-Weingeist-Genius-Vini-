import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  FunctionDeclaration,
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Type,
} from '@google/genai';
import {
  INITIAL_CELLAR_BOTTLES,
  PERSONA_MATRIX,
  PFALZ_TERROIR_PROFILES,
  PersonaId,
  WineBottle,
  buildChronosVibeSystemPrompt,
} from './src/data/pfalzDomain.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please check Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const searchPfalzTerroirDeclaration: FunctionDeclaration = {
  name: 'searchPfalzTerroir',
  description:
    'Durchsucht die verifizierte Pfälzer Terroir-, Geologie- und VDP.Grosse-Lagen-Datenbank (Buntsandstein, Kalkmergel, Basalt/Pechstein, Muschelkalk, Rotliegendes sowie analytische Säure- und Restzuckerwerte).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description:
          'Suchbegriff wie Lagenname (Pechstein, Kalkofen, Saumagen, Sonnenberg, Kastanienbusch), Rebsorte (Riesling, Spätburgunder) oder Bodenart (Buntsandstein, Kalkmergel, Basalt, Muschelkalk).',
      },
    },
    required: ['query'],
  },
};

const inspectUserCellarDeclaration: FunctionDeclaration = {
  name: 'inspectUserCellar',
  description:
    'Prüft den aktuellen digitalen Weinkeller des Nutzers nach vorrätigen Flaschen, Trinkfenstern oder passenden Speisenbegleitungen (Food Pairing).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filterOrDish: {
        type: Type.STRING,
        description:
          'Optionales Gericht (z.B. Steinbutt, Rehrücken, Saumagen, Käse) oder Rebsorte/Filter zur Abstimmung mit dem Kellerbestand.',
      },
    },
    required: ['filterOrDish'],
  },
};

const recordTastingImpressionDeclaration: FunctionDeclaration = {
  name: 'recordTastingImpression',
  description:
    'Speichert eine neue Verkostungsnotiz oder Bewertung (85-100 Punkte) für einen Wein im digitalen Weinkeller des Nutzers.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      wineName: {
        type: Type.STRING,
        description: 'Name des verkosteten Weins.',
      },
      rating: {
        type: Type.NUMBER,
        description: 'Bewertung auf der 100-Punkte-Skala (z.B. 95).',
      },
      sensorySummary: {
        type: Type.STRING,
        description: 'Zusammenfassung von Nase, Gaumen und Abgang.',
      },
    },
    required: ['wineName', 'rating', 'sensorySummary'],
  },
};

const SOMMELIER_TOOLS: FunctionDeclaration[] = [
  searchPfalzTerroirDeclaration,
  inspectUserCellarDeclaration,
  recordTastingImpressionDeclaration,
];

function executeDomainTool(
  name: string,
  args: Record<string, unknown>,
  cellarBottles: WineBottle[]
) {
  const q = String(args.query || args.filterOrDish || args.wineName || '')
    .toLowerCase()
    .trim();

  if (name === 'searchPfalzTerroir') {
    const matchedTerroirs = PFALZ_TERROIR_PROFILES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.soilCategory.toLowerCase().includes(q) ||
        t.keyVillages.some((v) => v.toLowerCase().includes(q)) ||
        t.flagshipSites.some((s) => s.toLowerCase().includes(q)) ||
        t.sensoryImprint.toLowerCase().includes(q)
    );

    const matchedWines = cellarBottles.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.village.toLowerCase().includes(q) ||
        b.soilType.toLowerCase().includes(q) ||
        b.grape.toLowerCase().includes(q) ||
        b.winery.toLowerCase().includes(q)
    );

    return {
      matchedTerroirs:
        matchedTerroirs.length > 0
          ? matchedTerroirs
          : PFALZ_TERROIR_PROFILES.slice(0, 2),
      matchedWines:
        matchedWines.length > 0 ? matchedWines : cellarBottles.slice(0, 2),
      groundingSource: 'Pfälzer Terroir & VDP.Grosse Lagen Vector Registry',
    };
  }

  if (name === 'inspectUserCellar') {
    const matches = cellarBottles.filter(
      (b) =>
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.grape.toLowerCase().includes(q) ||
        b.soilType.toLowerCase().includes(q) ||
        b.foodPairing.some((fp) => fp.toLowerCase().includes(q)) ||
        b.sensoryProfile.nose.toLowerCase().includes(q) ||
        b.sensoryProfile.palate.toLowerCase().includes(q)
    );
    const results = matches.length > 0 ? matches : cellarBottles;
    return {
      totalBottlesInCellar: cellarBottles.reduce(
        (sum, b) => sum + b.quantity,
        0
      ),
      recommendedBottles: results.slice(0, 4),
      groundingSource: 'Digital Cellar Inventory',
    };
  }

  if (name === 'recordTastingImpression') {
    return {
      status: 'recorded',
      wineName: String(args.wineName || 'Pfälzer Gewächs'),
      rating: Number(args.rating || 94),
      sensorySummary: String(args.sensorySummary || ''),
      timestamp: new Date().toISOString().split('T')[0],
      groundingSource: 'Cellar Tasting Log',
    };
  }

  return { status: 'unknown_tool' };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    if (url.pathname === '/ws/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // WebSocket Bridge for Gemini Multimodal Live API (gemini-3.8-live)
  wss.on('connection', (clientWs: WebSocket) => {
    let liveSessionPromise: Promise<any> | null = null;
    let currentCellar: WineBottle[] = [...INITIAL_CELLAR_BOTTLES];
    let isClosed = false;

    const sendSafe = (payload: Record<string, unknown>) => {
      if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    clientWs.on('message', async (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());

        if (msg.type === 'setup') {
          const personaId: PersonaId = msg.personaId || 'dionysian';
          const persona = PERSONA_MATRIX[personaId] || PERSONA_MATRIX.dionysian;
          if (Array.isArray(msg.cellarBottles) && msg.cellarBottles.length > 0) {
            currentCellar = msg.cellarBottles;
          }
          const activeBottle = currentCellar.find(
            (b) => b.id === msg.activeBottleId
          );

          const systemInstruction = buildChronosVibeSystemPrompt(
            personaId,
            currentCellar,
            activeBottle,
            msg.promptOptions
          );

          const ai = getAiClient();

          liveSessionPromise = ai.live.connect({
            model: 'gemini-3.8-live',
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: persona.voiceName,
                  },
                },
              },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              tools: [{ functionDeclarations: SOMMELIER_TOOLS }],
              systemInstruction,
            },
            callbacks: {
              onopen: () => {
                sendSafe({
                  type: 'session_ready',
                  personaId,
                  voiceName: persona.voiceName,
                  model: 'gemini-3.8-live',
                });
              },
              onmessage: (message: LiveServerMessage) => {
                const content = message.serverContent;

                if (content?.inputTranscription?.text) {
                  sendSafe({
                    type: 'input_transcript',
                    text: content.inputTranscription.text,
                  });
                }

                if (content?.outputTranscription?.text) {
                  sendSafe({
                    type: 'output_transcript',
                    text: content.outputTranscription.text,
                  });
                }

                for (const part of content?.modelTurn?.parts ?? []) {
                  if (part.inlineData?.data) {
                    sendSafe({
                      type: 'audio',
                      audio: part.inlineData.data,
                    });
                  }
                  if (part.text) {
                    sendSafe({
                      type: 'text',
                      text: part.text,
                    });
                  }
                }

                if (content?.interrupted) {
                  sendSafe({ type: 'interrupted' });
                }

                if (content?.turnComplete) {
                  sendSafe({ type: 'turn_complete' });
                }

                if (message.toolCall?.functionCalls) {
                  for (const call of message.toolCall.functionCalls) {
                    const toolResult = executeDomainTool(
                      call.name || '',
                      (call.args as Record<string, unknown>) || {},
                      currentCellar
                    );

                    sendSafe({
                      type: 'tool_grounding',
                      toolName: call.name,
                      args: call.args,
                      result: toolResult,
                    });

                    if (liveSessionPromise) {
                      liveSessionPromise
                        .then((s) => {
                          s.sendToolResponse({
                            functionResponses: [
                              {
                                id: call.id,
                                name: call.name,
                                response: { result: toolResult },
                              },
                            ],
                          });
                        })
                        .catch((err: unknown) => {
                          console.error('Error sending tool response:', err);
                        });
                    }
                  }
                }
              },
              onerror: (err: unknown) => {
                console.error('Live API error:', err);
                sendSafe({
                  type: 'error',
                  message:
                    err instanceof Error
                      ? err.message
                      : 'Fehler in der Gemini Live Audio-Verbindung.',
                });
              },
              onclose: () => {
                sendSafe({ type: 'session_closed' });
              },
            },
          });

          await liveSessionPromise;

          // If an initial greeting or ritual prompt was requested on setup:
          if (msg.initialPrompt && liveSessionPromise) {
            const session = await liveSessionPromise;
            session.sendClientContent({
              turns: [{ role: 'user', parts: [{ text: msg.initialPrompt }] }],
              turnComplete: true,
            });
          }
          return;
        }

        if (msg.type === 'audio' && msg.audio && liveSessionPromise) {
          const session = await liveSessionPromise;
          session.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
          return;
        }

        if (msg.type === 'text' && msg.text && liveSessionPromise) {
          const session = await liveSessionPromise;
          session.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: msg.text }] }],
            turnComplete: true,
          });
          return;
        }

        if (msg.type === 'sync_cellar' && Array.isArray(msg.cellarBottles)) {
          currentCellar = msg.cellarBottles;
          return;
        }
      } catch (err: unknown) {
        console.error('WebSocket message error:', err);
        sendSafe({
          type: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'Verbindungsfehler zum Weingeist.',
        });
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      if (liveSessionPromise) {
        liveSessionPromise
          .then((s) => s.close())
          .catch(() => {
            // ignore close errors
          });
      }
    });
  });

  // REST Consultation Endpoint (Text + RAG Tool Grounding + Optional TTS Audio)
  app.post('/api/sommelier/consult', async (req, res) => {
    try {
      const {
        prompt,
        personaId = 'dionysian',
        cellarBottles = INITIAL_CELLAR_BOTTLES,
        activeBottleId = null,
        promptOptions,
        synthesizeAudio = true,
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Bitte geben Sie eine Frage ein.' });
        return;
      }

      const ai = getAiClient();
      const persona =
        PERSONA_MATRIX[personaId as PersonaId] || PERSONA_MATRIX.dionysian;
      const activeBottle = (cellarBottles as WineBottle[]).find(
        (b) => b.id === activeBottleId
      );

      const systemInstruction = buildChronosVibeSystemPrompt(
        persona.id,
        cellarBottles,
        activeBottle,
        promptOptions
      );

      const toolEvents: Array<{
        toolName: string;
        args: Record<string, unknown>;
        result: unknown;
      }> = [];

      const response1 = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: SOMMELIER_TOOLS }],
        },
      });

      let finalReplyText = response1.text || '';
      const functionCalls = response1.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const previousContent = response1.candidates?.[0]?.content;
        const functionResponseParts = functionCalls.map((fc) => {
          const result = executeDomainTool(
            fc.name || '',
            (fc.args as Record<string, unknown>) || {},
            cellarBottles
          );
          toolEvents.push({
            toolName: fc.name || 'searchPfalzTerroir',
            args: (fc.args as Record<string, unknown>) || {},
            result,
          });
          return {
            functionResponse: {
              id: fc.id,
              name: fc.name,
              response: { result },
            },
          };
        });

        if (previousContent) {
          const response2 = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              { role: 'user', parts: [{ text: prompt }] },
              previousContent,
              { role: 'user', parts: functionResponseParts },
            ],
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: SOMMELIER_TOOLS }],
            },
          });
          finalReplyText = response2.text || finalReplyText;
        }
      }

      // Optional TTS synthesis via gemini-3.8-flash-lite-tts so text queries also speak
      let audioBase64: string | null = null;
      if (synthesizeAudio && finalReplyText) {
        try {
          const ttsResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: finalReplyText,
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: persona.voiceName,
                  },
                },
              },
            },
          });
          const audioPart =
            ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (audioPart?.data) {
            audioBase64 = audioPart.data;
          }
        } catch (ttsErr) {
          console.warn('Optional TTS synthesis skipped:', ttsErr);
        }
      }

      res.json({
        reply: finalReplyText,
        personaId: persona.id,
        voiceName: persona.voiceName,
        toolEvents,
        audioBase64,
      });
    } catch (err: unknown) {
      console.error('Consult API error:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Unbekannter Fehler bei der Anfrage an den Weingeist.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Genius Vini server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
