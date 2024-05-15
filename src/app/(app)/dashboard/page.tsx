'use client';
import { User } from 'next-auth';
import { Message } from '@/models/User';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ApiResponse from '@/types/apiResponse';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCard } from '@/components/messageCard';
import { useState, useCallback, useEffect } from 'react';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import Link from 'next/link';

export default function Dashboard() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { watch, setValue, register } = form;
  const acceptMessages: boolean = watch('acceptMessages');

  const acceptMessagesStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-messages`);
      setValue('acceptMessages', response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error(axiosError.response?.data);
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Failed to fetch accept messages status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>(`/api/get-messages`);
        setMessages(response?.data?.messages || []);
        if (refresh) {
          toast({
            title: 'Messages refreshed',
            description: 'Messages have been refreshed',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error('Error fetching message', axiosError.response?.data);
        toast({
          title: 'Error',
          description: axiosError.response?.data?.message || 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setMessages, setIsLoading, toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    acceptMessagesStatus();
  }, [session, setIsLoading, fetchMessages, setIsSwitching, acceptMessagesStatus]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        isAcceptingMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response?.data?.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message status',
        variant: 'destructive',
      });
    }
  };

  if (!session || !session.user) {
    return (
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
        <p className="text-lg">You must be signed in to view this page.</p>
        <Link href="/sign-in">
          <Button className="mt-4 inline-block text-white font-bold py-2 px-4 rounded">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const { username } = session.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/user/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitching}
        />
        <span className="ml-2">Accept Messages: {acceptMessages ? 'ON' : 'OFF'}</span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}
