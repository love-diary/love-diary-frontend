/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Agent Service Proxy
 * HTTP client for communicating with the Agent Service
 */

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
const AGENT_SERVICE_SECRET = process.env.AGENT_SERVICE_SECRET || 'development-secret';

export interface CreateAgentRequest {
  playerName: string;
  playerGender: string;
}

export interface CreateAgentResponse {
  status: 'created' | 'already_exists';
  firstMessage?: string;
  backstorySummary?: string;
  agentAddress?: string;
}

export interface SendMessageRequest {
  message: string;
  playerName: string;
  timestamp: number;
}

export interface SendMessageResponse {
  response: string;
  timestamp: number;
  affectionChange: number;
  agentStatus: 'active' | 'woke_from_hibernation';
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  active_agents: number;
  total_messages_processed: number;
  uptime_seconds: number;
}

export interface CharacterInfoResponse {
  affectionLevel: number;
  backstory: string;
  recentConversation: Array<{
    sender: 'player' | 'character';
    text: string;
    timestamp: number;
  }>;
  totalMessages: number;
  playerName: string;
  playerGender: string;
}

class AgentServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentServiceError';
  }
}

/**
 * Base HTTP client with auth and error handling
 */
async function agentServiceFetch(
  endpoint: string,
  options: RequestInit = {},
  playerAddress?: string
): Promise<Response> {
  const url = `${AGENT_SERVICE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AGENT_SERVICE_SECRET}`,
  };

  if (playerAddress) {
    headers['X-Player-Address'] = playerAddress;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Add timeout (30 seconds for agent creation, 20 seconds for messages)
      signal: AbortSignal.timeout(endpoint.includes('/create') ? 30000 : 20000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // FastAPI returns error in 'detail' field, not 'message'
      const errorMessage = errorData.detail || errorData.message || errorData.error || `Agent service error: ${response.statusText}`;
      throw new AgentServiceError(
        errorMessage,
        response.status,
        errorData
      );
    }

    return response;
  } catch (error: any) {
    if (error instanceof AgentServiceError) {
      throw error;
    }

    // Network or timeout error
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      const timeoutSeconds = endpoint.includes('/create') ? 30 : 20;
      throw new AgentServiceError(
        `Frontend → Agent Service timeout (>${timeoutSeconds}s)`,
        504
      );
    }

    throw new AgentServiceError(
      `Failed to connect to agent service: ${error.message}`,
      503
    );
  }
}

/**
 * Create a new agent with backstory generation
 */
export async function createAgent(
  characterId: number,
  playerAddress: string,
  request: CreateAgentRequest
): Promise<CreateAgentResponse> {
  const response = await agentServiceFetch(
    `/agent/${characterId}/create`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    playerAddress
  );

  return response.json();
}

/**
 * Send message to agent
 */
export async function sendMessageToAgent(
  characterId: number,
  playerAddress: string,
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  const response = await agentServiceFetch(
    `/agent/${characterId}/message`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    playerAddress
  );

  return response.json();
}

/**
 * Get character info (affection level, backstory, recent conversation)
 */
export async function getCharacterInfo(
  characterId: number,
  playerAddress: string
): Promise<CharacterInfoResponse> {
  const response = await agentServiceFetch(
    `/agent/${characterId}/info`,
    {
      method: 'GET',
    },
    playerAddress
  );

  return response.json();
}

/**
 * Check agent service health
 */
export async function checkAgentServiceHealth(): Promise<HealthResponse> {
  const response = await agentServiceFetch('/health', {
    method: 'GET',
  });

  return response.json();
}

/**
 * Retry logic for transient failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error instanceof AgentServiceError && error.statusCode < 500) {
        throw error;
      }

      // Last attempt - throw error
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export { AgentServiceError };
