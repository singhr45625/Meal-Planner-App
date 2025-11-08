class ApiService {
  private baseURL: string = 'https://meal-api-kjh0.onrender.com/api';
  private token: string | null = null;

  constructor() {
    // Don't load token here - it will be set by useAuth hook
  }

  setToken(token: string | null) {
    this.token = token;
    console.log('ApiService: Token updated', token ? 'Token set' : 'Token cleared');
  }

  clearToken() {
    this.token = null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Only add Authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('Adding Authorization header with token');
    } else {
      console.log('No token available for Authorization header');
    }

    // Ensure method is always defined and uppercase
    const method = options.method || 'GET';

    const config: RequestInit = {
      method: method.toUpperCase(), // Ensure method is uppercase
      ...options,
      headers,
    };

    try {
      console.log(`API Request: ${url}`, { 
        method: config.method,
        hasAuth: !!this.token,
        endpoint 
      });
      
      const response = await fetch(url, config);
      
      // Handle 404 specifically
      if (response.status === 404) {
        throw new Error(`Route ${endpoint} not found (404)`);
      }

      // Handle 401 unauthorized
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // If it's HTML or other content, it might be a server error page
        if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
          throw new Error('Server returned HTML instead of JSON - possible server error');
        }
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Test if the base URL is reachable
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseURL);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default new ApiService();