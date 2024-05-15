'use client';

import { z } from 'zod';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useParams } from 'next/navigation';
import ApiResponse from '@/types/apiResponse';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { messageSchema } from '@/schemas/messageSchema';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function SendMessage() {
  const { toast } = useToast();
  const { username } = useParams<{ username: string }>();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/send-message`, {
        username,
        message: data.content,
      });
      toast({
        title: response.data.message,
        description: 'Your message has been sent successfully',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('Message not send', axiosError.response?.data.message);
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message || 'An error occurred while sending the message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Public Profile Link</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 flex flex-col items-center"
        >
          <FormLabel>Send Anonymous Message to @{username}</FormLabel>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none border rounded-md p-5 focus:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <Separator className="my-6" />

      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
