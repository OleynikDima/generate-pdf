export interface MessageResponse {
  status: boolean;
  error: string;
  path: string;
}

export interface PaylodToService {
  callbackUrl: string;
  body: {
    status: boolean;
    orderId: string;
    path: string;
  };
}
