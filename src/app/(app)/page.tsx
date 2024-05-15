'use client';

import { Mail } from 'lucide-react';
import messages from '@/message.json';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export default function Home() {
  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 min-h-[90vh] md:px-24 py-12 bg-gray-800 text-white">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">Whispers Unveiled : Anonymously Yours</h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            Whispers Unveiled - Where your identity remains a secret.
          </p>
        </section>

        <Carousel plugins={[Autoplay({ delay: 2500 })]} className="w-full max-w-lg md:max-w-xl">
          <CarouselContent>
            {messages.map((message: any, index: number) => (
              <CarouselItem key={index} className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0" />
                    <div>
                      <p>{message.content}</p>
                      <p className="text-xs mt-3 text-muted-foreground">{message.received}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>

      <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
        © 2023 Suman Sharma. All rights reserved.
      </footer>
    </>
  );
}
