import {Message} from '@/models/User';

export default interface ApiResponse {
  message: string;
  success: boolean;
  messages?: Message[];
  isAcceptingMessages?: boolean;
}
