'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: crypto.randomUUID(),
          title,
          body,
          targetUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const data = await response.json();

      if (data.result.successfulTokens.length > 0) {
        toast.success('Notification sent successfully!');
      } else {
        toast.warning('No active notification tokens found');
      }

      // Reset form
      setTitle('');
      setBody('');
      setTargetUrl('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Send Notification</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder="Enter notification title"
            className="bg-transparent"
            maxLength={32}
            required
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-1">
            Body
          </label>
          <Textarea
            id="body"
            value={body}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setBody(e.target.value)
            }
            placeholder="Enter notification body"
            maxLength={128}
            required
          />
        </div>
        <div>
          <label htmlFor="targetUrl" className="block text-sm font-medium mb-1">
            Target URL
          </label>
          <Input
            id="targetUrl"
            type="url"
            value={targetUrl}
            className="bg-transparent"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTargetUrl(e.target.value)
            }
            placeholder="Enter target URL"
            maxLength={256}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Notification'}
        </Button>
      </form>
    </div>
  );
}
